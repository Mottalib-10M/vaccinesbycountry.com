import { defineGuide } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';
import { REGIONS, regionRows } from '../../lib/regions';

const rows = regionRows(REGIONS.africa);
const n = (f: (r: (typeof rows)[number]) => boolean) => rows.filter(f).length;
const yfRec = n((r) => r.yfRec.startsWith('recommended'));
const yfAll = rows.filter((r) => r.yfRule === 'every traveler');
const mal = n((r) => r.malaria === 'tablets');
const tyMost = n((r) => r.typhoid === 'most');
const mening = K.dests.filter((d) => REGIONS.africa.includes(d.s) && d.d.meningococcal === 'S');
const safari = K.range(['hepA', 'typhoid_inj', 'yellowFever']);

export default defineGuide({
  id: 'vaccines-for-africa', group: 'trip', order: 30, slug: 'vaccines-for-africa',
  nav: 'Vaccines for Africa', card: `Hepatitis A, typhoid, yellow fever and malaria across ${rows.length} African destinations, in one table.`,
  title: 'Vaccines for Africa 2026: CDC Table, Yellow Fever, Malaria',
  description: `Vaccines for Africa in 2026: the CDC list for ${rows.length} destinations in one table, the ${yfAll.length} that ask every traveler for yellow fever, malaria tablets, and US prices.`,
  h1: 'Vaccines for Africa: the CDC list country by country',
  intro: 'Enter up to three African stops in order: the checker builds the CDC list, applies each yellow fever border rule along the route and prices the shots.',
  resume: `Africa is where travel vaccine lists are longest and yellow fever rules are strictest. Across the ${K.num(rows.length)} African destinations on CDC's pages, hepatitis A is listed for most travelers almost everywhere, and typhoid for most travelers to ${K.num(tyMost)}. Yellow fever vaccine is recommended, for the whole country or for some areas, in ${K.num(yfRec)}, a belt that runs from Senegal to Kenya and south to Angola; ${K.num(yfAll.length)} of them ask every arriving traveler for the certificate, and most of the others ask it of travelers coming from a country with risk, which often means a neighbor on the same trip. CDC advises malaria tablets for ${K.num(mal)} of the ${K.num(rows.length)}, most of sub-Saharan Africa, cities and game parks included. Meningococcal vaccine is listed for some travelers to ${K.num(mening.length)} countries of the meningitis belt in the dry season. North Africa and the southern tip have shorter lists. A safari list of hepatitis A, typhoid and yellow fever costs ${K.usd(safari.min)} to ${K.usd(safari.max)} with fees at US health departments.`,
  body: (h) => `
<h2>The table</h2>
<p>For each destination: CDC's level for hepatitis A and typhoid (most, some or consider travelers), its yellow fever advice, the certificate rule at the border, and whether it advises malaria tablets. Each name links to CDC's own page; the country pages of this site quote it in full.</p>
${h.table(['Destination', 'Hepatitis A', 'Typhoid', 'Yellow fever advice', 'Certificate asked of', 'Malaria'], rows.map((r) => [h.cdc(r.s, r.n), r.hepA, r.typhoid, r.yfRec, r.yfRule, r.malaria]), `CDC destination pages, read up to ${K.day(K.CDC_DATE)}.`, ['l', 'l', 'l', 'l', 'l', 'l'])}
<h2>Yellow fever along a route</h2>
<p>A single African trip often crosses several borders, and the yellow fever rules chain. Ghana, Uganda, the Democratic Republic of the Congo, Burkina Faso and the other countries that ask every traveler need the certificate whatever the route. Kenya, Tanzania, Rwanda, Ethiopia, South Africa and many others ask only travelers coming from a country with risk, so the first border may not ask, and the second will: a traveler going from Kenya to Tanzania, or from Uganda to Rwanda, needs the certificate at the second border. South Africa asks it of travelers arriving from Zambia, among others, which catches many Victoria Falls itineraries. Tanzania counts a transit of more than 12 hours. The ${h.a('home', 'trip checker')} applies the rules in the order of the stops; the ${h.a('yellow-fever-certificate-countries', 'certificate page')} lists every rule.</p>
${h.mini('trip', { t: 'Kenya, then Tanzania, then Zanzibar', p: ['s1', 's2', 's3'], d: { s1: 'kenya', s2: 'tanzania', s3: 'none' } })}
<h2>Malaria across the continent</h2>
<p>In most of sub-Saharan Africa, CDC describes malaria in all areas, cities and game parks included, with Plasmodium falciparum, the species behind most severe cases, and resistance to chloroquine. The drugs it lists there are atovaquone-proguanil, doxycycline, mefloquine and tafenoquine. The exceptions are at the edges: Cape Verde, Mauritius, Seychelles, Lesotho, and North Africa from Morocco to Egypt have no prescription advice, and in South Africa, Namibia, Botswana and Eswatini the risk is limited to listed northern or eastern areas, such as the Kruger area. Kenya and Ethiopia exclude highlands above set altitudes. The ${h.a('malaria-pills', 'malaria pills page')} counts the tablets for a stay.</p>
<h2>Food, water and other lines</h2>
<p>Hepatitis A and typhoid are the two shots that start almost every African list, since both spread through food and water. Cholera appears for areas of active transmission in many countries of eastern and southern Africa and in Nigeria and Ghana, as a vaccine to consider. Polio boosters are listed where poliovirus was identified in the past year, which on CDC's pages includes a long list of African countries, Nigeria, Ethiopia and the Democratic Republic of the Congo among them. Rabies is to discuss with a clinician everywhere, and dogs are the main source on the continent. Meningococcal vaccine applies to the meningitis belt in the dry season, roughly December to June.</p>
${h.mini('cost', { t: 'A safari list priced', p: ['dept', 'yellowFever'], d: { hepA: 'yes', typ: 'inj', yellowFever: 'yes', drug: 'atovaquone-proguanil', td: 10 } })}
<h2>Visiting family</h2>
<p>Many travelers to Africa are going home to see relatives, often for weeks, staying in houses rather than hotels and eating family meals. CDC's lists apply to them as to any traveler; people who grew up in a country with malaria lose their partial immunity within a few years abroad, and children born elsewhere never had it. Visits to friends and relatives are among the trips most often linked to malaria and typhoid diagnosed after travel in the United States. The same is true of yellow fever: a certificate is asked of a returning national as of anyone else at the borders that ask every traveler. A long family stay is also the case where CDC's some travelers lines, such as rabies or meningococcal vaccine in the dry season, are most likely to apply, which is worth telling the clinician at the visit.</p>
<h2>Planning the visit</h2>
<p>The yellow fever certificate becomes valid ten days after the shot, and the vaccine is given only at designated centers, so it sets the earliest useful date for an African trip that needs it. Typhoid needs two weeks, malaria tablets start one day to two weeks ahead depending on the drug, and hepatitis A can be given up to the departure day. A visit four to six weeks before leaving fits all of them, with room for a second visit if a series needs one. The ${h.a('country:kenya', 'Kenya')}, ${h.a('country:tanzania', 'Tanzania')}, ${h.a('country:ghana', 'Ghana')} and ${h.a('country:south-africa', 'South Africa')} pages go into the detail of four common trips.</p>
`,
  faqs: [
    { q: 'Do I need a yellow fever vaccine to travel to Africa?', a: `It depends on the countries and the route. ${K.num(yfAll.length)} African countries ask every traveler for the certificate, and most of the others ask travelers who come from a country with risk, which can include a neighbor visited on the same trip. CDC recommends the vaccine itself for much of West and Central Africa and parts of East Africa.` },
    { q: 'What shots are usually needed for a safari in East Africa?', a: 'On the CDC pages for Kenya and Tanzania, hepatitis A and typhoid are listed for most travelers, yellow fever is recommended for most of Kenya outside Nairobi and the coast, and malaria tablets are advised. Tanzania asks for a yellow fever certificate after Kenya. A clinician adds rabies, cholera or meningococcal vaccine depending on the trip.' },
    { q: 'Is there malaria in all of Africa?', a: `No. CDC advises tablets for ${K.num(mal)} of the ${K.num(rows.length)} African destinations on its pages. North Africa, Cape Verde, Mauritius, Seychelles and Lesotho have no prescription advice, and in South Africa, Namibia, Botswana and Eswatini the risk is limited to some northern or eastern areas.` },
  ],
  tool: 'trip', toolArg: { s1: 'kenya', s2: 'tanzania' },
  related: ['country:kenya', 'country:tanzania', 'country:ghana', 'country:south-africa', 'yellow-fever-certificate-countries', 'malaria-pills'],
  sources: ['cdc_destinations', 'yb_yellow_fever', 'yb_malaria'],
});
