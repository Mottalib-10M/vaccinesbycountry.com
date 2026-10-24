/**
 * The calculators of the site, rendered by components/calc/SpecTool.tsx (full tool) and MiniSim.tsx (mini-simulator).
 * CDC levels come from src/data/dest.json (242 destination pages); prices from the fee schedules of 9 US public
 * health departments; tablets from the CDC Yellow Book regimens and NADAC. This file ships to the browser.
 */
import type { ToolSpec, V, Input, ToolOut } from './tool-types';
import { formatMoney, formatNumber } from './format';
import { mergeAdvice, yellowFeverForTrip, malariaForTrip, type YfVerdict } from './engine/itinerary';
import { plan } from './engine/timeline';
import { quoteAt, quoteRange, antimalarialCost, median, dosesToPay } from './engine/cost';
import type { FeeSource, VaccineSchedule } from './engine/types';
import {
  DESTS, DEST_OPTS, FEE_SOURCES, ANTIMALARIALS, NADAC_ITEMS, NHS_LIST, VAX_OF, PRICE_ONLY, TRAVEL_KEYS, VACCINE, DRUG, LEVEL_TEXT,
  dest, hasDest, expand, sched, priceOf, listPrice, diseaseLabel, levelOf,
} from './data';

export const usd = (x: number) => formatMoney(Math.round(x), 0);
const n = (v: V, k: string) => Number(v[k]) || 0;
const s = (v: V, k: string) => String(v[k] ?? '');
const days = (x: number) => `${formatNumber(x, 0)} day${x === 1 ? '' : 's'}`;
const range = (lo: number, hi: number) => (Math.round(lo) === Math.round(hi) ? usd(lo) : `${usd(lo)} to ${usd(hi)}`);
const list = (xs: string[]) => (xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);
/** Today and the departure date, in days: the timeline engine works on dates, the tools on "weeks from now". */
const T0 = '2026-01-01';
const depOf = (weeks: number) => { const d = new Date(Date.parse(`${T0}T00:00:00Z`) + Math.round(weeks * 7) * 86_400_000); return d.toISOString().slice(0, 10); };
const spanOf = (sc: VaccineSchedule, age: number) => { const p = plan([sc], T0, '2030-01-01', age)[0]; return Math.round((Date.parse(`2030-01-01T00:00:00Z`) - Date.parse(`${p.startBy}T00:00:00Z`)) / 86_400_000); };

const ORIGIN_OPTS = [{ value: 'none', label: 'A country with no yellow fever risk (US, UK, Canada, Australia…)' }, ...DEST_OPTS];
const STOP_OPTS = [{ value: 'none', label: 'No other country' }, ...DEST_OPTS];
const DEPT_OPTS = [{ value: 'all', label: `All ${FEE_SOURCES.length} health departments (median)` }, ...FEE_SOURCES.map((f) => ({ value: f.id, label: `${f.name}, ${f.state}` }))];
const YN = [{ value: 'no', label: 'No' }, { value: 'yes', label: 'Yes' }];
const pick = (v: V, ...keys: string[]) => keys.map((k) => s(v, k)).filter((x) => x && x !== 'none' && hasDest(x));

const STOP = (id: string, label: string, def: string, first = false): Input => ({ kind: 'select', id, label, def, options: first ? DEST_OPTS : STOP_OPTS });
const ORIGIN = (def = 'none'): Input => ({ kind: 'select', id: 'from', label: 'Where the trip starts', def, options: ORIGIN_OPTS, help: 'Decides the yellow fever certificate at the first border.' });
const WEEKS = (def = 6): Input => ({ id: 'wk', label: 'Weeks until departure', def, unit: 'weeks', max: 52, decimals: 1 });
const AGE = (def = 35): Input => ({ id: 'age', label: 'Age of the traveler', def, unit: 'years', max: 100 });
const DEPT = (def = 'all'): Input => ({ kind: 'select', id: 'dept', label: 'Price list', def, options: DEPT_OPTS, help: 'Self-pay prices published by US county health departments.' });

