import { defineGuide } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const N = K.nhs;
const [w1, w2] = N.advice_weeks;
const LBL: Record<string, string> = { cholera: 'cholera', polio: 'polio (as the combined diphtheria, tetanus and polio jab)', hepA: 'hepatitis A', typhoid: 'typhoid', hepB: 'hepatitis B', je: 'Japanese encephalitis', rabies: 'rabies', tbe: 'tick-borne encephalitis', yellowFever: 'yellow fever' };
const free = N.free.map((k) => LBL[k]);
const paid = N.paid.map((k) => LBL[k]);

export default defineGuide({
  id: 'travel-jabs', group: 'trip', order: 20, slug: 'travel-jabs',
  nav: 'Travel jabs (UK)', card: 'Which travel jabs are free on the NHS, which are paid, and how far ahead to see the GP.',
  title: 'Travel Jabs 2026: Free on the NHS or Paid, by Destination',
  description: `Travel jabs in 2026 for UK travellers: the ${N.free.length} given free at a GP surgery, the ${N.paid.length} paid at private clinics, timing, and the CDC list for your destination.`,
  h1: 'Travel jabs: free on the NHS, or paid',
  intro: 'Pick your destination: the checker sorts the jabs CDC lists for it into those the NHS gives free and those paid at a private clinic.',
  resume: `In the United Kingdom, travel jabs fall into two groups. The NHS gives some free, after a risk assessment form, at a GP surgery: ${free.join(', ')}. Others are not routinely available on the NHS and are paid at a private travel clinic or pharmacy: ${paid.join(', ')}, the last only at registered yellow fever centres. The NHS advises seeing the GP or a travel clinic ${w1} to ${w2} weeks before travel, since some jabs need time or several doses. This site uses the CDC destination pages, which are written for travellers from the United States but describe the risk at the destination, so the list applies to UK travellers too; the NHS sorting is then laid over it. A trip to Thailand, for example, usually starts with hepatitis A and typhoid, both free, while Japanese encephalitis or rabies, if the clinician advises them, are paid. Private clinic prices in the UK are not published on any official page, so they are not shown; NHS facts come from the NHS travel vaccinations page reviewed on ${K.day(N.reviewed)}.`,
  body: (h) => `
<h2>Free and paid, side by side</h2>
<p>The NHS page on travel vaccinations sorts them plainly. Free on the NHS, from a GP surgery after a risk assessment: ${free.join(', ')}. Not routinely available on the NHS, so paid: ${paid.join(', ')}. ${N.notes.yellowFever ? `Yellow fever is ${N.notes.yellowFever}.` : ''} Routine vaccines such as MMR are also free on the NHS for anyone not up to date, travel or not. The sorting is the NHS's own and does not say how useful a jab is for a given trip: a paid jab can be the most important one on a list, and a free one may not be needed at all.</p>
${h.table(['Jab', 'On the NHS', 'What CDC lists it for'], [...N.free.map((k) => [LBL[k], 'free at a GP surgery', k === 'hepA' ? `most travellers to ${K.num(K.dests.filter((d) => d.d.hepA === 'M').length)} destinations` : k === 'typhoid' ? `most travellers to ${K.num(K.dests.filter((d) => d.d.typhoid === 'M').length)} destinations` : k === 'cholera' ? 'areas of active transmission' : 'destinations where poliovirus was found']), ...N.paid.map((k) => [LBL[k], 'paid, private clinic', k === 'hepB' ? 'unvaccinated travellers, every destination' : k === 'je' ? 'some travellers to parts of Asia and the Pacific' : k === 'rabies' ? 'to discuss for every destination' : k === 'tbe' ? 'some forested parts of Europe and Asia' : 'parts of Africa and South America, and border rules'])], `NHS travel vaccinations page, reviewed ${K.day(N.reviewed)}; CDC destination pages, ${K.day(K.CDC_DATE)}.`, ['l', 'l', 'l'])}
<h2>What the GP appointment covers</h2>
<p>The free jabs start with a form: the GP surgery asks where you are going, when, for how long and what you plan to do, and the practice nurse uses it to decide which free jabs apply. Not every surgery offers every free jab, and some send patients to a pharmacy or travel clinic for the paid ones, sometimes on the same day. The nurse also checks routine vaccines, which are free, and can advise on malaria tablets, which need a private prescription for travel and are bought at a pharmacy.</p>
${h.mini('nhs', { t: 'Free or paid for another destination', p: ['s1'], d: { s1: 'kenya' } })}
<h2>Two examples</h2>
<p>For Thailand, CDC lists hepatitis A and typhoid for most travellers, Japanese encephalitis for some travellers, such as long stays or rural trips, and rabies to discuss with a clinician. In the UK the first two are free; Japanese encephalitis and rabies, if advised, are paid. For Kenya, CDC lists hepatitis A and typhoid for most travellers, yellow fever for most of the country outside Nairobi and the coast, and malaria tablets; the yellow fever jab and the tablets are paid, the hepatitis A and typhoid jabs free, and cholera, listed for areas of active transmission, free too if the nurse advises it. Kenya asks for a yellow fever certificate only from travellers arriving from a country with risk, so a direct flight from London does not need one at the border; the CDC advice for the areas visited is what decides. The checker above does the same sorting for any of the ${K.num(K.dests.length)} destinations CDC covers.</p>
<h2>Timing</h2>
<p>The NHS advice of ${w1} to ${w2} weeks ahead is a minimum for most lists. Some jabs take longer: the yellow fever certificate becomes valid ten days after the jab, Japanese encephalitis needs two doses a week or four weeks apart plus a week before travel, rabies two doses a week apart, and hepatitis B in its standard form three doses over six months. A late appointment still helps, since hepatitis A and typhoid can be given within two weeks of travel and still protect, and the ${h.a('home', 'trip checker')} shows the latest start date for each jab.</p>
<h2>Paid jabs and prices</h2>
<p>Private travel clinics and pharmacies in the UK set their own prices for the paid jabs and for yellow fever. No official page publishes them with a date, so this site does not show a UK price rather than give an estimate; asking two or three clinics for the full price per dose, with any consultation fee, is the way to compare. The US prices shown elsewhere on this site, from county health departments, do not apply in the UK.</p>
<h2>Where the lists differ</h2>
<p>The UK and the US read the same evidence but do not always draw the same line. CDC now lists hepatitis B for every destination for unvaccinated travellers, of all ages for some and under 60 for others, while the NHS treats it as a paid travel jab. Tick-borne encephalitis, for walkers and campers in forested parts of central and eastern Europe and Scandinavia, appears on the NHS paid list and on CDC pages as a vaccine to consider for some travellers. The final list is the clinician's, who sees the whole trip.</p>
`,
  faqs: [
    { q: 'Which travel jabs are free on the NHS?', a: `According to the NHS travel vaccinations page, reviewed on ${K.day(N.reviewed)}: ${free.join(', ')}, given at a GP surgery after a risk assessment form. Routine vaccines such as MMR are also free for anyone not up to date. Other travel jabs are not routinely available on the NHS and are paid at a private clinic or pharmacy.` },
    { q: 'Do I have to pay for the yellow fever jab in the UK?', a: 'Yes. Yellow fever is not routinely available on the NHS; it is given only at registered yellow fever vaccination centres, which charge for it, and the list of centres is published by the National Travel Health Network and Centre. The certificate is valid ten days after the jab and for life.' },
    { q: 'How long before travel should I see the GP about jabs?', a: `The NHS advises ${w1} to ${w2} weeks before travel, because some jabs need time to work or several doses. Japanese encephalitis, rabies and the standard hepatitis B course take longer still, so for a long or remote trip an earlier appointment leaves room. Even a late appointment is worth having.` },
  ],
  tool: 'nhs', toolArg: { s1: 'thailand' },
  related: ['country:thailand', 'country:kenya', 'travel-vaccines-cost', 'yellow-fever-vaccine', 'travel-clinic'],
  sources: ['nhs_travel', 'cdc_destinations'],
});
