/**
 * The data asset, browser-safe: the compact CDC table (src/data/dest.json, built by scripts/build-data.mjs from the
 * 242 CDC destination pages), the self-pay fee schedules of 9 US public health departments, the CDC Yellow Book
 * schedules, NADAC tablet costs, the CDC adult vaccine price list and the NHS free/paid list.
 * The verbatim CDC wording is NOT here: country pages read it at build time from data/destinations.json.
 */
import DEST from '../data/dest.json';
import FEES from '../../data/fees-us.json';
import SCH from '../../data/schedules.json';
import NADAC from '../../data/nadac-antimalarials.json';
import PL from '../../data/cdc-adult-price-list.json';
import NHS from '../../data/nhs.json';
import type { Antimalarial, Destination, DiseaseEntry, FeeSource, Level, NadacItem, VaccineSchedule } from './engine/types';
import { median } from './engine/cost';

export interface Compact {
  s: string; n: string; rv: string | null;
  d: Record<string, string>;
  /** Hepatitis B wording: 'all' = unvaccinated travelers of all ages, '60' = younger than 60 (60+ may get it). */
  hb?: 'all' | '60' | null;
  /** [recommendation, entry rule, scope, countries the rule names, minimum age at the border, long transit counted]. */
  yf: [string, string, string | null, string[], (string | null)?, boolean?] | null;
  m: { l: string; p: string[]; r: string; sp: string; a: string[]; u: string | null } | null;
}
export const DESTS = (DEST as unknown as { list: Compact[] }).list;
export const CDC_RETRIEVED = (DEST as unknown as { retrieved: string }).retrieved;
/** A schedule the department itself calls approximate (Miami-Dade, June 2025 file) says so wherever its name is shown. */
export const FEE_SOURCES = (FEES.sources as unknown as FeeSource[]).map((f) => (/approximate/i.test(String((f as { unit?: string }).unit ?? ''))
  ? { ...f, name: `${f.name} (approximate prices, ${String(f.date ?? '').slice(0, 4)} list)` } : f));
export const FEES_RETRIEVED = FEES.retrieved_at;
export const SCHEDULES = SCH.vaccines as unknown as (VaccineSchedule & { booster?: string; notes?: string; source_url: string; source_date: string })[];
export const ANTIMALARIALS = SCH.antimalarials as unknown as Antimalarial[];
export const NADAC_ITEMS = NADAC.items as unknown as NadacItem[];
export const NADAC_DATE = NADAC.items[0]?.as_of_date ?? NADAC.retrieved_at;
export const PRICE_LIST = PL as unknown as { list_date: string; contract_end: string; source_url: string; items: Array<{ id: string; vaccine: string; brand: string; cdc_cost_per_dose_usd: number; private_sector_cost_per_dose_usd: number }> };
export const NHS_LIST = NHS as unknown as { reviewed: string; free: string[]; paid: string[]; notes: Record<string, string>; advice_weeks: number[]; source_url: string };

const LV: Record<string, Level> = { M: 'most', S: 'some', C: 'consider', R: 'routine', N: 'notRecommended', I: 'info', P: 'prescription', A: 'awareness', '0': 'none' };
export const levelOf = (code: string | undefined): Level | null => (code ? LV[code] ?? 'info' : null);

/** Disease labels (our wording of CDC's disease names). */
export const DISEASE: Record<string, string> = {
  routine: 'Routine vaccines', covid19: 'COVID-19', hepA: 'Hepatitis A', hepB: 'Hepatitis B', typhoid: 'Typhoid', je: 'Japanese encephalitis',
  rabies: 'Rabies', cholera: 'Cholera', chikungunya: 'Chikungunya', polio: 'Polio', measles: 'Measles', meningococcal: 'Meningococcal disease',
  tbe: 'Tick-borne encephalitis', yellowFever: 'Yellow fever', malaria: 'Malaria', mpox: 'Mpox', dengue: 'Dengue', flu: 'Influenza',
};
export const diseaseLabel = (k: string) => DISEASE[k] ?? k.replace(/-/g, ' ').replace(/^./, (c) => c.toUpperCase());

/** What a CDC level means, in our words (the CDC wording itself is quoted on the country pages). */
export const LEVEL_TEXT: Record<Level, string> = {
  most: 'CDC: most travelers', some: 'CDC: some travelers', consider: 'CDC: may be considered', routine: 'Routine, be up to date',
  notRecommended: 'CDC: not recommended', info: 'CDC: information', prescription: 'CDC: prescription medicine', awareness: 'CDC: awareness, no medicine', none: 'None',
};

/** Schedule (and fee key) used for each disease CDC lists. */
export const VAX_OF: Record<string, string> = { hepA: 'hepA', typhoid: 'typhoid_inj', yellowFever: 'yellowFever', je: 'je', rabies: 'rabies', cholera: 'cholera', chikungunya: 'chikungunya', polio: 'ipv', hepB: 'hepB_2dose' };
/** Diseases with a priced vaccine but no travel schedule in the data (price only). */
export const PRICE_ONLY: Record<string, string> = { measles: 'mmr', meningococcal: 'menACWY', tbe: 'tbe' };
export const TRAVEL_KEYS = [...Object.keys(VAX_OF), ...Object.keys(PRICE_ONLY)];