const YF_TEXT: Record<YfVerdict, string> = {
  required: 'Certificate required at the border',
  requiredIfRiskOrigin: 'Required only if you arrive from a risk country',
  recommended: 'CDC recommends the vaccine',
  considered: 'CDC: generally not recommended, may be considered',
  notNeeded: 'Not needed on this route',
};

/** Per-dose median price of a fee key, or null. */
const med = (fee: string) => priceOf(fee)?.median ?? null;

/** Price of a set of schedules at one department, a missing vaccine counted at the median of the others. */
function priceAt(dept: string, chosen: VaccineSchedule[], opts: { beforeTravelOnly?: boolean } = {}) {
  if (dept === 'all') {
    const r = quoteRange(FEE_SOURCES, chosen, opts);
    const vaccinesOnly = chosen.reduce((a, sc) => a + (med(sc.fee) ?? 0) * dosesToPay(sc, opts), 0);
    return r ? { total: r.median, lo: r.min, hi: r.max, n: r.n, missing: [] as string[], vaccines: vaccinesOnly, fees: null as number | null } : { total: vaccinesOnly, lo: null, hi: null, n: 0, missing: [] as string[], vaccines: vaccinesOnly, fees: null as number | null };
  }
  const src = FEE_SOURCES.find((f) => f.id === dept)!;
  const q = quoteAt(src, chosen, opts);
  const filled = q.missing.reduce((a, id) => { const sc = sched(id); return a + (med(sc.fee) ?? 0) * dosesToPay(sc, opts); }, 0);
  return { total: q.total + filled, lo: null, hi: null, n: 1, missing: q.missing, vaccines: q.vaccines + filled, fees: q.fees };
}

// ---------------------------------------------------------------- itinerary
function tripOut(v: V): ToolOut {
  const stops = pick(v, 's1', 's2', 's3').map((x) => expand(dest(x)));
  const from = s(v, 'from');
  const origin = from !== 'none' && hasDest(from) ? expand(dest(from)) : null;
  const age = n(v, 'age');
  const wk = n(v, 'wk');
  const items = mergeAdvice(stops).filter((m) => TRAVEL_KEYS.includes(m.disease) && ['most', 'some', 'consider'].includes(m.level));
  const yf = yellowFeverForTrip(stops, origin);
  const mal = malariaForTrip(stops).filter((m) => m.prescription);
  const strong = items.filter((m) => m.level === 'most' || m.level === 'some');
  const yfNeed = yf.filter((y) => y.verdict === 'required' || y.verdict === 'recommended');
  const chosen = [...strong.filter((m) => VAX_OF[m.disease]).map((m) => sched(VAX_OF[m.disease])), ...(yfNeed.length ? [sched('yellowFever')] : [])];
  const lead = chosen.map((sc) => ({ id: sc.id, span: spanOf(sc, age) }));
  const longest = lead.reduce((a, b) => (b.span > a.span ? b : a), { id: '', span: 0 });
  const late = longest.span > wk * 7;
  const price = priceAt('all', chosen, { beforeTravelOnly: true });
  const count = strong.length + (yfNeed.length ? 1 : 0);
  const rows: Array<[string, string]> = [
    ['Yellow fever', yf.length ? list([...new Set(yf.map((y) => `${YF_TEXT[y.verdict]} (${y.country})`))].slice(0, 3)) : 'Choose a country'],
    ['Malaria', mal.length ? `Prescription tablets for areas of ${list(mal.map((m) => m.country))}` : 'CDC lists no malaria medicine for these countries'],
    ['Longest lead time', longest.span ? `${days(longest.span)} before departure (${VACCINE[longest.id]})${late ? ': not enough time for full protection' : ''}` : 'No series with a lead time'],
    ['Published price, these vaccines', chosen.length ? (price.lo != null ? `${usd(price.total)} median, ${range(price.lo, price.hi!)}` : `${usd(price.total)} (vaccines only, median prices)`) : 'Nothing to price'],
  ];
  return {
    label: 'Travel vaccines CDC lists for most or some travelers on this trip',
    value: `${count} vaccine${count === 1 ? '' : 's'}`,
    sub: `plus ${items.length - strong.length} to discuss and routine vaccines up to date${late ? ' · lead time too short for one series' : ''}`,
    rows,
    table: {
      caption: 'CDC level for each disease on this itinerary, strongest country first. The full CDC wording is on each country page.',
      headers: ['Disease', 'CDC level', 'Where', 'Start at least', 'Median price per dose'],
      rows: [
        ...(yf.some((y) => y.verdict !== 'notNeeded') ? [['Yellow fever', YF_TEXT[(yf.find((y) => y.verdict === 'required') ?? yf.find((y) => y.verdict !== 'notNeeded'))!.verdict], yf.filter((y) => y.verdict !== 'notNeeded').map((y) => y.country).join(', '), `${days(10)} before`, med('yellowFever') ? usd(med('yellowFever')!) : '']] : []),
        ...items.map((m) => {
          const sc = VAX_OF[m.disease] ? sched(VAX_OF[m.disease]) : null;
          const fee = sc?.fee ?? PRICE_ONLY[m.disease];
          return [diseaseLabel(m.disease), LEVEL_TEXT[m.level], m.where.join(', '), sc ? (spanOf(sc, age) ? `${days(spanOf(sc, age))} before` : 'Any time before') : 'Ask', fee && med(fee) ? usd(med(fee)!) : 'Not listed'];
        }),
      ],
      align: ['l', 'l', 'l', 'l', 'r'],
    },
    note: `Levels from the CDC destination pages; age ${formatNumber(age, 0)} used for the Japanese encephalitis schedule. A list to take to a doctor, nurse or pharmacist, not medical advice.`,
  };
}

