import { defineGuide } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const inj = K.price('typhoid_inj'), oral = K.price('typhoid_oral');
const both = K.fees.filter((f) => typeof f.prices.typhoid_inj === 'number' && typeof f.prices.typhoid_oral === 'number');
const ri = K.range(['typhoid_inj']), ro = K.range(['typhoid_oral']);
const perYearInj = inj.median / 2, perYearOral = oral.median / 5;

export default defineGuide({
  id: 'typhoid-vaccine-cost', group: 'cost', order: 20, slug: 'typhoid-vaccine-cost',
  nav: 'Typhoid vaccine cost', card: 'Shot against capsules at each health department, per dose and per year of protection.',
  title: 'Typhoid Vaccine Cost 2026: Shot vs Oral, Health Departments',
  description: `Typhoid vaccine cost in 2026: the shot at ${K.usd(inj.min)} to ${K.usd(inj.max)} and the oral capsules at ${K.usd(oral.min)} to ${K.usd(oral.max)} at US health departments, with their fees and the cost per year.`,
  h1: 'Typhoid vaccine cost: the shot and the capsules',
  intro: 'Choose a health department and the shot or the capsules: the calculator adds the fees it publishes and gives the total.',
  resume: `Typhoid vaccine comes in two forms with two prices. At the ${K.num(inj.n)} US health departments that publish a self-pay price for it, the injectable Vi vaccine costs ${K.usd(inj.min)} to ${K.usd(inj.max)}, with a median of ${K.usd(inj.median)}; the oral Ty21a capsules, a box of four, cost ${K.usd(oral.min)} to ${K.usd(oral.max)} at the ${K.num(oral.n)} that sell them, median ${K.usd(oral.median)}. With the visit and administration fees some departments add, one shot comes to ${K.usd(ri.min)} to ${K.usd(ri.max)}. The two do not last as long: about two years for the shot and five for the capsules, so per year of protection the capsules cost about ${K.usd(perYearOral)} at the median against ${K.usd(perYearInj)} for the shot. The capsules are not for everyone, though: they are a live vaccine, not given in pregnancy or with a weakened immune system, and only from age 6. Neither is on the CDC private-sector price list, and travel-only vaccines are often outside insurance coverage.`,
  body: (h) => `
<h2>Shot and capsules at the same department</h2>
<p>The fairest comparison is at a department that sells both. The table puts the two prices side by side for the ${K.num(both.length)} departments that list them, with the date of each price list.</p>
${h.table(['Health department', 'Shot (Vi)', 'Capsules (Ty21a)', 'Difference', 'Price list date'], both.map((f) => [h.fee(f.id, `${f.name}, ${f.state}`), K.usd(f.prices.typhoid_inj), K.usd(f.prices.typhoid_oral), K.usd(f.prices.typhoid_inj - f.prices.typhoid_oral), f.date ?? `undated, read ${K.FEES_DATE}`]), 'Typhoid vaccine, self-pay price per shot or per box of four capsules, before fees.', ['l', 'r', 'r', 'r', 'l'])}
<p>At every one of them the capsules cost less than the shot. The gap widens once fees are counted: a department that charges an administration fee per injection has nothing to inject with the capsules, although one department states a separate fee for an oral vaccine. Where a consultation is billed per visit, it applies to both, so the choice between the two forms does not change that part of the bill.</p>
<h2>Cost per year of protection</h2>
<p>The shot protects for about two years and the capsules for about five, according to the CDC Yellow Book. For someone who will travel again to South Asia, Africa or Southeast Asia within those five years, the capsules are cheaper over time: ${K.usd(perYearOral)} a year at the median price against ${K.usd(perYearInj)} for the shot. For a single trip, the yearly figure does not matter and the price of the dose does. Both protect only 50 to 80 percent of the people who receive them, so the protection itself is similar.</p>
${h.mini('cost', { t: 'Typhoid shot or capsules with hepatitis A', p: ['dept', 'typ'], d: { hepA: 'yes', typ: 'oral' } })}
<h2>What the capsules ask in return</h2>
<p>The lower price comes with conditions. The four capsules are swallowed one every other day, kept in the refrigerator, and finished at least a week before travel, so the box must be picked up about two weeks before departure. Antibiotics cancel them: CDC advises waiting more than 72 hours after an antibiotic before the first capsule and none within 72 hours after the last, which includes doxycycline taken for malaria. Some departments do not hand the box over but send a prescription to a pharmacy, which then sets its own price; one department states that its oral typhoid price is to be determined plus a consultation fee. For children under 6, pregnant travelers and people with a weakened immune system, the shot is the only option, whatever the price.</p>
<h2>A family example</h2>
<p>Take a family of four flying to India: two parents, a child of 8 and a child of 4. The youngest can only have the shot, since the capsules start at age 6. At median prices, three boxes of capsules and one shot cost ${K.usd(3 * oral.median + inj.median)}, against ${K.usd(4 * inj.median)} for four shots, a difference of ${K.usd(4 * inj.median - 3 * oral.median - inj.median)} before fees. The capsule route asks more of the family, though: three people swallowing a capsule every other day on an empty stomach, a box in the refrigerator, and no antibiotics around the dates. For a family that travels every year or two, the five years of the capsules also mean fewer visits later. A clinician confirms that each person can take the live vaccine.</p>
<h2>Insurance and other ways to pay</h2>
<p>Typhoid is a travel-only vaccine in the United States, so many health plans do not cover it, though some do, sometimes only at a pharmacy. A health savings or flexible spending account can usually pay for it, since vaccines are a medical expense; the plan administrator confirms. In the United Kingdom, typhoid for travel is given free on the NHS at a GP surgery after a risk assessment, which is why the ${h.a('travel-jabs', 'travel jabs page')} treats it separately.</p>
<h2>Why prices differ so much</h2>
<p>Health departments buy the same vaccines but price them differently: some include administration in the dose, some subsidize residents, some round to the dollar, some publish approximate prices. The spread at the departments read here is ${K.usd(inj.max - inj.min)} for the shot and ${K.usd(oral.max - oral.min)} for the capsules. Private travel clinics and pharmacies set their own prices and rarely publish them; a phone call with the exact vaccine name, and a question about every fee, gives a figure to compare with the table.</p>
<p>The ${h.a('typhoid-vaccine', 'typhoid vaccine page')} covers timing and who CDC lists it for; the ${h.a('travel-vaccines-cost', 'trip cost page')} adds typhoid to the rest of a list.</p>
`,
  faqs: [
    { q: 'How much does the typhoid shot cost without insurance?', a: `At the ${K.num(inj.n)} US health departments that publish a self-pay price, the injectable typhoid vaccine costs ${K.usd(inj.min)} to ${K.usd(inj.max)}, median ${K.usd(inj.median)}, before any visit or administration fee. Prices come from each department's list read on ${K.day(K.FEES_DATE)}. Private clinics set their own prices and seldom publish them.` },
    { q: 'Is the oral typhoid vaccine cheaper than the shot?', a: `Yes, at every department that sells both: the box of four capsules costs a median of ${K.usd(oral.median)} against ${K.usd(inj.median)} for the shot. The capsules also last five years instead of two. They are a live vaccine with conditions, though: not in pregnancy, not with a weakened immune system, not before age 6, and not close to antibiotics.` },
    { q: 'Can I buy oral typhoid vaccine at a pharmacy?', a: 'With a prescription, yes, and some health departments send the prescription to a pharmacy rather than selling the box themselves. The pharmacy then sets the price and may need a few days to order it. The capsules must stay refrigerated from pickup until the last one is taken.' },
  ],
  tool: 'cost', toolArg: { hepA: 'no', typ: 'inj' },
  related: ['typhoid-vaccine', 'hepatitis-a-vaccine-cost', 'travel-vaccines-cost', 'travel-clinic', 'country:india'],
  sources: ['yb_typhoid', 'cdc_price_list', 'nhs_travel'],
});
