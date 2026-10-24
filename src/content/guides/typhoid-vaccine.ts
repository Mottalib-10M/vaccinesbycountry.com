import { defineGuide } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const inj = K.price('typhoid_inj'), oral = K.price('typhoid_oral');
const most = K.dests.filter((d) => d.d.typhoid === 'M');
const consider = K.dests.filter((d) => d.d.typhoid === 'C');

export default defineGuide({
  id: 'typhoid-vaccine', group: 'vaccines', order: 20, slug: 'typhoid-vaccine',
  nav: 'Typhoid vaccine', card: 'Shot or capsules: lead time, how long each protects, where CDC lists it, and what it costs.',
  title: 'Typhoid Vaccine 2026: Shot or Oral, Timing and Destinations',
  description: `Typhoid vaccine in 2026: the shot (2 weeks ahead, 2 years) or capsules (1 week, 5 years), the ${most.length} places CDC lists it for most travelers, and US prices.`,
  h1: 'Typhoid vaccine: the shot or the capsules',
  intro: 'Choose the shot or the capsules and your departure: the checker gives the latest start date, how long the protection lasts and the published price.',
  resume: `There are two typhoid vaccines in the United States, and both work against the same disease: Salmonella Typhi, caught from food or water. The injectable Vi vaccine is one shot, given at least two weeks before travel from the age of 2, and it protects for about two years. The oral Ty21a vaccine is four capsules, one every other day, finished at least a week before travel, from the age of 6; it protects for five years, but it is a live vaccine, it must stay in the refrigerator, and antibiotics can cancel it. Both protect 50 to 80 percent of those who receive them, so food and water care still counts. CDC lists the vaccine for most travelers to ${K.num(most.length)} destinations, with South Asia at the top of the risk, and as an option to consider for ${K.num(consider.length)} more. At US county health departments the shot costs a median of ${K.usd(inj.median)} and the capsules ${K.usd(oral.median)}.`,
  body: (h) => `
<h2>Where CDC lists it</h2>
<p>Typhoid fever is common where drinking water and sewage are not fully separated. More than 70 percent of the cases diagnosed in US travelers come back from South Asia, mostly India, Pakistan and Bangladesh, and CDC lists the vaccine for most travelers there. The list of ${K.num(most.length)} destinations where it is recommended for most travelers also covers most of sub-Saharan Africa, much of Southeast Asia, including Thailand, Vietnam, Cambodia, Indonesia and the Philippines, and countries such as Mexico and Egypt. For ${K.num(consider.length)} other destinations, such as Peru, Brazil or Costa Rica, CDC's wording is that the vaccine may be considered for travelers going to areas with poor sanitation and unsafe water, rural areas included, staying a month or more, or visiting friends or relatives.</p>
${h.mini('trip', { t: 'Is typhoid on the CDC list for your trip?', p: ['s1'], d: { s1: 'pakistan' } })}
<h2>The shot: simple, two years</h2>
<p>The injectable vaccine is a single dose in the arm. It needs ${K.num(K.lead('typhoid_inj'))} days to build protection, so it is the one to choose when the trip is close but not too close, and it is approved from age 2. It is not a live vaccine, so it is the typhoid option for people with a weakened immune system; CDC notes there are no safety data in pregnancy, a point for a clinician. Protection lasts about two years; a traveler who goes back to a risk area after that receives another dose. At the ${K.num(inj.n)} health departments that publish a price, the shot costs ${K.usd(inj.min)} to ${K.usd(inj.max)}.</p>
<h2>The capsules: a week of discipline, five years</h2>
<p>The oral vaccine is a box of four capsules. One is swallowed every other day, and the box stays in the refrigerator, never the freezer, between doses. The course must be finished at least a week before travel, so the first capsule is taken about ${K.num(K.lead('typhoid_oral'))} days before departure. Because it is a live bacterial vaccine, it is not given in pregnancy or to people with a weakened immune system, and it is held back for three days after any antibiotic, or the antibiotic kills the vaccine. In return it lasts five years. At the ${K.num(oral.n)} departments that sell it, the box costs ${K.usd(oral.min)} to ${K.usd(oral.max)}; some send it to a pharmacy instead of handing it over.</p>
${h.mini('vaccine', { t: 'Typhoid capsules: are you still in time?', p: ['vx', 'wk'], d: { vx: 'typhoid_oral', wk: 2 } })}
<h2>Which one fits</h2>
<p>For a single trip within two years, the shot is the simpler choice: one visit, no refrigerator, no antibiotic rule. For someone who travels often, the capsules cost about the same and cover five years. Children between 2 and 6 can only have the shot. Neither vaccine is complete protection, which is why CDC repeats the same advice on every country page: food that is cooked and served hot, drinks that are bottled and sealed, and hands washed before eating.</p>
<h2>Typhoid on the same visit as other shots</h2>
<p>Typhoid rarely travels alone on a list. The destinations where CDC lists it for most travelers almost always list hepatitis A too, since both diseases come from the same food and water, and the two shots are usually given on the same visit, one in each arm. Some departments bill an administration fee for each injection, others include it in the price, and the oral vaccine has no injection fee at all, which can tilt the comparison for a traveler on a tight budget. Where a trip also needs yellow fever, Japanese encephalitis or rabies, the typhoid shot fits into the first visit and does not add a trip to the clinic.</p>
<h2>What it does not cover</h2>
<p>A traveler who falls ill with a high fever after a trip, vaccinated or not, needs to say where they traveled: typhoid is treated with antibiotics, and the strains from South Asia increasingly resist the older ones, which is one reason CDC keeps the vaccine high on its lists for that region. The vaccine also does nothing against travelers' diarrhea, hepatitis A or cholera, which spread the same way but need their own protection or simply careful habits.</p>
<p>The ${h.a('typhoid-vaccine-cost', 'typhoid price page')} compares the two at each department, and the ${h.a('travel-vaccines-cost', 'trip cost page')} adds typhoid to the other shots of your list.</p>
`,
  faqs: [
    { q: 'How long before the trip should the typhoid shot be given?', a: 'At least two weeks before travel, according to the CDC Yellow Book, because the body needs that time to build protection. The oral capsules must be finished at least one week before travel, and the four capsules take a week to swallow, so they start about two weeks ahead too. A late dose still gives some protection; a clinician can say whether it is worth it.' },
    { q: 'How long does typhoid vaccine protection last?', a: 'About two years for the injectable vaccine and five years for the oral capsules. CDC advises a new dose after those periods only for travelers who go back to a place where typhoid is a risk. Neither vaccine is complete protection: they protect 50 to 80 percent of the people who receive them, so food and water care stays important.' },
    { q: 'Can children have the typhoid vaccine?', a: 'The injectable vaccine is approved from age 2 and the oral capsules from age 6, since a child must be able to swallow a capsule whole. Below 2 years no typhoid vaccine is licensed in the United States, and families traveling with toddlers to South Asia or Africa rely on careful food and water habits.' },
    { q: 'Do antibiotics or malaria tablets affect the oral typhoid vaccine?', a: 'Antibiotics do: the oral vaccine is a live bacterium, so CDC advises waiting more than 72 hours after an antibiotic before the first capsule, and not taking one within 72 hours after the last. That includes doxycycline used against malaria, so the timing of the two must be planned together. The injectable vaccine has no such rule.' },
  ],
  tool: 'vaccine', toolArg: { vx: 'typhoid_inj', wk: 3 },
  related: ['typhoid-vaccine-cost', 'hepatitis-a-vaccine', 'country:india', 'country:mexico', 'travel-vaccines-cost'],
  sources: ['yb_typhoid', 'cdc_destinations'],
});