// ---------------------------------------------------------------- trip cost
const COST_KEYS: Array<{ id: string; label: string; opts?: Array<{ value: string; label: string }>; def: string; adv?: boolean }> = [
  { id: 'hepA', label: 'Hepatitis A', def: 'yes' },
  { id: 'typ', label: 'Typhoid', def: 'inj', opts: [{ value: 'none', label: 'No' }, { value: 'inj', label: 'Shot' }, { value: 'oral', label: 'Oral' }] },
  { id: 'yellowFever', label: 'Yellow fever', def: 'no' },
  { id: 'je', label: 'Japanese encephalitis', def: 'no' },
  { id: 'rabies', label: 'Rabies (2 doses)', def: 'no', adv: true },
  { id: 'cholera', label: 'Cholera (oral)', def: 'no', adv: true },
  { id: 'hepB', label: 'Hepatitis B', def: 'none', adv: true, opts: [{ value: 'none', label: 'No' }, { value: 'hepB_2dose', label: '2 doses' }, { value: 'hepB_3dose', label: '3 doses' }] },
  { id: 'ipv', label: 'Polio booster', def: 'no', adv: true },
  { id: 'chikungunya', label: 'Chikungunya', def: 'no', adv: true },
];
const DRUG_OPTS = [{ value: 'none', label: 'No malaria tablets' }, ...ANTIMALARIALS.filter((a) => a.nadac).map((a) => ({ value: a.id, label: DRUG[a.id] }))];
function chosenOf(v: V): VaccineSchedule[] {
  const out: VaccineSchedule[] = [];
  for (const k of COST_KEYS) {
    const x = s(v, k.id);
    if (k.id === 'typ') { if (x === 'inj') out.push(sched('typhoid_inj')); if (x === 'oral') out.push(sched('typhoid_oral')); continue; }
    if (k.id === 'hepB') { if (x !== 'none' && x) out.push(sched(x)); continue; }
    if (x === 'yes') out.push(sched(k.id));
  }
  return out;
}
function costOut(v: V): ToolOut {
  const chosen = chosenOf(v);
  const dept = s(v, 'dept') || 'all';
  const p = priceAt(dept, chosen);
  const drug = s(v, 'drug');
  const am = drug && drug !== 'none' ? ANTIMALARIALS.find((a) => a.id === drug) : undefined;
  const pills = am ? antimalarialCost(am, n(v, 'td'), NADAC_ITEMS) : null;
  const total = p.total + (pills?.acquisitionCost ?? 0);
  const deptName = dept === 'all' ? 'median of the departments that list every vaccine chosen' : DEPT_OPTS.find((o) => o.value === dept)!.label;
  const rows: Array<[string, string, number?]> = chosen.map((sc) => {
    const price = dept === 'all' ? med(sc.fee) : (FEE_SOURCES.find((f) => f.id === dept)!.prices[sc.fee] ?? med(sc.fee));
    const d = dosesToPay(sc);
    return [`${VACCINE[sc.id]}, ${d} ${sc.doses_billed ? 'pack' : d === 1 ? 'dose' : 'doses'}${p.missing.includes(sc.id) ? ' (not listed here: median)' : ''}`, usd((price ?? 0) * d), (price ?? 0) * d];
  });
  if (p.fees != null && p.fees > 0) rows.push(['Visit and administration fees', usd(p.fees), p.fees]);
  if (pills) rows.push([`${DRUG[am!.id]}, ${formatNumber(pills.tablets, 0)} tablets (pharmacy cost)`, pills.acquisitionCost != null ? usd(pills.acquisitionCost) : 'no NADAC price', pills.acquisitionCost ?? 0]);
  const table = {
    caption: 'The same vaccines at each department that lists all of them (vaccines, visit and administration fees).',
    headers: ['Health department', 'Vaccines', 'Fees', 'Total'],
    rows: FEE_SOURCES.map((f) => ({ f, q: quoteAt(f, chosen) })).filter((x) => !x.q.missing.length && x.q.lines.length).sort((a, b) => a.q.total - b.q.total).map(({ f, q }) => [`${f.name}, ${f.state}`, usd(q.vaccines), f.visit_fee == null && f.admin_first == null && !f.includes_admin ? 'not stated' : usd(q.fees), usd(q.total)]),
    align: ['l', 'r', 'r', 'r'] as Array<'l' | 'r'>,
  };
  return {
    label: 'Self-pay cost of these travel vaccines',
    value: usd(total),
    sub: dept === 'all' && p.lo != null ? `${range(p.lo, p.hi!)} across ${p.n} departments, before tablets` : deptName,
    rows: rows.length ? rows : [['Choose at least one vaccine', '']],
    table: table.rows.length ? table : undefined,
    note: `Prices published by US county health departments (read ${FEES_DATE}). Insurance may cover some travel vaccines; ask your plan. Tablet cost is what pharmacies pay (NADAC), before their fee.`,
  };
}
const FEES_DATE = 'October 2026';

