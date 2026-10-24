import { defineGuide } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const IDS = ['hepA', 'typhoid_inj', 'typhoid_oral', 'yellowFever', 'je', 'rabies', 'cholera', 'chikungunya', 'ipv', 'hepB_2dose', 'hepB_3dose', 'hepAB'];
const perVax = IDS.map((id) => ({ id, p: K.price(id), l: K.list(id), doses: K.sched(id).doses_billed ?? K.sched(id).doses_days.length }));
const TRIPS: Array<[string, string[]]> = [
  ['Mexico or the Caribbean, resort and towns', ['hepA', 'typhoid_inj']],
  ['India, Golden Triangle', ['hepA', 'typhoid_inj']],
  ['Thailand or Vietnam, a month with rural stays', ['hepA', 'typhoid_inj', 'je']],
  ['Kenya or Tanzania safari', ['hepA', 'typhoid_inj', 'yellowFever']],
  ['Ghana or Nigeria', ['hepA', 'typhoid_inj', 'yellowFever']],
  ['Peru with the Amazon', ['hepA', 'yellowFever']],
  ['Six months in South Asia, with rabies', ['hepA', 'typhoid_inj', 'je', 'rabies']],
];
const trips = TRIPS.map(([label, ids]) => ({ label, ids, r: K.range(ids) }));
const safari = K.range(['hepA', 'typhoid_inj', 'yellowFever']);
const basic = K.range(['hepA', 'typhoid_inj']);
const ap = K.tablets('atovaquone-proguanil', 14), dx = K.tablets('doxycycline', 14);

