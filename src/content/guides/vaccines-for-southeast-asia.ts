import { defineGuide } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';
import { REGIONS, regionRows } from '../../lib/regions';

const rows = regionRows(REGIONS.southeastAsia);
const je = K.dests.filter((d) => REGIONS.southeastAsia.includes(d.s) && d.d.je === 'S');
const tyMost = rows.filter((r) => r.typhoid === 'most');
const mal = rows.filter((r) => r.malaria === 'tablets');
const yfFrom = rows.filter((r) => r.yfRule !== 'no');
const basic = K.range(['hepA', 'typhoid_inj']);
const withJe = K.range(['hepA', 'typhoid_inj', 'je']);

export default defineGuide({
  id: 'vaccines-for-southeast-asia', group: 'trip', order: 32, slug: 'vaccines-for-southeast-asia',
  nav: 'Vaccines for Southeast Asia', card: 'Hepatitis A, typhoid, Japanese encephalitis, rabies and border-area malaria across the region.',
  title: 'Vaccines for Southeast Asia 2026: CDC List for 11 Countries',
  description: `Vaccines for Southeast Asia in 2026: CDC's list for ${rows.length} countries in one table, Japanese encephalitis, malaria in border areas, yellow fever transits, US prices.`,
  h1: 'Vaccines for Southeast Asia',
  intro: 'Enter up to three stops, such as Thailand, Cambodia and Vietnam: the checker builds the CDC list for the route, the latest start dates and the price.',
  resume: `Southeast Asia shares one list with local variations. Across the ${K.num(rows.length)} countries, CDC lists hepatitis A for most travelers almost everywhere and typhoid for most travelers to ${K.num(tyMost.length)}, Singapore and Brunei being the main exceptions. Japanese encephalitis is listed for some travelers in ${K.num(je.length)} of them: long stays, rural trips in the season, nights without screens. Rabies is common in dogs and monkeys and is a vaccine to discuss for every country. CDC advises malaria tablets for ${K.num(mal.length)}, but on most of their pages the risk is limited to forested border areas, provinces or islands far from the usual tourist routes, and the Mekong countries add mefloquine resistance. Yellow fever does not exist in the region, yet ${K.num(yfFrom.length)} countries ask for the certificate from travelers who come from a country with risk, sometimes after a long transit. Hepatitis A and typhoid cost ${K.usd(basic.min)} to ${K.usd(basic.max)} with fees at US health departments; adding Japanese encephalitis brings it to ${K.usd(withJe.min)} to ${K.usd(withJe.max)}.`,
  body: (h) => `
<h2>The table</h2>
<p>For each country, CDC's level for hepatitis A and typhoid, its yellow fever advice and border rule, and whether it advises malaria tablets somewhere in the country. The country pages on this site quote CDC's full text, which is where the malaria areas are named.</p>
${h.table(['Country', 'Hepatitis A', 'Typhoid', 'Yellow fever advice', 'Certificate asked of', 'Malaria'], rows.map((r) => [h.cdc(r.s, r.n), r.hepA, r.typhoid, r.yfRec, r.yfRule, r.malaria]), `CDC destination pages, read up to ${K.day(K.CDC_DATE)}.`, ['l', 'l', 'l', 'l', 'l', 'l'])}
<h2>Japanese encephalitis: the regional question</h2>
<p>Japanese encephalitis is the vaccine that most separates one Southeast Asia trip from another. CDC's wording is identical on every country page: recommended for people moving to the region, staying a month or more in affected areas or traveling there often; to consider for shorter trips with rural visits, hiking, camping, or nights without air conditioning, screens or bed nets; not recommended for short trips limited to cities. A two week island and city holiday in Thailand falls in the last group; three months of backpacking through rural Laos and Vietnam in the rainy season falls in the first. The two doses must be finished a week before travel, so the series starts at least ${K.num(K.lead('je', 35))} days ahead for an adult of 18 to 65. The ${h.a('japanese-encephalitis-vaccine', 'Japanese encephalitis page')} covers the schedule and price.</p>
${h.mini('trip', { t: 'Thailand, Cambodia, Vietnam', p: ['s1', 's2', 's3'], d: { s1: 'thailand', s2: 'cambodia', s3: 'vietnam' } })}
<h2>Malaria: mostly at the edges</h2>
<p>Unlike sub-Saharan Africa, malaria in Southeast Asia is concentrated in forested, rural and border areas. CDC's page for Thailand places it primarily in provinces bordering Burma, Cambodia and Malaysia, with rare cases in Bangkok, Chiang Mai and Phuket. In Indonesia, CDC lists all of eastern Indonesia, Labuan Bajo and the Komodo Islands included, and rural areas of Kalimantan, Lombok, Sulawesi and Sumatra; Bali is not among the areas named. In the Philippines, risk is limited to Palawan and the Mindanao island group, with none in Manila or other urban areas. In Vietnam, CDC names rural areas only, and no transmission in Hanoi, Ho Chi Minh City, Da Nang or Nha Trang. In Cambodia, it is isolated to pockets of rural and forested areas, with no or negligible transmission in Phnom Penh and Siem Reap, the town of the Angkor temples. Burma is the exception, with all areas listed. Resistance to chloroquine is general, and in Burma, Cambodia, Laos, Thailand and Vietnam CDC also reports mefloquine resistance, which narrows the drugs to atovaquone-proguanil, doxycycline and tafenoquine in the areas concerned. Many travelers on the classic routes need no tablets; a prescriber decides from the exact itinerary.</p>
<h2>Rabies, dengue and the rest</h2>
<p>Dogs are the main rabies risk across the region, and monkeys at temples and tourist sites bite visitors often enough for CDC to mention them. Pre-exposure rabies vaccine is a matter for a clinician, weighing long stays, remote trips, cycling and children; the ${h.a('rabies-vaccine-for-travel', 'rabies page')} explains what it changes after a bite. Dengue is widespread, in cities as much as in the countryside, and has no vaccine for travelers; chikungunya vaccine may be considered for long stays in most of the region. Cholera appears as a vaccine to consider in Burma and the Philippines, where CDC lists areas of active transmission.</p>
<h2>Singapore, Brunei and the cities</h2>
<p>The shortest lists in the region belong to Singapore and Brunei, where CDC lists typhoid only as a vaccine to consider and advises no malaria tablets. Large cities elsewhere, Bangkok, Kuala Lumpur, Hanoi, Manila or Jakarta, carry the national list for hepatitis A and typhoid, since food and water are the route, but not the rural risks: Japanese encephalitis is not recommended for short city stays, and malaria is absent from most of them. A traveler whose trip is a week in Bangkok and Singapore therefore has a short list, while one heading upriver in Borneo or to the outer islands of Indonesia has a long one, though both are going to Southeast Asia.</p>
<h2>Yellow fever transits</h2>
<p>No Southeast Asian country recommends the yellow fever vaccine for a visit, but most ask for the certificate from travelers who come from a country with risk. A traveler who flies from Nairobi, Addis Ababa, Lagos or São Paulo with a long transit there, or who visited one of those countries first, may need it on arrival in Thailand, the Philippines, Malaysia or Indonesia. The ${h.a('yellow-fever-certificate-countries', 'certificate page')} gives every rule, and the checker above applies them in order.</p>
${h.mini('cost', { t: 'A Southeast Asia list priced', p: ['dept', 'je'], d: { hepA: 'yes', typ: 'inj', je: 'yes' } })}
<p>The ${h.a('country:thailand', 'Thailand')}, ${h.a('country:vietnam', 'Vietnam')}, ${h.a('country:indonesia', 'Indonesia')}, ${h.a('country:philippines', 'Philippines')} and ${h.a('country:cambodia', 'Cambodia')} pages go into each country in detail.</p>
`,
  faqs: [
    { q: 'What vaccines are needed for a backpacking trip in Southeast Asia?', a: 'On CDC pages for the region, hepatitis A and typhoid are listed for most travelers, with routine vaccines and hepatitis B for unvaccinated travelers. Long or rural trips raise Japanese encephalitis, which CDC recommends for a month or more in affected areas, and rabies, which clinicians often discuss for long trips. Malaria tablets depend on the exact areas.' },
    { q: 'Do I need malaria tablets for Thailand, Vietnam or Bali?', a: 'Often not for the usual routes. CDC places Thailand\'s malaria mainly in border provinces, does not name Bali among Indonesia\'s risk areas, and limits Vietnam\'s to rural areas, with none in Hanoi or Ho Chi Minh City. Prescribers advise tablets for those areas and for forest trips, and bite prevention everywhere. Each country page quotes CDC\'s list of areas in full.' },
    { q: 'Does Southeast Asia require a yellow fever certificate?', a: 'Only for travelers coming from a country with yellow fever risk, in Africa or South America, and in some countries after a long transit there. A traveler flying in from the United States, the United Kingdom, Canada or Australia needs none. CDC does not recommend the vaccine itself for any Southeast Asian country.' },
  ],
  tool: 'trip', toolArg: { s1: 'thailand', s2: 'vietnam' },
  related: ['country:thailand', 'country:vietnam', 'country:indonesia', 'country:philippines', 'country:cambodia', 'japanese-encephalitis-vaccine'],
  sources: ['cdc_destinations', 'yb_je', 'yb_malaria'],
});