// ---------------------------------------------------------------- one vaccine
const VX_OPTS = ['yellowFever', 'typhoid_inj', 'typhoid_oral', 'hepA', 'hepAB', 'je', 'rabies', 'cholera', 'chikungunya', 'ipv', 'hepB_2dose', 'hepB_3dose'].map((id) => ({ value: id, label: VACCINE[id] }));
function vaccineOut(v: V): ToolOut {
  const sc = sched(s(v, 'vx') || 'yellowFever');
  const age = n(v, 'age');
  const wk = n(v, 'wk');
  const dept = s(v, 'dept') || 'all';
  const ds = age >= 18 && age <= 65 && sc.doses_days_18_65 ? sc.doses_days_18_65 : sc.doses_days;
  const span = spanOf(sc, age);
  const st = plan([sc], T0, depOf(wk), age)[0];
  const ps = priceOf(sc.fee);
  const lp = listPrice(sc.fee);
  const p = priceAt(dept, [sc]);
  const tooYoung = sc.min_age_months != null && age * 12 < sc.min_age_months;
  const tooOld = sc.max_age_years != null && age > sc.max_age_years;
  const doseText = sc.doses_billed ? `${ds.length} capsules, days ${ds.join(', ')} (one pack)` : ds.length === 1 ? '1 dose' : `${ds.length} doses: day ${ds.join(', day ')}`;
  const rows: Array<[string, string]> = [
    ['Doses', doseText + (sc.doses_before_travel ? `; ${sc.doses_before_travel} before the trip` : '')],
    ['Protection', sc.ready_days_after_last == null ? 'CDC gives no lead time' : sc.ready_days_after_last ? `${days(sc.ready_days_after_last)} after the last dose` : 'From the dose given before travel'],
    ['Published price per dose', ps ? `${usd(ps.median)} median, ${range(ps.min, ps.max)} (${ps.n} departments)` : 'Not on the price lists read'],
    [dept === 'all' ? 'Series, median total with fees' : 'Series at this department', p.lo != null ? `${usd(p.total)} (${range(p.lo, p.hi!)})` : usd(p.total)],
  ];
  if (lp) rows.push([`CDC private-sector list price (${lp.brand})`, `${usd(lp.price)} per dose, vaccine only`]);
  if (sc.id === 'rabies') {
    const pr = ps?.median ?? 0;
    rows.push(['After a bite, not vaccinated before', `immune globulin + 4 doses (vaccine ${usd(pr * 4)} at the median, globulin not priced)`]);
    rows.push(['After a bite, vaccinated before', `2 doses, no immune globulin (vaccine ${usd(pr * 2)} at the median)`]);
  }
  let value = span ? `${days(span)} before` : 'Any day before';
  let sub = span ? `latest start for protection on departure day` : 'one dose before departure is enough to leave';
  if (st.tooLate) { value = 'Too late'; sub = `${days(span)} needed, ${days(Math.round(wk * 7))} left: ask a clinician what a late dose still gives`; }
  if (tooYoung) sub = `Not licensed below ${sc.min_age_months! >= 24 ? `${formatNumber(sc.min_age_months! / 12, 0)} years` : `${sc.min_age_months} months`}: ask a clinician`;
  if (tooOld) sub = `Licensed up to age ${sc.max_age_years}: ask a clinician`;
  return {
    label: `${VACCINE[sc.id]}: when to start`,
    value, sub, rows,
    table: {
      caption: `${VACCINE[sc.id]}: published self-pay price per dose, and the series with visit and administration fees.`,
      headers: ['Health department', 'Per dose', 'Series with fees'],
      rows: FEE_SOURCES.filter((f) => typeof f.prices[sc.fee] === 'number').sort((a, b) => a.prices[sc.fee] - b.prices[sc.fee]).map((f) => [`${f.name}, ${f.state}`, usd(f.prices[sc.fee]), usd(quoteAt(f, [sc]).total)]),
      align: ['l', 'r', 'r'],
    },
    note: `Schedule from the CDC Yellow Book (${sc.source_date}). ${sc.booster ? `Booster: ${sc.booster}.` : ''} Not medical advice.`,
  };
}