export default defineGuide({
  id: 'travel-vaccines-cost', group: 'cost', order: 1, slug: 'travel-vaccines-cost',
  nav: 'Travel vaccines cost', card: 'Every travel vaccine priced from public lists, and the total for typical trips with fees.',
  title: 'Travel Vaccines Cost 2026: Price per Shot and per Trip',
  description: `Travel vaccines cost in 2026: each shot at US county health departments, CDC list prices, fees, and the total for ${trips.length} typical trips, from Mexico to a safari.`,
  h1: 'Travel vaccines cost: each shot and the whole trip',
  intro: 'Tick the vaccines on your list and choose a health department: the calculator adds the doses, the visit and administration fees, and malaria tablets.',
  resume: `What travel vaccines cost depends on three things: which vaccines the trip calls for, how many doses each takes, and the fees of the clinic that gives them. At the ${K.num(K.fees.length)} US county and city health departments whose self-pay lists were read for this site, the cheapest shots are the polio booster (median ${K.usd(K.price('ipv').median)}) and hepatitis A (${K.usd(K.price('hepA').median)} a dose); the dearest are rabies, at ${K.usd(K.price('rabies').median)} a dose for a two dose series, and Japanese encephalitis, at ${K.usd(K.price('je').median)} a dose. A first trip to Mexico or India with hepatitis A and typhoid comes to ${K.usd(basic.min)} to ${K.usd(basic.max)} with both hepatitis A doses and the fees; a Kenya safari that adds yellow fever, ${K.usd(safari.min)} to ${K.usd(safari.max)}. Malaria tablets are extra, from about ${K.usd(dx.acquisitionCost!)} for two weeks of doxycycline at the price pharmacies pay to ${K.usd(ap.acquisitionCost!)} for atovaquone-proguanil, plus the pharmacy's own margin. Routine vaccines are usually covered by insurance; travel-only vaccines often are not.`,
  body: (h) => `
<h2>Each vaccine, per dose</h2>
<p>The table gives the median self-pay price per dose at the departments that list each vaccine, their range, the number of doses in a full series, and the CDC private-sector list price where the vaccine appears on that list. The list price is what manufacturers charge private buyers, vaccine only; travel-only vaccines such as yellow fever, typhoid, rabies, Japanese encephalitis, cholera and chikungunya are not on it.</p>
${h.table(['Vaccine', 'Doses', 'Median per dose', 'Range', 'Departments', 'CDC list price'], perVax.map((v) => [K.VACCINE[v.id], v.doses, K.usd(v.p.median), `${K.usd(v.p.min)} to ${K.usd(v.p.max)}`, v.p.n, v.l ? K.usd(v.l.price) : 'not listed']), `Self-pay prices at US health departments, read ${K.day(K.FEES_DATE)}; CDC adult price list of ${K.day(K.priceList.list_date)}.`, ['l', 'r', 'r', 'l', 'r', 'r'])}
<p>The oral typhoid vaccine counts as one purchase, a box of four capsules. Hepatitis A counts both doses, though only the first is needed before the trip. A department that does not list a vaccine is left out of that line rather than given an estimate, which is why the number of departments differs from row to row; cholera, chikungunya and tick-borne encephalitis are listed by fewer departments than hepatitis A or typhoid.</p>
<h2>Typical trips, with fees</h2>
<p>Lists vary from one traveler to another, so the trips below are examples, not prescriptions: they combine the vaccines CDC lists for most travelers to those places, plus Japanese encephalitis or rabies where the stay makes them likely to come up. Each total is the range across departments that list every vaccine of the row, with their consultation and administration fees for the visits needed.</p>
${h.table(['Trip', 'Vaccines', 'Lowest', 'Median', 'Highest'], trips.map((t) => [t.label, t.ids.map((i) => K.VACCINE[i]).join(', '), K.usd(t.r.min), K.usd(t.r.median), K.usd(t.r.max)]), 'Full series with fees, self-pay, at the departments listing every vaccine of the row.', ['l', 'l', 'r', 'r', 'r'])}
<p>Routine vaccines CDC asks every traveler to be up to date on, such as measles (MMR) and, for unvaccinated travelers, hepatitis B, are not in these totals because most travelers already have them or have them covered by insurance. For an adult who needs them, the calculator above adds hepatitis B, and the ${h.a('hepatitis-b-vaccine-for-travel', 'hepatitis B page')} explains the options.</p>
<h2>Where the money goes</h2>
<p>A travel vaccine bill has three parts. The vaccine itself is the largest; it varies little between departments for routine vaccines and a lot for travel-only ones. The consultation, when there is one, pays for the clinician's review of the itinerary, past vaccines and health, and some departments bill it once, others at each visit. The administration fee pays for each injection, sometimes less for each extra shot given the same day. A series that needs several visits multiplies the visit fees, which is why Japanese encephalitis or a three dose hepatitis B series costs more than the dose price suggests. The ${h.a('travel-clinic', 'clinic fees page')} breaks those fees down.</p>
${h.mini('cost', { t: 'A safari list at one department', p: ['dept', 'yellowFever'], d: { hepA: 'yes', typ: 'inj', yellowFever: 'yes', dept: 'denver-co' } })}
<h2>Insurance and coverage</h2>
<p>Vaccines on the routine US schedule, including hepatitis A, hepatitis B, MMR, Tdap and polio, are covered by most private health plans and Medicaid without cost sharing when given in network. Travel-only vaccines are a different matter: plans decide whether to cover typhoid, yellow fever, Japanese encephalitis, rabies, cholera and chikungunya, and many do not. Several health departments state on their price list that travel vaccines may not be covered and ask for payment at the visit. A health savings or flexible spending account can usually be used. Asking the plan with the list of vaccines in hand, before the visit, is the way to know what the trip will really cost.</p>
<h2>Malaria tablets</h2>
<p>Malaria prevention is a prescription, not a vaccine, and it is priced at the pharmacy. The figures here are the NADAC survey of what pharmacies pay wholesalers, as of ${K.day(K.NADAC_DATE)}: for a two week stay, ${K.num(ap.tablets)} atovaquone-proguanil tablets cost about ${K.usd(ap.acquisitionCost!)} and ${K.num(dx.tablets)} doxycycline tablets about ${K.usd(dx.acquisitionCost!)}. The shelf price is higher, by the pharmacy's dispensing fee and margin, and insurance often covers the drug. The ${h.a('malaria-pills', 'malaria pills page')} computes any length of stay.</p>
<h2>Outside the United States</h2>
<p>In the United Kingdom, the NHS gives some travel vaccines free at a GP surgery, after a risk assessment: hepatitis A, typhoid, cholera and the combined diphtheria, tetanus and polio booster; others are paid at private clinics. The ${h.a('travel-jabs', 'travel jabs page')} sorts a UK list into free and paid. Private prices in the UK, Canada and Australia are set by clinics and pharmacies, and no dated official list was found for them, so they are not shown.</p>
`,
  faqs: [
    { q: 'How much do travel vaccines cost in total?', a: `It depends on the list. At US health departments that publish self-pay prices, hepatitis A and typhoid, the usual pair for Mexico or India, come to ${K.usd(basic.min)} to ${K.usd(basic.max)} with fees and both hepatitis A doses; a safari list that adds yellow fever, ${K.usd(safari.min)} to ${K.usd(safari.max)}. Japanese encephalitis and rabies add several hundred dollars each.` },
    { q: 'Which travel vaccine is the most expensive?', a: `Per series, rabies and Japanese encephalitis, since each takes two doses at a median of ${K.usd(K.price('rabies').median)} and ${K.usd(K.price('je').median)} a dose at US health departments. Per single dose, yellow fever, cholera and chikungunya cost several hundred dollars too. The polio booster and hepatitis A are the cheapest lines.` },
    { q: 'Are travel vaccines cheaper at a health department than at a pharmacy?', a: 'Often, but not always, and the comparison needs the whole bill: dose, consultation and administration fees. Health departments publish their prices, while pharmacies and private clinics rarely do. Pharmacies can be the cheaper route for vaccines insurance covers, such as hepatitis A or B, since they bill the plan directly. Some departments serve residents only.' },
    { q: 'Does health insurance cover travel vaccines?', a: 'Routine vaccines such as hepatitis A, hepatitis B, MMR, Tdap and polio are covered by most plans and Medicaid. Travel-only vaccines such as typhoid, yellow fever, Japanese encephalitis, rabies and cholera depend on the plan, and many exclude them. Calling the insurer with the list of vaccines before the visit gives the real figure.' },
  ],
  tool: 'cost', toolArg: { hepA: 'yes', typ: 'inj' },
  related: ['travel-clinic', 'yellow-fever-vaccine-cost', 'typhoid-vaccine-cost', 'hepatitis-a-vaccine-cost', 'malaria-pills', 'travel-jabs'],
  sources: ['cdc_price_list', 'nadac', 'nhs_travel', 'cdc_destinations'],
});
