// Cost engine: published self-pay prices of US public health departments, CDC private sector list
// prices, NADAC tablet costs. Every result keeps its sources so the page can cite them.
import type { Antimalarial, FeeSource, NadacItem, VaccineSchedule } from './types';

export interface PriceStats { vaccine: string; n: number; min: number; median: number; max: number; sources: string[] }

export function median(xs: number[]): number {
  const s = [...xs].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

/** Lowest, median and highest published price per dose for one vaccine key (e.g. 'yellowFever'). */
export function priceStats(sources: FeeSource[], vaccine: string): PriceStats | null {
  const hit = sources.filter((s) => typeof s.prices[vaccine] === 'number');
  if (!hit.length) return null;
  const p = hit.map((s) => s.prices[vaccine]);
  return { vaccine, n: hit.length, min: Math.min(...p), median: median(p), max: Math.max(...p), sources: hit.map((s) => s.id) };
}

/** Doses billed for a vaccine on this trip (before departure only when the schedule allows the rest later). */
export function dosesToPay(s: VaccineSchedule, { beforeTravelOnly = false } = {}): number {
  if (s.doses_billed) return s.doses_billed;
  if (beforeTravelOnly && s.doses_before_travel) return s.doses_before_travel;
  return s.doses_days.length;
}

export interface Line { vaccine: string; doses: number; perDose: number; subtotal: number }
export interface Quote { lines: Line[]; vaccines: number; fees: number; total: number; missing: string[]; basis: string }

/**
 * Total at one department: vaccine prices × doses + visit fee per visit + administration fees.
 * `visits` defaults to the number of distinct dose days (0, 7, 28… across the chosen vaccines).
 * A vaccine the department does not list goes to `missing` and is not counted.
 */
export function quoteAt(src: FeeSource, chosen: VaccineSchedule[], opts: { beforeTravelOnly?: boolean; visits?: number } = {}): Quote {
  const lines: Line[] = [];
  const missing: string[] = [];
  let shots = 0;
  const days = new Set<number>();
  for (const s of chosen) {
    const price = src.prices[s.fee];
    if (typeof price !== 'number') { missing.push(s.id); continue; }
    const doses = dosesToPay(s, opts);
    lines.push({ vaccine: s.id, doses, perDose: price, subtotal: price * doses });
    shots += doses;
    s.doses_days.slice(0, doses).forEach((d) => days.add(d));
  }
  const visits = opts.visits ?? Math.max(days.size, lines.length ? 1 : 0);
  let fees = 0;
  if (src.visit_fee) fees += src.visit_fee * (src.visit_fee_once ? 1 : visits); // some departments bill the consultation once
  if (src.includes_admin !== true && src.admin_first != null && shots > 0) {
    // Administration: first vaccine of each visit at admin_first, others at admin_additional.
    const add = src.admin_additional ?? src.admin_first;
    fees += visits * src.admin_first + Math.max(0, shots - visits) * add;
  }
  const vaccines = lines.reduce((a, l) => a + l.subtotal, 0);
  return { lines, vaccines, fees, total: vaccines + fees, missing, basis: src.id };
}

/** Range of the trip total across every department that lists all chosen vaccines. */
export function quoteRange(sources: FeeSource[], chosen: VaccineSchedule[], opts: { beforeTravelOnly?: boolean } = {}) {
  const q = sources.map((s) => quoteAt(s, chosen, opts)).filter((x) => x.missing.length === 0 && x.lines.length > 0);
  if (!q.length) return null;
  const t = q.map((x) => x.total);
  return { n: q.length, min: Math.min(...t), median: median(t), max: Math.max(...t), quotes: q };
}

/** Tablets for a trip of `tripDays` in the risk area, CDC adult regimen. */
export function tabletsNeeded(a: Antimalarial, tripDays: number): number {
  if (tripDays <= 0) return 0;
  if (a.every_days === 1) return (a.start_days_before + tripDays + a.continue_days_after) * a.tablets_per_dose;
  if (a.loading_days) {
    // Tafenoquine: daily loading dose for 3 days, weekly during the stay, one dose the week after.
    const weekly = Math.ceil(tripDays / 7);
    return (a.loading_days + weekly + 1) * a.tablets_per_dose;
  }
  // Weekly drugs: doses before (start_days_before / 7), one per week of stay, 4 weeks after.
  const doses = Math.ceil(a.start_days_before / 7) + Math.ceil(tripDays / 7) + Math.ceil(a.continue_days_after / 7);
  return doses * a.tablets_per_dose;
}

export function antimalarialCost(a: Antimalarial, tripDays: number, nadac: NadacItem[]) {
  const tablets = tabletsNeeded(a, tripDays);
  const n = a.nadac ? nadac.find((x) => x.drug === a.nadac) : undefined;
  return { drug: a.id, tablets, perTablet: n?.per_unit_usd ?? null, acquisitionCost: n ? tablets * n.per_unit_usd : null, asOf: n?.as_of_date ?? null };
}