// ---------------------------------------------------------------- yellow fever route
function yfOut(v: V): ToolOut {
  const to = expand(dest(s(v, 'to') || 'kenya'));
  const from = s(v, 'from');
  const origin = from !== 'none' && hasDest(from) ? expand(dest(from)) : null;
  const y = yellowFeverForTrip([to], origin)[0];
  const yf = to.diseases.yellowFever;
  const rec = yf?.recommendation === 'recommended' ? 'Recommended (for the areas CDC lists)' : yf?.recommendation === 'generallyNotRecommended' ? 'Generally not recommended, may be considered' : yf?.recommendation === 'notRecommended' ? 'Not recommended' : 'No yellow fever entry';
  const rule = yf?.entryRequirement === 'all' ? 'Every arriving traveler (age limits apply)' : yf?.entryRequirement === 'fromRiskCountries' ? 'Travelers arriving from risk countries' : yf?.entryRequirement === 'none' ? 'No certificate asked' : 'Read the country wording';
  const ps = priceOf('yellowFever');
  const age = n(v, 'age');
  const value = y.verdict === 'required' ? 'Required' : y.verdict === 'requiredIfRiskOrigin' ? 'Not on this route' : 'Not required';
  return {
    label: `Yellow fever certificate for ${to.name}`,
    value,
    sub: y.reason,
    rows: [
      ['CDC vaccine advice', rec],
      ['Who must show a certificate', rule],
      ['Valid from', `${days(10)} after the shot, for life`],
      ['Published price', ps ? `${usd(ps.median)} median, ${range(ps.min, ps.max)}` : ''],
      ...(age >= 60 ? [['Age 60 or older', 'A precaution for this vaccine: talk it over with a clinician'] as [string, string]] : []),
      ...(age * 12 < 9 ? [['Under 9 months', 'Below the usual minimum age: ask a clinician'] as [string, string]] : []),
    ],
    note: 'Entry rules as CDC reports them on the destination page. A country can change its rule; the embassy has the last word.',
  };
}

