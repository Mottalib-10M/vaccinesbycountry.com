#!/usr/bin/env node
// Builds src/data/dest.json, the compact table the calculators ship to the browser, from data/destinations.json
// (the CDC destination pages parsed by scripts/update-data.mjs). The full CDC wording stays in data/ and is
// only read at build time by the country pages, verbatim (CDC: "You may not change the substantive content").
//
//   node scripts/build-data.mjs
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const D = JSON.parse(await readFile(join(ROOT, 'data', 'destinations.json'), 'utf8'));

const DRUGS = ['atovaquone-proguanil', 'doxycycline', 'mefloquine', 'chloroquine', 'primaquine', 'tafenoquine'];
/** Drug ids named in CDC's "Recommended chemoprophylaxis" lines. */
export function drugsOf(lines) {
  const t = lines.join(' ').toLowerCase();
  return DRUGS.filter((d) => t.includes(d.split('-')[0]) && (d !== 'atovaquone-proguanil' || t.includes('atovaquone')));
}
const LV = { most: 'M', some: 'S', consider: 'C', routine: 'R', notRecommended: 'N', info: 'I', prescription: 'P', awareness: 'A', none: '0' };

/** Entry part of the yellow fever text, and the minimum age it states ("9 months", "1 year"), if any. */
const entryPart = (text = []) => { const t = text.join('\n'); const i = t.search(/Country entry requirements/i); return i < 0 ? '' : t.slice(i); };
const entryAge = (text) => { const m = /travelers\s*≥\s*(\d+\s*(?:months?|years?))/i.exec(entryPart(text)); return m ? m[1].replace(/\s+/g, ' ') : null; };

const list = D.destinations.map((d) => {
  const dz = {};
  for (const [k, e] of Object.entries(d.diseases)) {
    if (k === 'yellowFever' || k === 'malaria') continue;
    dz[k] = LV[e.level ?? 'info'];
  }
  const yf = d.diseases.yellowFever;
  const m = d.diseases.malaria;
  return {
    s: d.slug, n: d.name, rv: d.reviewed,
    // Hepatitis B: CDC words it either for unvaccinated travelers of all ages or for those younger than 60.
    hb: /all ages/i.test((d.diseases.hepB?.text ?? []).join(' ')) ? 'all' : /younger than 60/i.test((d.diseases.hepB?.text ?? []).join(' ')) ? '60' : null,
    d: dz,
    yf: yf ? [yf.recommendation, yf.entryRequirement, yf.scope ?? null, yf.entryFrom ?? [], entryAge(yf.text), /\b12 hours|12-hour|>\s*12\s*h/i.test(entryPart(yf.text))] : null,
    m: m ? { l: LV[m.level ?? 'info'], p: drugsOf(m.details?.prophylaxis ?? []), r: (m.details?.resistance ?? []).join('; '), sp: (m.details?.species ?? []).join('; '), a: m.details?.areas ?? [], u: m.details?.updated ?? null } : null,
  };
}).sort((a, b) => a.n.localeCompare(b.n));

// A rule that names "African countries with yellow fever risk throughout (see Map 4.21.1 for those 22 countries)"
// points to the map instead of naming them: they are the African destinations where CDC recommends the vaccine
// country-wide, minus Mali, which the map shows as partial risk (22 on the 2026 data, checked below).
const AMERICAS = new Set(['french-guiana', 'guyana', 'suriname']);
const throughout = list.filter((x) => x.yf?.[0] === 'recommended' && x.yf?.[2] === 'country' && !AMERICAS.has(x.s) && x.s !== 'mali').map((x) => x.s);
for (const d of D.destinations) {
  const t = (d.diseases.yellowFever?.text ?? []).join(' ');
  const m = /African countries with yellow fever risk throughout \(see Map [\d.]+ for those (\d+) countries\)/i.exec(t);
  if (!m) continue;
  if (throughout.length !== Number(m[1])) throw new Error(`${d.slug}: the rule counts ${m[1]} African countries with risk throughout, the data ${throughout.length}`);
  const row = list.find((x) => x.s === d.slug);
  row.yf[3] = [...new Set([...row.yf[3], ...throughout])];
}

await writeFile(join(ROOT, 'src', 'data', 'dest.json'), JSON.stringify({ retrieved: D.retrieved_at, count: list.length, list }));
console.log(`src/data/dest.json: ${list.length} destinations`);
