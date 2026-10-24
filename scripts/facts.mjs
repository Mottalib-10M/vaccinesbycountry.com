#!/usr/bin/env node
// Writer's aid: prints, for one or more destinations, the CDC levels, the verbatim CDC wording, the yellow fever
// rule, malaria details, and the published prices of the vaccines CDC lists. Facts only, for writing a country page.
//   node scripts/facts.mjs india thailand
import { readFileSync } from 'node:fs';
const J = (p) => JSON.parse(readFileSync(new URL(`../${p}`, import.meta.url), 'utf8'));
const D = J('data/destinations.json').destinations, F = J('data/fees-us.json').sources, S = J('data/schedules.json'), N = J('data/nadac-antimalarials.json').items;
const med = (xs) => { const s = [...xs].sort((a, b) => a - b), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const price = (fee) => { const p = F.map((f) => f.prices[fee]).filter((x) => typeof x === 'number'); return p.length ? `median $${med(p).toFixed(2)}, $${Math.min(...p)} to $${Math.max(...p)} (${p.length} lists)` : 'no published price'; };
const FEE = { hepA: 'hepA', typhoid: 'typhoid_inj', yellowFever: 'yellowFever', je: 'je', rabies: 'rabies', cholera: 'cholera', chikungunya: 'chikungunya', polio: 'ipv', hepB: 'hepB_2dose', measles: 'mmr', meningococcal: 'menACWY', tbe: 'tbe' };
for (const slug of process.argv.slice(2)) {
  const d = D.find((x) => x.slug === slug);
  if (!d) { console.log('?', slug); continue; }
  console.log(`\n==== ${d.name} (${slug}) · CDC page reviewed ${d.reviewed} · notices: ${d.notices.map((n) => `L${n.level} ${n.title} ${n.date}`).join('; ') || 'none'}`);
  for (const [k, e] of Object.entries(d.diseases)) {
    const extra = k === 'yellowFever' ? ` [rec=${e.recommendation} scope=${e.scope} entry=${e.entryRequirement}${e.entryFrom ? ' from=' + e.entryFrom.join(',') : ''}]` : '';
    console.log(`-- ${e.label} · level=${e.level}${extra}${FEE[k] ? ` · price ${price(FEE[k])}` : ''}`);
    for (const l of e.text) console.log(`   ${l}`);
  }
}
console.log('\nSchedules (lead = last dose before travel + protection delay):');
for (const v of S.vaccines) console.log(`  ${v.id}: doses ${v.doses_days.join('/')}${v.doses_days_18_65 ? ` (18-65: ${v.doses_days_18_65.join('/')})` : ''}${v.doses_before_travel ? ` before travel ${v.doses_before_travel}` : ''} ready +${v.ready_days_after_last} · ${price(v.fee)}`);
console.log('NADAC per tablet:', N.map((n) => `${n.drug} $${n.per_unit_usd.toFixed(2)} (${n.as_of_date})`).join('; '));
