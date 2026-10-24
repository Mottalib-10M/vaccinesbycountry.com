/**
 * Figures for the texts. Every number written in a page comes from here (never typed by hand):
 *  K.usd(x) money · K.num(x) integer · K.day(iso) long date
 *  K.price(fee) {n,min,median,max} per dose · K.list(fee) CDC private-sector list price · K.sched(id) schedule
 *  K.lead(id, age?) days before departure to start · K.d(slug) compact CDC record · K.dests all · K.lvl(slug, disease)
 *  K.byDept(ids) one quote per department, cheapest first
 *  K.yfAll(), K.yfFromRisk(), K.yfRisk(), K.malariaRx() · K.tablets(drug, days) · K.fees all departments
 */
import { formatMoney, formatNumber, formatDecimal } from './format';
import { DESTS, FEE_SOURCES, NADAC_ITEMS, NHS_LIST, PRICE_LIST, CDC_RETRIEVED, FEES_RETRIEVED, NADAC_DATE, ANTIMALARIALS, VACCINE, DRUG, DISEASE, dest, sched, priceOf, listPrice, levelOf, yfAll, yfFromRisk, yfRisk, malariaRx, feeSource } from './data';
import { plan } from './engine/timeline';
import { antimalarialCost, quoteAt, quoteRange, median } from './engine/cost';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const day = (iso: string) => `${MONTHS[Number(iso.slice(5, 7)) - 1]} ${Number(iso.slice(8, 10))}, ${iso.slice(0, 4)}`;
const price = (fee: string) => { const p = priceOf(fee); if (!p) throw new Error(`No published price for ${fee}`); return p; };
function lead(id: string, age = 35) {
  const p = plan([sched(id)], '2026-01-01', '2030-01-01', age)[0];
  return Math.round((Date.parse('2030-01-01T00:00:00Z') - Date.parse(`${p.startBy}T00:00:00Z`)) / 86_400_000);
}
const lvl = (slug: string, k: string) => levelOf(dest(slug).d[k]);
const tablets = (drug: string, days: number) => antimalarialCost(ANTIMALARIALS.find((a) => a.id === drug)!, days, NADAC_ITEMS);
const quote = (deptId: string, ids: string[]) => quoteAt(feeSource(deptId), ids.map(sched));
const range = (ids: string[]) => quoteRange(FEE_SOURCES, ids.map(sched))!;
/** One row per department that lists every vaccine of ids: its quote (series with fees), cheapest total first. */
const byDept = (ids: string[]) => FEE_SOURCES.filter((f) => ids.every((i) => typeof f.prices[sched(i).fee] === 'number'))
  .map((f) => ({ f, q: quoteAt(f, ids.map(sched)), date: f.date ?? 'undated, read ' + FEES_RETRIEVED }))
  .sort((a, b) => a.q.total - b.q.total);

export const KIT = {
  usd: (x: number) => formatMoney(Math.round(x), 0),
  num: (x: number) => formatNumber(x, 0),
  dec: (x: number, d = 1) => formatDecimal(x, d),
  day, price, list: listPrice, sched, lead, lvl, tablets, quote, range, byDept, median,
  d: dest, dests: DESTS, fees: FEE_SOURCES, fee: feeSource, nhs: NHS_LIST, priceList: PRICE_LIST,
  yfAll, yfFromRisk, yfRisk, malariaRx, VACCINE, DRUG, DISEASE,
  CDC_DATE: CDC_RETRIEVED, FEES_DATE: FEES_RETRIEVED, NADAC_DATE,
};
export type Kit = { K: typeof KIT };
