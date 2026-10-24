import { defineGuide } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const p = K.price('cholera');
const consider = K.dests.filter((d) => d.d.cholera === 'C');
const ended = K.dests.filter((d) => d.d.cholera === 'N');

export default defineGuide({
  id: 'cholera-vaccine', group: 'vaccines', order: 50, slug: 'cholera-vaccine',
  nav: 'Cholera vaccine', card: 'One oral dose ten days ahead, for areas with active transmission: the rules and the price.',
  title: 'Cholera Vaccine 2026: Vaxchora, Who It Is For, Timing, Price',
  description: `Cholera vaccine in 2026: one oral dose of Vaxchora 10 days before exposure, the ${consider.length} destinations with active transmission on CDC pages, food rules and US prices.`,
  h1: 'Cholera vaccine: one oral dose, for some trips',
  intro: 'Set your departure: the checker says whether the single oral dose still fits ten days ahead and what it costs at public price lists.',
  resume: `The cholera vaccine sold in the United States, Vaxchora, is a single oral dose: a liquid drunk at least ${K.num(K.lead('cholera'))} days before possible exposure, with no food or drink for 60 minutes before and after. It is licensed for ages 2 to 64. CDC does not recommend it for most travelers from the United States, because cholera is rare in travelers; the Yellow Book recommends it for travelers going to areas of active cholera transmission, and CDC's destination pages say vaccination may be considered for ${K.num(consider.length)} destinations where such areas exist, from Haiti to Yemen and much of eastern and southern Africa. Each page names the areas and how recently the last case was reported. In trials among adults of 18 to 45, the vaccine prevented 90 percent of severe diarrhea at 10 days and 80 percent at 3 months. At the ${K.num(p.n)} health departments that publish a price, the dose costs ${K.usd(p.min)} to ${K.usd(p.max)}, median ${K.usd(p.median)}.`,
  body: (h) => `
<h2>Where CDC mentions it</h2>
<p>Cholera spreads through water and food contaminated by sewage, and it flares up after floods, conflicts and displacement. CDC's destination pages follow those outbreaks: for ${K.num(consider.length)} destinations they list areas of active cholera transmission, sometimes down to the county, with the time since the last case, and add that vaccination may be considered for children and adults traveling to those areas. The list includes Afghanistan, Bangladesh, India, Nepal, Pakistan, the Philippines, Haiti, Iraq, Syria and Yemen, and many countries of Africa, among them Ethiopia, Kenya, Tanzania, Uganda, Mozambique, Malawi, Zambia, Zimbabwe, Nigeria, Ghana and the Democratic Republic of the Congo. For ${K.num(ended.length)} other destinations, among them ${ended.slice(0, 4).map((d) => d.n).join(', ')}, the page says there is no longer active cholera transmission and the vaccine is not recommended. The checker on each ${h.a('home', 'trip page')} shows the wording for your stops.</p>
${h.mini('trip', { t: 'Does CDC list cholera areas for your trip?', p: ['s1'], d: { s1: 'haiti' } })}
<h2>Who it is usually for</h2>
<p>Cholera is rare in travelers who stay in hotels and eat cooked food. The vaccine is most often discussed for aid workers, health care workers and responders in outbreak zones, travelers visiting friends and relatives in affected areas, and people staying in places with limited access to clean water and medical care. The Yellow Book also points to factors that raise the risk of severe disease, such as reduced stomach acid. The vaccine is one tool among others; boiled or treated water, cooked food and hand washing protect against cholera and many other infections at the same time.</p>
<h2>How the dose is taken</h2>
<p>Vaxchora comes as a packet of buffer and a packet of vaccine mixed in cold or room temperature water and drunk at once. The traveler avoids eating or drinking for an hour before and an hour after. It must be taken at least ten days before possible exposure. Because it is a live vaccine, CDC asks clinicians not to give it to people who took antibiotics in the previous 14 days, and malaria prevention with chloroquine should start at least ten days after it; atovaquone-proguanil did not reduce the immune response in two studies. The safety and efficacy of a second dose have not been established, so there is no booster schedule.</p>
${h.mini('vaccine', { t: 'Cholera dose: still in time?', p: ['wk'], d: { vx: 'cholera', wk: 1 } })}
<h2>What it costs</h2>
<p>Only ${K.num(p.n)} of the health departments read for this site list the cholera vaccine, at ${K.usd(p.min)} to ${K.usd(p.max)} a dose, so it can cost as much as a yellow fever shot. Some clinics do not stock it and order it on request, which adds days to the plan. It is not on the CDC private-sector price list, and insurance rarely covers it for travel. The ${h.a('travel-vaccines-cost', 'trip cost page')} adds it to a full list, and the ${h.a('travel-clinic', 'clinic fees page')} shows the visit fee that may come with it.</p>
<h2>If diarrhea starts during the trip</h2>
<p>Most diarrhea in travelers is not cholera, and most of it stops on its own within a few days. What makes cholera dangerous is the speed of dehydration: large volumes of watery stool can drain the body within hours. The treatment that saves lives is simple and cheap, oral rehydration salts mixed in safe water, sipped steadily, with medical care as soon as possible when the diarrhea is profuse, when the traveler cannot keep fluids down, or for a young child or an older adult. Packing a few sachets of oral rehydration salts costs little and is useful whatever the cause. A traveler who comes home with diarrhea or fever after a stay in an affected area should tell the clinician where they were, since the tests chosen depend on it.</p>
<h2>Cholera and the yellow fever certificate</h2>
<p>A certificate of cholera vaccination used to be asked at some borders decades ago. The International Health Regulations no longer provide for it, and CDC's destination pages do not list any cholera entry requirement; the only vaccine certificate that borders commonly check today is yellow fever, and in a few cases polio for long stays. A clinician can still record the cholera dose on the yellow booklet for the traveler's own records.</p>
`,
  faqs: [
    { q: 'Is the cholera vaccine required for any country?', a: 'Not under current rules. No country on the CDC destination pages asks for a cholera vaccination certificate at the border. The vaccine is a medical choice for travelers going to areas of active transmission, not an entry document. Yellow fever, and for long stays in a few countries polio, are the certificates borders check.' },
    { q: 'How long before travel should the cholera vaccine be taken?', a: 'At least ten days before possible exposure, according to the CDC Yellow Book. It is one oral dose, taken with no food or drink for an hour before and after. Antibiotics in the previous 14 days stop it from working, and chloroquine for malaria should start at least ten days after it, so the dates are planned together with a clinician.' },
    { q: 'How long does the cholera vaccine protect?', a: 'The trials behind its license measured 90 percent protection against severe diarrhea at ten days and 80 percent at three months in adults of 18 to 45. The Yellow Book states that the safety and efficacy of a second dose have not been established, so there is no booster schedule for repeat travelers yet.' },
    { q: 'Can older adults or young children take Vaxchora?', a: 'The license covers ages 2 to 64. It is not licensed for children under 2 or adults aged 65 or older, who rely on safe food and water and on quick treatment with oral rehydration if diarrhea starts. A clinician can say what applies to a family trip with a toddler or a grandparent.' },
  ],
  tool: 'vaccine', toolArg: { vx: 'cholera', wk: 3 },
  related: ['vaccines-for-africa', 'country:kenya', 'country:india', 'typhoid-vaccine', 'travel-vaccines-cost'],
  sources: ['yb_cholera', 'cdc_destinations'],
});
