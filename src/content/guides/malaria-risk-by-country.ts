import { defineGuide } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const rx = K.malariaRx();
const noRes = rx.filter((d) => d.m!.r === 'None');
const mdr = rx.filter((d) => /mefloquine/i.test(d.m!.r));
const noMal = K.dests.filter((d) => !d.m || d.m.l !== 'P');
const short = (a: string[]) => { const t = a.join('; ').replace(/[–—]/g, '-'); return t.length > 170 ? `${t.slice(0, 167).replace(/\s+\S*$/, '')}…` : t; };

export default defineGuide({
  id: 'malaria-risk-by-country', group: 'malaria', order: 20, slug: 'malaria-risk-by-country',
  nav: 'Malaria by country', card: `The ${rx.length} countries where CDC advises malaria tablets: areas, resistance and drugs that work.`,
  title: 'Malaria Risk by Country 2026: Areas, Resistance and Drugs',
  description: `Malaria risk by country in 2026: the ${rx.length} countries where CDC advises tablets, the areas at risk, drug resistance and the medicines CDC lists for each one.`,
  h1: 'Malaria risk by country',
  intro: 'Pick a country: the checker shows the areas CDC lists for malaria, the species, the resistance and the drugs that work there.',
  resume: `On ${K.day(K.CDC_DATE)}, CDC's destination pages advised prescription medicine to prevent malaria for ${K.num(rx.length)} countries and territories, most of them in sub-Saharan Africa, South and Southeast Asia, the Pacific, and Central and South America. The risk is rarely uniform: many pages limit it to areas below a given altitude, to rural districts, to some provinces or to some months, and name cities that are free of it. For each country, CDC also states whether the parasite resists chloroquine and lists the drugs that work. Chloroquine resistance is the rule; only ${K.num(noRes.length)} countries, mostly in Central America and the Caribbean plus the two Koreas, report none, which is why chloroquine is on so few lists. ${K.num(mdr.length)} countries of the Mekong region also report mefloquine resistance. Everywhere else in the table, atovaquone-proguanil, doxycycline, mefloquine and tafenoquine are the usual four. The other ${K.num(noMal.length)} destinations CDC covers have no prescription advice, though some mention rare cases.`,
  body: (h) => `
<h2>How to read the table</h2>
<p>Each row is a country where CDC advises malaria medicine. The areas column is CDC's wording, shortened where it runs long; the full text, with altitudes and province names, is on the country's CDC page and on this site's country pages. The drugs column lists those CDC names for the country. A country can appear even if the risk is limited to a small region; the decision for a given itinerary depends on where you stay, when, and how.</p>
${h.table(['Country', 'Areas with malaria', 'Resistance', 'Drugs CDC lists'], rx.map((d) => [h.cdc(d.s, d.n), short(d.m!.a), d.m!.r || 'not stated', d.m!.p.map((x) => K.DRUG[x]).join(', ')]), `CDC destination pages, malaria section, read up to ${K.day(K.CDC_DATE)}.`, ['l', 'l', 'l', 'l'])}
<h2>Resistance, the line that picks the drug</h2>
<p>Chloroquine was once the standard malaria drug; Plasmodium falciparum now resists it across Africa, Asia and South America. Where CDC writes "Chloroquine" in the resistance line, chloroquine is not used for prevention. Where it writes "None", in Mexico, Central America, Haiti, the Dominican Republic and the Koreas, chloroquine still works and is listed with the others, sometimes with primaquine where Plasmodium vivax dominates. In the Mekong countries, Burma, Cambodia, Laos, Thailand and Vietnam, resistance to mefloquine as well narrows the list in the border areas where malaria persists. These lines matter more than the country name: two countries on the same continent can need different drugs.</p>
${h.mini('risk', { t: 'Malaria areas and drugs for another country', p: ['c'], d: { c: 'thailand' } })}
<h2>Where the risk is limited</h2>
<p>Many travelers on the list never enter a risk area. In Thailand, CDC places malaria primarily in the provinces bordering Burma, Cambodia and Malaysia, reports rare to few cases in Bangkok, Chiang Mai, Phuket and Koh Samui, and none on the islands of Krabi Province or in Pattaya City. In Mexico, CDC names Campeche, Chiapas and the southern part of Chihuahua, with rare cases in four other states, and none along the border with the United States. In Peru, risk covers all areas below 2,500 meters east of the Andes, Iquitos and Puerto Maldonado included, while Lima Province, the city of Cusco, Machu Picchu and Lake Titicaca have none. In India, by contrast, CDC lists all areas below 2,000 meters, cities included, and much of sub-Saharan Africa has risk throughout, including the cities and game parks. A prescriber looks at the exact itinerary, the season and the lodging before writing a prescription, and may advise bite prevention alone for low risk areas.</p>
<h2>Season, lodging and length of stay</h2>
<p>Several CDC pages add a season to the area: Afghanistan lists April to December, and other countries name the rainy months. Outside them, risk drops but rarely to zero, which is why prescribers often follow the area rule all year. Lodging counts as well. A night in a screened, air-conditioned hotel in a risk district exposes a traveler far less than camping or a village homestay in the same place, and long stays add up the nights. Travelers visiting friends and relatives in their country of origin are among the groups most often diagnosed with malaria after a trip in the United States, in part because they stay longer, in homes rather than hotels, and sometimes skip tablets in the belief that they are immune. Immunity acquired in childhood fades within a few years of living elsewhere.</p>
<h2>Species</h2>
<p>CDC also names the species. Plasmodium falciparum causes most severe malaria and most deaths and dominates in Africa. Plasmodium vivax, common in Asia and the Americas, can hide in the liver and relapse months later, which is why primaquine or tafenoquine is sometimes added after the trip for people heavily exposed. The species line on each CDC page tells a prescriber which of these concerns applies.</p>
<h2>Countries off the list</h2>
<p>For the other ${K.num(noMal.length)} destinations, CDC's pages give no prescription advice: there is no malaria transmission, or the risk is so low that bite prevention is enough. Some of them mention rare cases or a recent history of transmission; the country page says so when it does. A traveler going on from one of them to a country in the table needs the tablets for that part only, starting before the border.</p>
<p>The ${h.a('malaria-pills', 'malaria pills page')} counts tablets for any stay, and each country page of this site shows CDC's full malaria text.</p>
`,
  faqs: [
    { q: 'Which countries have malaria in 2026?', a: `CDC destination pages advise prescription medicine for ${K.num(rx.length)} countries and territories, in sub-Saharan Africa, South and Southeast Asia, the Pacific, and Central and South America. In many of them the risk is limited to some areas, altitudes or seasons, so the country name alone does not settle whether a trip needs tablets.` },
    { q: 'Is there malaria in Mexico, Thailand or Peru tourist areas?', a: 'CDC names Campeche, Chiapas and southern Chihuahua for Mexico; the border provinces for Thailand, with rare cases in Bangkok or Phuket; and areas below 2,500 meters east of the Andes for Peru, with no transmission in Lima, Cusco or Machu Picchu. Each country page quotes CDC in full, and a prescriber confirms for the exact route.' },
    { q: 'What does chloroquine resistance mean for a traveler?', a: 'That chloroquine will not prevent malaria in that country, so another drug is needed: atovaquone-proguanil, doxycycline, mefloquine or tafenoquine in most of the world. CDC reports no chloroquine resistance only in Mexico, Central America, Haiti, the Dominican Republic and the Koreas, where chloroquine stays on the list.' },
  ],
  tool: 'risk', toolArg: { c: 'kenya' },
  related: ['malaria-pills', 'country:kenya', 'country:india', 'country:mexico', 'vaccines-for-africa'],
  sources: ['cdc_destinations', 'yb_malaria'],
});