// ---------------------------------------------------------------- malaria tablets
function malariaOut(v: V): ToolOut {
  const c = dest(s(v, 'c') || 'kenya');
  const td = n(v, 'td');
  const drug = s(v, 'drug') || 'atovaquone-proguanil';
  const am = ANTIMALARIALS.find((a) => a.id === drug)!;
  const r = antimalarialCost(am, td, NADAC_ITEMS);
  const listed = c.m?.p ?? [];
  const rx = c.m?.l === 'P';
  const others = ANTIMALARIALS.filter((a) => listed.includes(a.id));
  return {
    label: `${DRUG[drug]} for ${formatNumber(td, 0)} days in ${c.n}`,
    value: `${formatNumber(r.tablets, 0)} tablets`,
    sub: r.acquisitionCost != null ? `about ${usd(r.acquisitionCost)} at pharmacy cost (NADAC ${r.asOf}), before the pharmacy fee` : 'No NADAC price published for this drug',
    rows: [
      ['CDC for this country', rx ? 'Prescription medicine for the areas listed' : c.m ? 'No medicine, or awareness only' : 'No malaria entry'],
      ['Drugs CDC lists here', listed.length ? listed.map((x) => DRUG[x]).join(', ') : 'None'],
      ['Start and stop', am.every_days === 1 ? `daily, from ${days(am.start_days_before)} before to ${days(am.continue_days_after)} after the risk area` : `${am.loading_days ? 'loading doses, then ' : ''}weekly, from ${days(am.start_days_before)} before to ${days(am.continue_days_after)} after`],
      ...(rx && listed.length && !listed.includes(drug) ? [['Note', `CDC does not list ${DRUG[drug]} for ${c.n}`] as [string, string]] : []),
    ],
    table: others.length ? {
      caption: `Each drug CDC lists for ${c.n}, adult regimen, ${formatNumber(td, 0)} days in the risk area.`,
      headers: ['Drug', 'Tablets', 'Per tablet', 'Pharmacy cost'],
      rows: others.map((a) => { const x = antimalarialCost(a, td, NADAC_ITEMS); return [DRUG[a.id], formatNumber(x.tablets, 0), x.perTablet != null ? `$${x.perTablet.toFixed(2)}` : 'not published', x.acquisitionCost != null ? usd(x.acquisitionCost) : 'not published']; }),
      align: ['l', 'r', 'r', 'r'],
    } : undefined,
    note: 'Adult regimens of the CDC Yellow Book. Children, pregnancy and G6PD status change the choice: a prescriber decides.',
  };
}

function riskOut(v: V): ToolOut {
  const c = dest(s(v, 'c') || 'kenya');
  const m = c.m;
  const lvl = levelOf(m?.l);
  return {
    label: `Malaria in ${c.n}`,
    value: lvl === 'prescription' ? 'Medicine advised' : lvl === 'none' || !m ? 'No malaria' : 'Areas to know',
    sub: m?.u ? `CDC country information updated ${m.u}` : 'CDC destination page',
    rows: [
      ['Drug resistance', m?.r || 'None reported'],
      ['Species', m?.sp || 'Not stated'],
      ['Drugs CDC lists', m?.p.length ? m.p.map((x) => DRUG[x]).join(', ') : 'None'],
    ],
    table: m?.a.length ? { caption: 'Transmission areas, as CDC lists them (verbatim).', headers: ['Areas with malaria'], rows: m.a.map((a) => [a]), align: ['l'] } : undefined,
    note: 'Source: CDC destination page. Not medical advice.',
  };
}

