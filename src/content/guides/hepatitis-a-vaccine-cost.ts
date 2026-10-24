import { defineGuide } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const p = K.price('hepA'), ab = K.price('hepAB');
const lp = K.list('hepA')!, lab = K.list('hepAB')!, lb2 = K.list('hepB_2dose')!;
const rows = K.byDept(['hepA']);
const series = K.range(['hepA']);
const twin = K.range(['hepAB']);
const sep = K.range(['hepA', 'hepB_2dose']);

export default defineGuide({
  id: 'hepatitis-a-vaccine-cost', group: 'cost', order: 30, slug: 'hepatitis-a-vaccine-cost',
  nav: 'Hepatitis A vaccine cost', card: 'One dose, the full series and Twinrix: list price, health department prices and coverage.',
  title: 'Hepatitis A Vaccine Cost 2026: Per Dose, Series and Twinrix',
  description: `Hepatitis A vaccine cost in 2026: ${K.usd(lp.price)} a dose at the CDC list price, ${K.usd(p.min)} to ${K.usd(p.max)} at US health departments, the price of the two dose series and of Twinrix.`,
  h1: 'Hepatitis A vaccine cost',
  intro: 'Choose a health department: the calculator prices the hepatitis A series with its visit and administration fees, alone or with other vaccines.',
  resume: `Hepatitis A is one of the few travel vaccines with a federal reference price. On the CDC adult vaccine price list of ${K.day(K.priceList.list_date)}, the private-sector price of an adult dose is ${K.usd(lp.price)} (${lp.brand}), which is what a clinic pays the manufacturer before adding its own costs. At the ${K.num(p.n)} US health departments that publish a self-pay price, a dose costs ${K.usd(p.min)} to ${K.usd(p.max)}, with a median of ${K.usd(p.median)}. The full series is two doses, six months apart, so with the visit and administration fees some departments add, the series comes to ${K.usd(series.min)} to ${K.usd(series.max)}. Only the first dose is needed before the trip, which spreads the cost. Because hepatitis A is on the routine US schedule and recommended for adult travelers, health insurance and Medicaid cover it far more often than travel-only vaccines such as typhoid or yellow fever. In the United Kingdom it is free on the NHS for travel.`,
  body: (h) => `
<h2>The price of one dose at each department</h2>
<p>The table gives each department's self-pay price for one adult dose, and the total for the two dose series with its fees, cheapest series first. The date is the one printed on the department's list, or the day it was read when the page has none.</p>
${h.table(['Health department', 'One dose', 'Series of 2 with fees', 'Price list date'], rows.map((x) => [h.fee(x.f.id, `${x.f.name}, ${x.f.state}`), K.usd(x.f.prices.hepA), K.usd(x.q.total), x.date]), 'Hepatitis A vaccine, adult, self-pay. Series counts two doses and two visits.', ['l', 'r', 'r', 'l'])}
<p>The series total counts two visits, since the doses are six months apart, so a department with a per-visit fee charges it twice. A department that bills its consultation only at the first visit charges it once, which narrows the gap.</p>
<h2>List price and clinic price</h2>
<p>The CDC private-sector price is what manufacturers charge private buyers per dose, vaccine only. A clinic that pays ${K.usd(lp.price)} for a dose adds storage, staff time and the injection, so a self-pay price around ${K.usd(p.median)} is not unusual. The same list gives the price CDC pays under its federal contract, ${K.usd(lp.cdc)}, which applies to public programs, not to a traveler paying at a counter. These figures are useful when a private clinic quotes a much higher price: the difference is the clinic's own margin and fees, and comparing with a health department is reasonable.</p>
${h.mini('vaccine', { t: 'Hepatitis A at one department', p: ['dept'], d: { vx: 'hepA', wk: 3, dept: 'orange-ca' } })}
<h2>Twinrix or two separate vaccines</h2>
<p>Many travelers also need hepatitis B, which CDC now lists for unvaccinated travelers to every destination, at all ages in some and under 60 in others. Twinrix combines both in three doses. Its CDC private-sector price is ${K.usd(lab.price)} a dose, and the health departments charge ${K.usd(ab.min)} to ${K.usd(ab.max)}, so the three dose series comes to ${K.usd(twin.min)} to ${K.usd(twin.max)} with their fees. Two hepatitis A doses plus two doses of Heplisav-B (CDC list price ${K.usd(lb2.price)} a dose) come to ${K.usd(sep.min)} to ${K.usd(sep.max)} at the departments that list both. Which is cheaper depends on the department, on whether insurance pays for one and not the other, and on the number of visits each plan needs. The ${h.a('hepatitis-b-vaccine-for-travel', 'hepatitis B page')} explains the schedules.</p>
<h2>Insurance, Medicaid and the routine schedule</h2>
<p>Hepatitis A vaccine is recommended in the United States for all children at 12 to 23 months, catch-up through age 18, and adults at higher risk, international travelers included. Vaccines on that schedule are covered by most private health plans without a copay when given in network, and by Medicaid. That makes it worth asking the insurer before paying a self-pay price, and asking a pharmacy as well, since many pharmacies give hepatitis A vaccine to adults and bill the plan directly. Children vaccinated on schedule are usually already protected, which removes them from the bill entirely.</p>
<h2>Children, and travelers outside the United States</h2>
<p>For children, hepatitis A vaccine is part of the routine schedule, so it is covered by health plans and, for eligible children under 19, available at no vaccine cost through the federal Vaccines for Children program: children enrolled in Medicaid, uninsured or underinsured children, and American Indian and Alaska Native children. A child who missed the doses at 12 to 23 months can catch up before a trip at a clinic taking part in the program, which may still charge a limited administration fee. In the United Kingdom, hepatitis A for travel is one of the vaccinations the NHS gives free at a GP surgery after a risk assessment, so the self-pay prices on this page concern travelers in the United States. Prices in Canada and Australia are set by clinics and pharmacies, and no dated official list was found, so they are not shown here rather than estimated.</p>
<h2>Spreading the cost</h2>
<p>Because the second dose can wait six months or more, a traveler on a budget can pay for one dose before the trip and the second later, even years later; the series does not restart. A single dose protects more than 90 percent of people a month after it, according to CDC's Yellow Book. That is unusual among travel vaccines, most of which must be complete before departure.</p>
<p>The ${h.a('hepatitis-a-vaccine', 'hepatitis A vaccine page')} covers who it is for, and the ${h.a('travel-vaccines-cost', 'trip cost page')} adds it to the rest of a list.</p>
`,
  faqs: [
    { q: 'How much is the hepatitis A vaccine without insurance?', a: `At the ${K.num(p.n)} US health departments that publish a self-pay price, one adult dose costs ${K.usd(p.min)} to ${K.usd(p.max)}, median ${K.usd(p.median)}, according to their lists read on ${K.day(K.FEES_DATE)}. The full series is two doses six months apart, and some departments add a visit or administration fee each time.` },
    { q: 'What is the CDC list price of the hepatitis A vaccine?', a: `On the CDC adult vaccine price list of ${K.day(K.priceList.list_date)}, the private-sector price is ${K.usd(lp.price)} a dose for ${lp.brand}, the lower of the two adult brands. It is the manufacturer price to private buyers, vaccine only, before any clinic fee, so a traveler pays more than that at a counter.` },
    { q: 'Is Twinrix cheaper than separate hepatitis A and B vaccines?', a: `It depends on the clinic and the coverage. At the health departments read here, the three dose Twinrix series with fees comes to ${K.usd(twin.min)} to ${K.usd(twin.max)}, and two hepatitis A doses plus two Heplisav-B doses to ${K.usd(sep.min)} to ${K.usd(sep.max)}. Insurance often pays for both routes, which makes the number of visits the main difference.` },
  ],
  tool: 'cost', toolArg: { hepA: 'yes', typ: 'none' },
  related: ['hepatitis-a-vaccine', 'hepatitis-b-vaccine-for-travel', 'typhoid-vaccine-cost', 'travel-vaccines-cost', 'travel-jabs'],
  sources: ['cdc_price_list', 'cdc_hepa_vax', 'yb_hepa', 'nhs_travel'],
});