export const VACCINE: Record<string, string> = {
  hepA: 'Hepatitis A', hepAB: 'Hepatitis A + B (Twinrix)', hepB_2dose: 'Hepatitis B, 2 doses (Heplisav-B)', hepB_3dose: 'Hepatitis B, 3 doses',
  typhoid_inj: 'Typhoid, injection', typhoid_oral: 'Typhoid, oral capsules', yellowFever: 'Yellow fever', je: 'Japanese encephalitis',
  rabies: 'Rabies, before travel (2 doses)', cholera: 'Cholera, oral', chikungunya: 'Chikungunya', ipv: 'Polio booster (IPV)',
  mmr: 'MMR', menACWY: 'Meningococcal ACWY', tbe: 'Tick-borne encephalitis', tdap: 'Tdap', td: 'Td', varicella: 'Chickenpox',
};

export const DRUG: Record<string, string> = {
  'atovaquone-proguanil': 'Atovaquone-proguanil', doxycycline: 'Doxycycline', mefloquine: 'Mefloquine', chloroquine: 'Chloroquine', primaquine: 'Primaquine', tafenoquine: 'Tafenoquine',
};

export const dest = (slug: string) => { const d = DESTS.find((x) => x.s === slug); if (!d) throw new Error(`Unknown destination ${slug}`); return d; };
export const hasDest = (slug: string) => DESTS.some((x) => x.s === slug);
export const sched = (id: string) => { const s = SCHEDULES.find((x) => x.id === id); if (!s) throw new Error(`Unknown schedule ${id}`); return s; };
export const feeSource = (id: string) => { const s = FEE_SOURCES.find((x) => x.id === id); if (!s) throw new Error(`Unknown fee source ${id}`); return s; };

/** The compact record in the shape the tested engine expects (wording left empty: the tool shows levels). */
export function expand(c: Compact): Destination {
  const diseases: Record<string, DiseaseEntry> = {};
  for (const [k, code] of Object.entries(c.d)) diseases[k] = { label: diseaseLabel(k), text: [], level: levelOf(code) };
  if (c.yf) diseases.yellowFever = { label: 'Yellow fever', text: [], level: null, recommendation: c.yf[0] as DiseaseEntry['recommendation'], entryRequirement: c.yf[1] as DiseaseEntry['entryRequirement'], scope: c.yf[2] as DiseaseEntry['scope'], entryFrom: c.yf[3] };
  if (c.m) diseases.malaria = { label: 'Malaria', text: [], level: levelOf(c.m.l), details: { areas: c.m.a, resistance: c.m.r ? [c.m.r] : [], species: c.m.sp ? [c.m.sp] : [], prophylaxis: c.m.p.map((x) => DRUG[x] ?? x), updated: c.m.u } };
  return { slug: c.s, name: c.n, url: `https://wwwnc.cdc.gov/travel/destinations/traveler/none/${c.s}`, reviewed: c.rv, notices: [], diseases };
}

/** Lowest, median, highest published price per dose of a fee key, and how many departments list it. */
export function priceOf(fee: string) {
  const p = FEE_SOURCES.map((s) => s.prices[fee]).filter((x): x is number => typeof x === 'number');
  if (!p.length) return null;
  return { n: p.length, min: Math.min(...p), median: median(p), max: Math.max(...p) };
}
/** CDC private-sector list price per dose (vaccine only), lowest brand. */
export function listPrice(fee: string) {
  const id = fee.startsWith('hepB') ? 'hepB' : fee;
  const items = PRICE_LIST.items.filter((i) => i.id === id && (fee === 'hepB_2dose' ? i.brand === 'Heplisav-B' : fee === 'hepB_3dose' ? i.brand !== 'Heplisav-B' : true));
  if (!items.length) return null;
  const best = items.reduce((a, b) => (a.private_sector_cost_per_dose_usd <= b.private_sector_cost_per_dose_usd ? a : b));
  return { price: best.private_sector_cost_per_dose_usd, brand: best.brand, cdc: best.cdc_cost_per_dose_usd };
}
/** Countries whose entry rule asks every arriving traveler for a yellow fever certificate. */
export const yfAll = () => DESTS.filter((d) => d.yf?.[1] === 'all');
export const yfFromRisk = () => DESTS.filter((d) => d.yf?.[1] === 'fromRiskCountries');
export const yfFromListed = () => DESTS.filter((d) => d.yf?.[1] === 'fromListed');
export const yfRisk = () => DESTS.filter((d) => d.yf?.[0] === 'recommended' || d.yf?.[0] === 'generallyNotRecommended');
export const malariaRx = () => DESTS.filter((d) => d.m?.l === 'P');
export const DEST_OPTS = DESTS.map((d) => ({ value: d.s, label: d.n }));