// ---------------------------------------------------------------- clinic fees
function clinicOut(v: V): ToolOut {
  const shots = Math.max(0, Math.round(n(v, 'sh')));
  const visits = Math.max(1, Math.round(n(v, 'vi')));
  const feesAt = (f: FeeSource) => {
    let x = 0;
    if (f.visit_fee) x += f.visit_fee * (f.visit_fee_once ? 1 : visits);
    if (f.includes_admin !== true && f.admin_first != null && shots > 0) x += visits * f.admin_first + Math.max(0, shots - visits) * (f.admin_additional ?? f.admin_first);
    return x;
  };
  const stated = FEE_SOURCES.filter((f) => f.visit_fee != null || f.admin_first != null || f.includes_admin);
  const dept = s(v, 'dept');
  const f = FEE_SOURCES.find((x) => x.id === dept) ?? stated[0];
  const all = stated.map(feesAt);
  return {
    label: `Fees on top of the vaccines, ${f.name}`,
    value: usd(feesAt(f)),
    sub: `${formatNumber(shots, 0)} shots over ${formatNumber(visits, 0)} visit${visits === 1 ? '' : 's'} · median of ${stated.length} departments ${usd(median(all))}`,
    rows: [
      ['Consultation', f.visit_fee ? `${usd(f.visit_fee)} ${f.visit_fee_once ? 'once' : 'per visit'}` : f.includes_admin ? 'Included in the vaccine price' : 'None stated'],
      ['Administration', f.includes_admin ? 'Included in the vaccine price' : f.admin_first != null ? `${usd(f.admin_first)} first shot${f.admin_additional != null && f.admin_additional !== f.admin_first ? `, ${usd(f.admin_additional)} each other` : ' each'}` : 'None stated'],
    ],
    table: { caption: 'Same shots and visits at each department that states its fees.', headers: ['Health department', 'Fees'], rows: stated.map((x) => [`${x.name}, ${x.state}`, usd(feesAt(x))]), align: ['l', 'r'] },
    note: 'Fees as each department publishes them; prices of the vaccines come on top.',
  };
}

// ---------------------------------------------------------------- NHS free or paid
const NHS_KEY: Record<string, string> = { cholera: 'cholera', polio: 'polio', hepA: 'hepA', typhoid: 'typhoid', hepB: 'hepB', je: 'je', rabies: 'rabies', tbe: 'tbe', yellowFever: 'yellowFever' };
function nhsOut(v: V): ToolOut {
  const c = expand(dest(s(v, 's1') || 'thailand'));
  const items = mergeAdvice([c]).filter((m) => NHS_KEY[m.disease] && ['most', 'some', 'consider'].includes(m.level));
  const yfr = c.diseases.yellowFever?.recommendation === 'recommended' || c.diseases.yellowFever?.entryRequirement === 'all';
  const all = [...items.map((m) => ({ k: m.disease, lvl: LEVEL_TEXT[m.level] })), ...(yfr ? [{ k: 'yellowFever', lvl: c.diseases.yellowFever?.entryRequirement === 'all' ? 'Certificate required for all' : 'CDC: recommended' }] : [])];
  const free = all.filter((x) => NHS_LIST.free.includes(x.k));
  const paid = all.filter((x) => NHS_LIST.paid.includes(x.k));
  return {
    label: `Travel jabs for ${c.name}, NHS or private`,
    value: `${free.length} free on the NHS`,
    sub: `${paid.length} to pay for at a private clinic or pharmacy`,
    rows: [
      ['Free at a GP surgery', free.length ? free.map((x) => diseaseLabel(x.k)).join(', ') : 'None on this list'],
      ['Paid', paid.length ? paid.map((x) => diseaseLabel(x.k)).join(', ') : 'None on this list'],
      ['Book', `${NHS_LIST.advice_weeks[0]} to ${NHS_LIST.advice_weeks[1]} weeks before you travel`],
    ],
    table: all.length ? { caption: `Advice level from the CDC page for ${c.name}; NHS status from nhs.uk (reviewed ${NHS_LIST.reviewed}).`, headers: ['Jab', 'Advice level', 'NHS'], rows: all.map((x) => [diseaseLabel(x.k), x.lvl, NHS_LIST.free.includes(x.k) ? 'Free at the GP' : 'Paid']), align: ['l', 'l', 'l'] } : undefined,
    note: 'UK clinics set their own prices for paid jabs; no official price list exists. Malaria tablets are not free on the NHS for travel.',
  };
}

