import { defineGuide } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const p = K.price('chikungunya');
const outbreak = K.dests.filter((d) => d.d.chikungunya === 'S');
const elevated = K.dests.filter((d) => d.d.chikungunya === 'C');

export default defineGuide({
  id: 'chikungunya-vaccine', group: 'vaccines', order: 60, slug: 'chikungunya-vaccine',
  nav: 'Chikungunya vaccine', card: 'One dose of Vimkunya from age 12: outbreak areas, long stays, and the published price.',
  title: 'Chikungunya Vaccine 2026: Vimkunya, Who It Is For, Cost',
  description: `Chikungunya vaccine in 2026: one Vimkunya dose from age 12, the ${outbreak.length} outbreak destinations and ${elevated.length} elevated-risk ones on CDC pages, long stays, US prices.`,
  h1: 'Chikungunya vaccine: outbreaks and long stays',
  intro: 'Pick your destination below the checker, or set your departure in it: the vaccine, its dose and its price at public price lists appear at once.',
  resume: `Chikungunya is a virus spread by the same Aedes mosquitoes as dengue. It is rarely fatal, but the joint pain it causes can last months, sometimes years, especially in older adults. The vaccine CDC describes as available in the United States, Vimkunya, is a single dose for people aged 12 and older; it is a virus-like particle vaccine that does not contain live or weakened virus. CDC recommends it for adolescents and adults traveling to an area with a chikungunya outbreak, which its destination pages state for ${K.num(outbreak.length)} destinations (${outbreak.map((d) => d.n).join(', ')}) as of ${K.day(K.CDC_DATE)}. For ${K.num(elevated.length)} more destinations, where CDC describes an elevated risk for US travelers, vaccination may be considered for people traveling or moving there for an extended period, for example six months or more. At the ${K.num(p.n)} health departments that list it, the dose costs ${K.usd(p.min)} to ${K.usd(p.max)}, median ${K.usd(p.median)}.`,
  body: (h) => `
<h2>Two situations, two wordings</h2>
<p>CDC separates outbreaks from background risk. Where an outbreak is under way, the country page says so and states that chikungunya vaccination is recommended for people traveling to an area with a chikungunya outbreak; on ${K.day(K.CDC_DATE)} that was the case for ${outbreak.map((d) => d.n).join(', ')}. Outbreaks come and go, and the list changes with them, which is why this site rereads the CDC pages every month and shows the date beside each one. Where the virus circulates without an outbreak, the page speaks of elevated chikungunya risk and says vaccination may be considered for people traveling or moving there who plan to stay for an extended period, for example six months or more. That covers ${K.num(elevated.length)} destinations across Latin America, Africa, South and Southeast Asia and the islands of the Indian Ocean, including Brazil, Mexico, India, Thailand, Kenya and Mauritius.</p>
${h.mini('trip', { t: 'What CDC says about chikungunya for your destination', p: ['s1'], d: { s1: 'brazil' } })}
<h2>The vaccine</h2>
<p>Vimkunya is given as one injection. It is approved from 12 years of age; there is no chikungunya vaccine for younger children in the United States, so families rely on bite prevention. CDC states that people who had a severe allergic reaction to a component of the vaccine should not receive it, that pregnant women should discuss the risks and benefits with a healthcare provider, and that people with a weakened immune system may get less protection. CDC's vaccine page does not give a number of days before travel; the checker therefore shows the dose without a protection date, and a clinician can say how early to have it.</p>
${h.mini('vaccine', { t: 'Chikungunya dose and price', p: ['dept'], d: { vx: 'chikungunya', wk: 4 } })}
<h2>Reading an outbreak notice</h2>
<p>An outbreak line on a CDC country page usually comes with a travel health notice at the top of the same page, which names the regions affected and the date it was posted. The vaccine recommendation applies to the area of the outbreak, not always to the whole country; a beach resort far from the affected province may sit outside it. Notices are lifted when case counts fall, and the recommendation then returns to the long stay wording. For a trip booked months ahead, it makes sense to look again at the country page a few weeks before departure, which is also the time of the clinic visit. Each destination page on this site shows the notices CDC listed and the date the CDC page was last reviewed, so a stale line is easy to spot.</p>
<h2>Who is usually most concerned</h2>
<p>The illness is worst for people over 65 and for those with chronic conditions such as diabetes or heart disease, who are more likely to have severe or lasting symptoms, and for newborns infected around birth. For a healthy adult on a two week holiday outside an outbreak, CDC's pages do not list the vaccine; for a retiree spending a winter in a country with elevated risk, or for someone moving there, they suggest considering it. The decision belongs with a clinician who knows the traveler's health and the latest outbreak notices.</p>
<h2>What it costs</h2>
<p>Only ${K.num(p.n)} of the health departments read for this site publish a price for the chikungunya vaccine, between ${K.usd(p.min)} and ${K.usd(p.max)} for the single dose. It is not on the CDC private-sector price list, and as a travel-only vaccine it is often outside insurance coverage. The ${h.a('travel-vaccines-cost', 'trip cost page')} adds it to the rest of a list.</p>
<h2>Bites, still the main protection</h2>
<p>Aedes mosquitoes bite during the day, indoors and outdoors, in cities as much as in the countryside. Repellent with an ingredient registered for the purpose, clothing that covers arms and legs, and rooms with screens or air conditioning protect against chikungunya, dengue and Zika at once. No vaccine replaces them, and no dengue or Zika vaccine is offered to travelers in the United States. A traveler who develops fever and joint pain after a trip should mention where they traveled, since dengue, which looks similar at first, needs different care.</p>
`,
  faqs: [
    { q: 'Is the chikungunya vaccine recommended for a short holiday?', a: 'Only where CDC reports an outbreak. In those places, the page states that vaccination is recommended for people traveling to the outbreak area. Elsewhere in regions with elevated risk, CDC suggests considering it for long stays, for example six months or more, so most short holidays outside an outbreak are not concerned.' },
    { q: 'Which chikungunya vaccine is available in the United States?', a: 'CDC describes Vimkunya, a single dose virus-like particle vaccine for people aged 12 and older that contains no live or weakened virus. People with a severe allergy to a component should not receive it; pregnancy calls for a discussion with a healthcare provider, and a weakened immune system may reduce the protection, according to CDC.' },
    { q: 'Can children get the chikungunya vaccine?', a: 'Not under 12 in the United States, since Vimkunya is approved from that age. Younger children traveling to outbreak areas are protected by bite prevention: repellent suitable for their age, long sleeves, and screened or air-conditioned rooms. Aedes mosquitoes bite during the day, so the protection applies from morning to evening.' },
    { q: 'How does chikungunya differ from dengue for a traveler?', a: 'Both come from the same day-biting mosquitoes and start with fever. Chikungunya is known for severe joint pain that can last months; dengue can turn severe with bleeding or shock and needs medical follow-up. There is a chikungunya vaccine for some travelers but no dengue vaccine for travelers in the United States, so bite prevention covers both.' },
  ],
  tool: 'vaccine', toolArg: { vx: 'chikungunya', wk: 4 },
  related: ['country:costa-rica', 'country:brazil', 'vaccines-for-south-america', 'travel-vaccines-cost'],
  sources: ['cdc_chik', 'cdc_destinations'],
});
