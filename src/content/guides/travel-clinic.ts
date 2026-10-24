import { defineGuide } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const F = K.fees;
const fmt = (x: number | null | undefined) => (x == null ? 'none stated' : K.usd(x));
const fee3 = F.map((f) => ({ f, q: K.quote(f.id, ['hepA', 'typhoid_inj']) })).filter((x) => !x.q.missing.length);
const withVisit = F.filter((f) => f.visit_fee);
const [w1, w2] = K.nhs.advice_weeks;
const withAdmin = F.filter((f) => f.admin_first != null && f.includes_admin !== true);

export default defineGuide({
  id: 'travel-clinic', group: 'trip', order: 10, slug: 'travel-clinic',
  nav: 'Travel clinic fees', card: 'Consultation and injection fees at public travel clinics, and what a visit adds to the shots.',
  title: 'Travel Clinic 2026: Visit Fees, What Happens, What to Bring',
  description: `Travel clinic in 2026: consultation and administration fees at ${F.length} US health departments, what the visit covers, how early to go and what to bring. Computed.`,
  h1: 'Travel clinic: what the visit involves and what it adds',
  intro: 'Choose a health department, the number of shots and visits: the calculator gives its consultation and injection fees on top of the vaccines.',
  resume: `A travel clinic visit is where the list of vaccines becomes a plan. A nurse or doctor reviews the itinerary, the dates, past vaccines and health conditions, then gives the shots that fit, writes prescriptions for malaria tablets or travelers' diarrhea, and fills in the yellow fever certificate if needed. In the United States, travel clinics are run by county health departments, hospitals and universities, private practices and some pharmacies. Of the ${K.num(F.length)} health departments whose price lists were read for this site, ${K.num(withVisit.length)} state a consultation or session fee and ${K.num(withAdmin.length)} an administration fee per injection, on top of the vaccines; others include everything in the vaccine price. For a visit with hepatitis A and the typhoid shot, the fees alone range from nothing to ${K.usd(Math.max(...fee3.map((x) => x.q.fees)))} across the departments. CDC's destination pages advise seeing a healthcare provider before the trip, and the NHS suggests going ${w1} to ${w2} weeks ahead, since some vaccines need several doses or time to work.`,
  body: (h) => `
<h2>What each department charges for the visit</h2>
<p>The table lists the fees each department publishes, apart from the vaccines: the consultation (per visit or once), the administration fee for the first injection and for each additional one. A blank means the department states no such fee, either because it includes it in the vaccine price or because the page says nothing.</p>
${h.table(['Health department', 'Consultation', 'First injection', 'Each additional', 'What the page says'], F.map((f) => [h.fee(f.id, `${f.name}, ${f.state}`), f.visit_fee ? `${K.usd(f.visit_fee)}${f.visit_fee_once ? ', first visit only' : ', per visit'}` : 'none stated', f.includes_admin === true ? 'included' : fmt(f.admin_first), f.includes_admin === true ? 'included' : fmt(f.admin_additional), (f as unknown as { note: string }).note]), `Fees published by each department, read ${K.day(K.FEES_DATE)}.`, ['l', 'r', 'r', 'r', 'l'])}
<h2>What happens at the visit</h2>
<p>The consultation follows the same steps almost everywhere. The clinician goes through the countries, the order of the stops, the dates, the kind of lodging and activities, then the traveler's vaccine record, medicines, allergies, pregnancy and conditions such as a weakened immune system that rule out live vaccines. From that, they decide which vaccines on the CDC list apply, which can wait, and which are contraindicated. They also cover what no vaccine prevents: malaria tablets where needed, food and water care, bite prevention, and what to do if ill during or after the trip. A traveler aged 60 or more who needs a first yellow fever dose can expect a longer talk, since CDC asks clinicians to weigh it carefully at that age.</p>
${h.mini('clinic', { t: 'Fees for a family visit', p: ['dept', 'sh'], d: { dept: 'orange-ca', sh: 6, vi: 1 } })}
<h2>How early to go</h2>
<p>The NHS advises seeing a GP or travel clinic ${w1} to ${w2} weeks before travel, because some vaccines need several doses or time to work. CDC's own schedules confirm it: the yellow fever certificate is valid ten days after the shot, the typhoid shot needs two weeks, Japanese encephalitis needs ${K.num(K.lead('je', 35))} days for an adult and more at other ages, rabies a week for two doses, and a three dose hepatitis B series six months. Going late still helps: hepatitis A, polio and the first doses of several series can be given even days before departure. The ${h.a('home', 'trip checker')} gives the latest start date of each vaccine for a given departure.</p>
<h2>What to bring</h2>
<p>A vaccine record, from a doctor, a school or a state immunization registry, avoids repeating shots already given; it is often the single best way to cut the bill. A yellow fever certificate from an earlier trip counts for life. A written itinerary with dates and stops, the list of current medicines, and the insurance card complete the file. For children, the routine record matters most, because many travel recommendations depend on routine doses being up to date.</p>
<h2>Health department, pharmacy or private clinic</h2>
<p>Health departments publish their prices, which is why they are the basis of this site, but several of them serve only residents of their area, and some give travel vaccines on set days. Pharmacies give many vaccines without appointment and bill insurance for routine ones, but not all stock yellow fever or Japanese encephalitis, and they rarely offer a full travel consultation. Private travel clinics give the most complete service and set their own prices, often with a consultation fee higher than those in the table. Yellow fever vaccine is given only at centers designated by the state health department, whichever the type of clinic.</p>
<h2>Questions worth asking on the phone</h2>
<p>Before the visit, a short call answers most of the cost questions: whether the department serves non-residents, whether the consultation is billed per visit or once, whether administration is included in the vaccine price, which vaccines are in stock, on which days yellow fever is given, and whether the clinic bills insurance or asks for payment at the visit. Several department pages state that payment is due at the visit and that travel vaccines may not be covered. It is also the moment to ask whether a malaria prescription needs its own consultation; one department lists a separate malaria consult fee, without the medicine.</p>
<h2>Several visits</h2>
<p>A series such as Japanese encephalitis, rabies or hepatitis B needs more than one visit, and departments that bill a consultation per visit bill it each time. Grouping the first doses of every vaccine on the same day, when the clinician agrees, keeps the number of visits down; the calculator above shows the difference between one, two and three visits at any department.</p>
`,
  faqs: [
    { q: 'How much does a travel clinic consultation cost?', a: `Among the ${K.num(F.length)} US health departments read for this site, ${K.num(withVisit.length)} state a consultation or session fee, from ${K.usd(Math.min(...withVisit.map((f) => f.visit_fee!)))} to ${K.usd(Math.max(...withVisit.map((f) => f.visit_fee!)))}, some per visit and some only at the first. Others include the visit in the vaccine price. Private travel clinics set their own fees and seldom publish them.` },
    { q: 'How far in advance should I go to a travel clinic?', a: `The NHS advises ${w1} to ${w2} weeks before travel, because some vaccines need several doses or time to take effect: the yellow fever certificate is valid ten days after the shot, the typhoid shot needs two weeks, and Japanese encephalitis two doses a week or four weeks apart plus a week of margin. A late visit still helps.` },
    { q: 'Can I get travel vaccines at a pharmacy instead?', a: 'Many pharmacies give hepatitis A and B, typhoid, polio, MMR and Tdap, sometimes without appointment, and bill insurance for routine vaccines. Yellow fever is given only at centers designated by the state health department, and some pharmacies are designated. Japanese encephalitis, rabies and cholera are stocked less often, so calling ahead with the list saves a trip.' },
  ],
  tool: 'clinic', toolArg: { dept: 'orange-ca', sh: 3, vi: 1 },
  related: ['travel-vaccines-cost', 'yellow-fever-vaccine-cost', 'travel-jabs', 'malaria-pills'],
  sources: ['cdc_destinations', 'nhs_travel', 'yb_yellow_fever'],
});