export const SPECS: Record<string, (arg?: Record<string, number | string>) => ToolSpec> = {
  /** Itinerary: up to 3 countries in order → CDC list, yellow fever by border, malaria, lead time, price. */
  trip: (arg = {}) => ({
    inputs: [STOP('s1', 'First country', String(arg.s1 ?? 'india'), true), STOP('s2', 'Then', String(arg.s2 ?? 'none')), STOP('s3', 'Then', String(arg.s3 ?? 'none')), ORIGIN(String(arg.from ?? 'none')), WEEKS(Number(arg.wk ?? 6)), AGE(Number(arg.age ?? 35))],
    run: tripOut,
  }),
  /** Self-pay cost of chosen vaccines + fees + tablets. */
  cost: (arg = {}) => ({
    inputs: [
      DEPT(String(arg.dept ?? 'all')),
      ...COST_KEYS.map((k): Input => ({ kind: 'choice', id: k.id, label: k.label, def: String(arg[k.id] ?? k.def), options: k.opts ?? YN, adv: k.adv })),
      { kind: 'select', id: 'drug', label: 'Malaria tablets', def: String(arg.drug ?? 'none'), options: DRUG_OPTS },
      { id: 'td', label: 'Days in the malaria area', def: Number(arg.td ?? 14), unit: 'days', max: 365, show: (v) => s(v, 'drug') !== 'none' },
    ],
    run: costOut,
  }),
  /** One vaccine: lead time, doses, price lists. */
  vaccine: (arg = {}) => ({
    inputs: [{ kind: 'select', id: 'vx', label: 'Vaccine', def: String(arg.vx ?? 'yellowFever'), options: VX_OPTS }, WEEKS(Number(arg.wk ?? 4)), AGE(Number(arg.age ?? 35)), DEPT(String(arg.dept ?? 'all'))],
    run: vaccineOut,
  }),
  /** Yellow fever certificate on one border crossing. */
  yf: (arg = {}) => ({
    inputs: [{ kind: 'select', id: 'to', label: 'Country you arrive in', def: String(arg.to ?? 'kenya'), options: DEST_OPTS }, ORIGIN(String(arg.from ?? 'none')), AGE(Number(arg.age ?? 35))],
    run: yfOut,
  }),
  /** Malaria tablets: count and pharmacy cost. */
  malaria: (arg = {}) => ({
    inputs: [{ kind: 'select', id: 'c', label: 'Country', def: String(arg.c ?? 'kenya'), options: DEST_OPTS }, { kind: 'select', id: 'drug', label: 'Drug', def: String(arg.drug ?? 'atovaquone-proguanil'), options: ANTIMALARIALS.map((a) => ({ value: a.id, label: DRUG[a.id] })) }, { id: 'td', label: 'Days in the risk area', def: Number(arg.td ?? 14), unit: 'days', max: 365 }],
    run: malariaOut,
  }),
  /** Malaria by country: areas, resistance, drugs. */
  risk: (arg = {}) => ({
    inputs: [{ kind: 'select', id: 'c', label: 'Country', def: String(arg.c ?? 'kenya'), options: DEST_OPTS, wide: true }],
    run: riskOut,
  }),
  /** Visit and administration fees. */
  clinic: (arg = {}) => ({
    inputs: [{ kind: 'select', id: 'dept', label: 'Health department', def: String(arg.dept ?? 'orange-ca'), options: DEPT_OPTS.slice(1), wide: true }, { id: 'sh', label: 'Number of shots', def: Number(arg.sh ?? 3), max: 15 }, { id: 'vi', label: 'Number of visits', def: Number(arg.vi ?? 1), max: 6 }],
    run: clinicOut,
  }),
  /** UK: free on the NHS or paid, for one destination. */
  nhs: (arg = {}) => ({
    inputs: [STOP('s1', 'Destination', String(arg.s1 ?? 'thailand'), true)],
    run: nhsOut,
  }),
};

export function getTool(kind: string, arg?: Record<string, number | string>): ToolSpec {
  const f = SPECS[kind];
  if (!f) throw new Error(`Unknown tool ${kind}`);
  return f(arg);
}
export const TOOL_KINDS = Object.keys(SPECS);
export { DESTS };
