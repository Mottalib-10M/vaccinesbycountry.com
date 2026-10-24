import { defineGuide } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';
import { REGIONS, regionRows } from '../../lib/regions';

const rows = regionRows(REGIONS.southAmerica);
const yfRec = rows.filter((r) => r.yfRec.startsWith('recommended'));
const yfAsk = rows.filter((r) => r.yfRule !== 'no');
const mal = rows.filter((r) => r.malaria === 'tablets');
const amazon = K.range(['hepA', 'yellowFever']);
const yfp = K.price('yellowFever');

export default defineGuide({
  id: 'vaccines-for-south-america', group: 'trip', order: 31, slug: 'vaccines-for-south-america',
  nav: 'Vaccines for South America', card: 'Yellow fever by area, the countries that check it, hepatitis A, typhoid and Amazon malaria.',
  title: 'Vaccines for South America 2026: Yellow Fever by Country',
  description: `Vaccines for South America in 2026: the CDC list for ${rows.length} countries in one table, yellow fever by area and at the border, Amazon malaria and the US prices.`,
  h1: 'Vaccines for South America',
  intro: 'Enter up to three stops in order, for example Peru then Brazil: the checker applies each country\'s yellow fever rule to the route and builds the list.',
  resume: `In South America the travel list turns on one vaccine: yellow fever. CDC recommends it, for the whole country or for listed areas, in ${K.num(yfRec.length)} of the ${K.num(rows.length)} countries, from the Amazon basin to the provinces of Corrientes and Misiones in Argentina; only Chile and Uruguay are outside. The areas are drawn precisely: in Peru the Amazon lowlands but not Lima, Cusco or Machu Picchu; in Brazil most states, Rio de Janeiro, São Paulo and Iguaçu Falls included, but not Fortaleza or Recife. At the border, ${K.num(yfAsk.length)} countries ask for the certificate under some rule, and Bolivia, Colombia and French Guiana ask every traveler. Hepatitis A is listed for most travelers everywhere; typhoid is mostly a vaccine to consider, for longer stays or rural trips. CDC advises malaria tablets for ${K.num(mal.length)} countries, mostly for the Amazon. Chikungunya vaccine may be considered for long stays in most of the continent. Hepatitis A and yellow fever, a common Amazon pair, cost ${K.usd(amazon.min)} to ${K.usd(amazon.max)} with fees at US health departments.`,
  body: (h) => `
<h2>The table</h2>
<p>Each row gives CDC's level for hepatitis A and typhoid, its yellow fever advice, the border rule and the malaria advice. A yellow fever line that says some areas means the CDC page names regions, altitudes or cities; the country pages on this site quote them in full.</p>
${h.table(['Country', 'Hepatitis A', 'Typhoid', 'Yellow fever advice', 'Certificate asked of', 'Malaria'], rows.map((r) => [h.cdc(r.s, r.n), r.hepA, r.typhoid, r.yfRec, r.yfRule, r.malaria]), `CDC destination pages, read up to ${K.day(K.CDC_DATE)}.`, ['l', 'l', 'l', 'l', 'l', 'l'])}
<h2>Yellow fever: where, and at which border</h2>
<p>South America has two yellow fever maps. The first is CDC's advice, which follows the forests where the virus circulates between monkeys and mosquitoes and occasionally reaches people: most of the Amazon basin, the Guianas, the eastern slopes of the Andes, and in Brazil a band of states that grew after the outbreaks of the late 2010s. The second is the border rules, and they do not follow the map. Brazil and Peru, with large risk areas, ask no certificate at entry. Bolivia, Colombia and French Guiana ask every traveler, whatever their plans. Ecuador, Paraguay and Venezuela name the countries they check, Brazil among them, so a traveler coming from Brazil needs it there. Outside the continent, Panama and many Caribbean islands ask it of travelers arriving from a country with risk, Costa Rica names most South American countries in its rule, and the Dominican Republic names Brazil, which catches multi-country trips on the way back north.</p>
${h.mini('trip', { t: 'Peru, then Brazil, then Paraguay', p: ['s1', 's2', 's3'], d: { s1: 'peru', s2: 'brazil', s3: 'paraguay' } })}
<h2>Argentina, the Iguaçu Falls and the far south</h2>
<p>Iguaçu Falls sit on the border of Brazil and Argentina, and both CDC pages cover them: Brazil lists the falls among the areas where the vaccine is recommended, and Argentina recommends it for travelers going to Corrientes and Misiones provinces, where the Argentine side of the falls lies. Elsewhere in Argentina the vaccine is generally not recommended for Formosa and some areas of Chaco, Jujuy and Salta, and not recommended for the rest, Buenos Aires, Mendoza and Patagonia included. Chile and Uruguay have no yellow fever advice at all, and neither has malaria. A long trip that ends in Patagonia after the Amazon still needs the shot for the Amazon part, ten days before entering it.</p>
<h2>High altitude and big cities</h2>
<p>Many South American trips stay in places with no yellow fever or malaria risk: Lima, Cusco and the Sacred Valley, La Paz, Quito, Bogotá, Santiago, Buenos Aires. CDC's pages say so in their lists of areas excluded from the recommendation, often with an altitude line, 2,300 meters for yellow fever in the Andes. For such a trip, the list may come down to hepatitis A and routine vaccines, with typhoid and rabies to discuss. Altitude itself is not a vaccine question but a medical one, and a clinician can advise on medicine for altitude illness at the same visit.</p>
<h2>The Amazon</h2>
<p>A trip into the Amazon, from Iquitos, Puerto Maldonado, Manaus, Leticia or the Ecuadorian Oriente, sits in the yellow fever area, and CDC advises malaria tablets for it, with Plasmodium vivax and falciparum and resistance to chloroquine. Atovaquone-proguanil, doxycycline, mefloquine and tafenoquine are the usual drugs. The yellow fever shot, at ${K.usd(yfp.min)} to ${K.usd(yfp.max)} at US health departments, must be given ten days before arrival; the ${h.a('malaria-pills', 'malaria pills page')} counts the tablets.</p>
${h.mini('cost', { t: 'Amazon list priced', p: ['dept', 'typ'], d: { hepA: 'yes', typ: 'none', yellowFever: 'yes', drug: 'atovaquone-proguanil', td: 7 } })}
<h2>Mosquitoes in the cities</h2>
<p>Dengue, chikungunya and Zika are carried by the Aedes mosquitoes of towns and cities, from Rio to Asunción, and they bite during the day. CDC lists chikungunya vaccine as one to consider for stays of six months or more in most of the continent, and as recommended in an outbreak area, such as French Guiana on CDC's latest pages. No vaccine is offered to travelers for dengue or Zika, so repellent and covered skin protect against all three.</p>
<h2>When to see the clinician</h2>
<p>For an Amazon trip, the yellow fever shot sets the calendar: ten days before entering the risk area or the border that asks for it, at a designated center. Typhoid, where a clinician advises it, needs two weeks. Malaria tablets start one or two days before for the daily drugs, two weeks before for mefloquine. Four to six weeks before departure leaves room for all of them and for a clinic that gives yellow fever only on certain days. Travelers aged 60 and over who have never had the yellow fever vaccine should allow time for the longer discussion CDC asks clinicians to have at that age.</p>
<p>The ${h.a('country:peru', 'Peru')}, ${h.a('country:brazil', 'Brazil')} and ${h.a('country:colombia', 'Colombia')} pages give the full detail of three common trips.</p>
`,
  faqs: [
    { q: 'Do I need a yellow fever vaccine for South America?', a: 'For some trips. CDC recommends it for much of the Amazon basin, the Guianas and parts of Brazil, Argentina and the Andes, but not for Chile, Uruguay or high places such as Cusco or La Paz. At the border, Bolivia, Colombia and French Guiana ask every traveler for the certificate, and Ecuador, Paraguay and Venezuela ask travelers coming from Brazil and other named countries.' },
    { q: 'Is the yellow fever vaccine needed for Machu Picchu?', a: 'CDC does not recommend it for travelers whose itinerary is limited to Cusco, the Sacred Valley and Machu Picchu, nor for Lima. It is recommended for the Amazon areas of Peru. Peru asks no certificate at entry, but a next country on the route, such as Bolivia or Colombia, may.' },
    { q: 'Which South American countries ask every traveler for a yellow fever certificate?', a: `On CDC's pages read on ${K.day(K.CDC_DATE)}, Bolivia, Colombia and French Guiana ask every arriving traveler, from the minimum age their rule states. Other countries of the continent ask it only of travelers from countries with risk, name the countries they check, or ask nothing at entry. Rules change, so the embassy confirms.` },
  ],
  tool: 'trip', toolArg: { s1: 'peru', s2: 'brazil' },
  related: ['country:peru', 'country:brazil', 'country:colombia', 'yellow-fever-vaccine', 'yellow-fever-certificate-countries', 'chikungunya-vaccine'],
  sources: ['cdc_destinations', 'yb_yellow_fever', 'yb_malaria'],
});
