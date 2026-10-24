#!/usr/bin/env node
// Rebuilds the data files of the travel vaccines site from official US sources.
//
//   node scripts/update-data.mjs              all sources (CDC destinations ≈ 81 min: robots.txt Crawl-delay 20 s)
//   node scripts/update-data.mjs --only=nadac  one source: cdc | nadac | pricelist
//   node scripts/update-data.mjs --offline     re-parse the cached CDC pages (scripts/.cache/) without network
//   node scripts/update-data.mjs --limit=5     first N destinations only (tests)
//
// Sources and licences (quoted in CONTRIBUTING and on the Sources page):
//  - CDC Travelers' Health destination pages, wwwnc.cdc.gov/travel/destinations/traveler/none/<slug>.
//    "Most of the information on the CDC and ATSDR websites is not subject to copyright, is in the public
//    domain" (cdc.gov/other/agencymaterials.html). Conditions: attribution, disclaimer of non-endorsement,
//    no change to substantive content, statement that the material is available free on cdc.gov.
//    robots.txt (User-agent: *) asks Crawl-delay: 20 → we wait 20 s between requests.
//  - NADAC (National Average Drug Acquisition Cost) 2026, data.medicaid.gov dataset
//    fbb83258-11c7-47f5-8b18-5f8e79f7e704, licence https://www.usa.gov/publicdomain/label/1.0/ (public domain).
//  - CDC Adult Vaccine Price List: the PDF is read by hand (data/cdc-adult-price-list.json); this script only
//    checks that the published file name has not changed and warns if a new list is out.
import { mkdir, readFile, writeFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DATA = join(ROOT, 'data');
const CACHE = join(ROOT, 'scripts', '.cache', 'cdc');
const args = Object.fromEntries(process.argv.slice(2).map((a) => { const [k, v] = a.replace(/^--/, '').split('='); return [k, v ?? true]; }));
const UA = 'Mozilla/5.0 (compatible; travel-vaccines-data/1.0; publisher Radif Partners; monthly refresh)';
const CDC = 'https://wwwnc.cdc.gov';
const DELAY_MS = 20_000; // robots.txt Crawl-delay: 20
const today = new Date().toISOString().slice(0, 10);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function get(url, { json = false } = {}) {
  for (let i = 0; i < 3; i++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: json ? 'application/json' : 'text/html' }, signal: AbortSignal.timeout(60_000) });
      if (res.ok) return json ? await res.json() : await res.text();
      if (res.status === 404 || res.status === 403) throw Object.assign(new Error(`${res.status} ${url}`), { fatal: true });
    } catch (e) {
      if (e.fatal) throw e; // network reset or timeout: retry
      console.warn(`  retry ${i + 1} ${url}: ${e.cause?.code ?? e.name}`);
    }
    await sleep(30_000);
  }
  throw new Error(`failed ${url}`);
}

// ---------- HTML helpers (no dependency: the CDC markup is regular) ----------
const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“', ndash: '–', mdash: '—', ge: '≥', le: '≤', deg: '°', eacute: 'é', ccedil: 'ç', ocirc: 'ô', iacute: 'í', aacute: 'á', oacute: 'ó', uacute: 'ú', ntilde: 'ñ', egrave: 'è', atilde: 'ã', otilde: 'õ', acirc: 'â', ecirc: 'ê', uuml: 'ü', ouml: 'ö', auml: 'ä' };
const decode = (s) => s.replace(/&(#x?[0-9a-f]+|\w+);/gi, (m, e) => e[0] === '#' ? String.fromCodePoint(e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : +e.slice(1)) : ENT[e.toLowerCase()] ?? m);
/** Block-aware text: paragraphs and list items become separate lines. */
function text(html) {
  return decode(html
    .replace(/<sup>.*?<\/sup>/gis, '')
    .replace(/<(br|\/p|\/li|\/div|\/h\d|\/ul)\s*\/?>/gi, '\n')
    .replace(/<li[^>]*>/gi, '\n• ')
    .replace(/<[^>]+>/g, ''))
    .split('\n').map((l) => l.replace(/\s+/g, ' ').trim()).filter(Boolean);
}
const DISEASE_KEYS = {
  'routine vaccines': 'routine', 'covid-19': 'covid19', chikungunya: 'chikungunya', cholera: 'cholera',
  'hepatitis a': 'hepA', 'hepatitis b': 'hepB', 'japanese encephalitis': 'je', malaria: 'malaria', measles: 'measles',
  monkeypox: 'mpox', mpox: 'mpox', rabies: 'rabies', typhoid: 'typhoid', 'yellow fever': 'yellowFever', polio: 'polio',
  'meningococcal disease': 'meningococcal', meningitis: 'meningococcal', 'tick-borne encephalitis': 'tbe', dengue: 'dengue',
  'influenza': 'flu', 'diphtheria': 'diphtheria',
};
const key = (name) => DISEASE_KEYS[name.toLowerCase()] ?? name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

/**
 * Level derived from CDC's own wording. The wording itself is kept (`text`) and is what the site shows;
 * the level only sorts the list. Order matters: the first rule that matches wins.
 */
function level(k, lines) {
  const t = lines.join(' ').toLowerCase();
  if (k === 'routine') return 'routine';
  if (k === 'yellowFever') return null; // handled by yellowFever()
  if (k === 'malaria') return /no malaria transmission|not present|no indigenous cases|no malaria/.test(t) && !/recommends that travelers|take prescription medicine/.test(t) ? 'none' : (/take prescription medicine|recommends that travelers/.test(t) ? 'prescription' : 'awareness');
  if (/recommended for (most|all) travelers/.test(t)) return 'most';
  if (/recommended for unvaccinated travelers/.test(t)) return 'most';
  if (/all (eligible|international) travelers should/.test(t)) return 'most';
  if (/(is )?recommended for (any |some )?(travelers|people|adults|adult|children|some)/.test(t)) return 'some';
  if (/not recommended/.test(t) && !/consider/.test(t)) return 'notRecommended';
  if (/(may be )?consider/.test(t)) return 'consider';
  if (/pre-exposure vaccination considerations|consult with a healthcare provider/.test(t)) return 'consider';
  return 'info';
}

/**
 * Yellow fever: CDC's recommendation (the first of the three phrasings in the recommendation part wins) and the
 * entry rule (read in the "Country entry requirements" part only):
 *  - all: every arriving traveler (also when one main airport asks it of all arrivals, as in Guinea);
 *  - fromRiskCountries: travelers arriving from a country with yellow fever risk;
 *  - fromListed: travelers arriving from the countries the rule names (entryFrom, as destination slugs);
 *  - none: not required; see text: not stated or unclear.
 * `names` maps destination names to slugs (longest first) to read the countries a rule names.
 */
function yellowFever(lines, names = []) {
  const t = lines.join('\n');
  const cut = t.search(/Country entry requirements/i);
  const recPart = cut < 0 ? t : t.slice(0, cut);
  const entry = cut < 0 ? '' : t.slice(cut);
  const hits = [
    ['recommended', recPart.search(/Vaccine is\s+recommended/i)],
    ['generallyNotRecommended', recPart.search(/Vaccine is\s+generally not\s+recommended/i)],
    ['notRecommended', recPart.search(/Vaccine is\s+not\s+recommended/i)],
  ].filter(([, i]) => i >= 0).sort((a, b) => a[1] - b[1]);
  const rec = hits[0]?.[0] ?? 'unknown';
  const scope = rec === 'recommended' ? (/Vaccine is\s+recommended for all travelers[^.\n]*?(\.|$)(?![\s\S]*except)/i.test(recPart) && !/going to|except/i.test(recPart) ? 'country' : 'areas') : null;
  const direct = /Direct travel from United States: Vaccine is not required/i.test(entry);
  let req = 'see text';
  let from = [];
  if (/required for all arriving travelers from all countries/i.test(entry)) req = 'all';
  else if (!direct && /required for all (arriving )?travelers/i.test(entry) && !/resided|arriving from (?!countries)/i.test(entry)) req = 'all';
  else if (/Travel from countries with risk/i.test(entry)) req = 'fromRiskCountries';
  else if (/arriving from (?!countries)|resided/i.test(entry)) {
    let rest = entry.replace(/Direct travel from United States[^\n]*/i, '');
    for (const [name, slug] of names) if (rest.includes(name)) { if (!from.includes(slug)) from.push(slug); rest = rest.split(name).join(' '); }
    req = from.length ? 'fromListed' : 'see text';
  } else if (/Vaccine is\s+not\s+required/i.test(entry)) req = 'none';
  return { recommendation: rec, scope, entryRequirement: req, ...(from.length ? { entryFrom: from } : {}) };
}

function malaria(lines) {
  const out = { areas: [], resistance: [], species: [], prophylaxis: [], updated: null };
  let cur = null;
  for (const l of lines) {
    if (/^Transmission areas/i.test(l)) cur = 'areas';
    else if (/^Drug resistance/i.test(l)) cur = 'resistance';
    else if (/^Species/i.test(l)) cur = 'species';
    else if (/^Recommended chemoprophylaxis/i.test(l)) cur = 'prophylaxis';
    else if (/^Updated (.+)$/i.test(l)) { out.updated = toIso(l.replace(/^Updated\s+/i, '')); cur = null; }
    else if (cur && l.startsWith('• ')) out[cur].push(l.slice(2));
  }
  return out;
}

const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
function toIso(s) {
  const m = s.trim().match(/^([A-Za-z]+)\.?\s+(\d{1,2}),\s*(\d{4})$/);
  if (!m) return null;
  const mi = MONTHS.findIndex((x) => x.startsWith(m[1].toLowerCase().slice(0, 3)));
  return mi < 0 ? null : `${m[3]}-${String(mi + 1).padStart(2, '0')}-${m[2].padStart(2, '0')}`;
}

export function parseDestination(html, slug, name, names = []) {
  const vm = html.match(/<table class="disease[^"]*" id="dest-vm-a">([\s\S]*?)<\/table>/);
  if (!vm) throw new Error(`no vaccines table for ${slug}`);
  const rows = [...vm[1].matchAll(/<td class="clinician-disease">([\s\S]*?)<\/td>\s*<td class="clinician-recomendations">([\s\S]*?)<\/td>/g)];
  const diseases = {};
  for (const [, d, r] of rows) {
    const label = text(d).join(' ');
    const k = key(label);
    const lines = text(r);
    const entry = { label, text: lines, level: level(k, lines) };
    if (k === 'yellowFever') Object.assign(entry, yellowFever(lines, names));
    if (k === 'malaria') entry.details = malaria(lines);
    diseases[k] = entry;
  }
  const notices = [...(html.match(/<div id="travel-notices"[\s\S]*?(?=id="vaccines-and-medicines")/)?.[0] ?? '')
    .matchAll(/<h4 class="notice-typename[^>]*>([^<]+)<\/h4>\s*<ul class="list-block">([\s\S]*?)<\/ul>/g)]
    .flatMap(([, lvl, ul]) => [...ul.matchAll(/<a href="([^"]+)">([^<]+)<\/a>\s*<span class="date">([^<]+)<\/span>/g)]
      .map(([, href, title, date]) => ({ level: +(lvl.match(/Level (\d)/)?.[1] ?? 0), title: decode(title.trim()), date: toIso(date), url: CDC + href })));
  const reviewed = toIso(html.match(/Page last reviewed:\s*<span>([^<]+)<\/span>/)?.[1] ?? '');
  return { slug, name, url: `${CDC}/travel/destinations/traveler/none/${slug}`, reviewed, notices, diseases };
}

async function cdcDestinations() {
  await mkdir(CACHE, { recursive: true });
  let list;
  if (args.offline) list = JSON.parse(await readFile(join(CACHE, 'list.json'), 'utf8'));
  else {
    const html = await get(`${CDC}/travel/destinations/list`);
    list = [...new Map([...html.matchAll(/href="\/travel\/destinations\/traveler\/none\/([a-z0-9-]+)"[^>]*>([^<]+)</g)]
      .map(([, slug, name]) => [slug, decode(name.trim())])).entries()].map(([slug, name]) => ({ slug, name }));
    await writeFile(join(CACHE, 'list.json'), JSON.stringify(list, null, 1));
    await sleep(DELAY_MS);
  }
  if (args.limit) list = list.slice(0, +args.limit);
  const out = [];
  // Names a rule can cite ("arriving from Bolivia, Brazil…"), longest first so that "Democratic Republic of the Congo" wins over "Congo".
  // CDC names some places with a qualifier: "French Guiana (France)", "Burma (Myanmar)", "Gambia, The". The rules
  // write them plainly, so both parts of a parenthesized name and the plain form are matched too.
  const alias = list.flatMap((x) => {
    const m = /^(.*?) \((.*)\)$/.exec(x.name);
    // The part in parentheses counts only when it is not itself a destination ("France" in "Réunion (France)").
    const out = m ? [[m[1], x.slug], ...(list.some((y) => y.name === m[2] || y.name.startsWith(`${m[2]} `)) ? [] : [[m[2], x.slug]])] : [];
    if (/, The$/.test(x.name)) out.push([`The ${x.name.replace(/, The$/, '')}`, x.slug], [x.name.replace(/, The$/, ''), x.slug]);
    return out;
  });
  const names = [...list.map((x) => [x.name, x.slug]), ...alias, ['DRC', 'democratic-republic-of-congo'], ['Côte d’Ivoire', 'ivory-coast']].sort((a, b) => b[0].length - a[0].length);
  for (const [i, { slug, name }] of list.entries()) {
    const f = join(CACHE, `${slug}.html`);
    let html;
    if (args.offline || (args.resume && existsSync(f))) html = await readFile(f, 'utf8');
    else {
      html = await get(`${CDC}/travel/destinations/traveler/none/${slug}`);
      await writeFile(f, html);
      if (i < list.length - 1) await sleep(DELAY_MS);
    }
    try { out.push(parseDestination(html, slug, name, names)); } catch (e) { console.error('!', e.message); }
    if (i % 20 === 0) console.log(`${i + 1}/${list.length} ${slug}`);
  }
  const doc = {
    source: 'CDC Travelers\' Health, destination pages (wwwnc.cdc.gov/travel/destinations)',
    source_url: `${CDC}/travel/destinations/list`,
    licence: 'Public domain (U.S. federal government work). CDC asks for attribution, a non-endorsement disclaimer, no change to substantive content, and a note that the material is available free on cdc.gov: https://www.cdc.gov/other/agencymaterials.html',
    retrieved_at: today,
    count: out.length,
    destinations: out,
  };
  await writeFile(join(DATA, 'destinations.json'), JSON.stringify(doc, null, 1));
  console.log(`destinations.json: ${out.length} destinations`);
}

// ---------- NADAC: pharmacy acquisition cost of antimalarial tablets ----------
const NADAC_DATASET = 'fbb83258-11c7-47f5-8b18-5f8e79f7e704'; // NADAC 2026 (change each January)
const NADAC_ITEMS = [
  { drug: 'atovaquone-proguanil', ndc_description: 'ATOVAQUONE-PROGUANIL 250-100 MG TABLET' },
  { drug: 'atovaquone-proguanil-pediatric', ndc_description: 'ATOVAQUONE-PROGUANIL 62.5-25' },
  { drug: 'doxycycline', ndc_description: 'DOXYCYCLINE HYCLATE 100 MG TAB' },
  { drug: 'doxycycline-capsule', ndc_description: 'DOXYCYCLINE HYCLATE 100 MG CAP' },
  { drug: 'mefloquine', ndc_description: 'MEFLOQUINE HCL 250 MG TABLET' },
  { drug: 'chloroquine', ndc_description: 'CHLOROQUINE PH 500 MG TABLET' },
  { drug: 'chloroquine-250', ndc_description: 'CHLOROQUINE PH 250 MG TABLET' },
  { drug: 'primaquine', ndc_description: 'PRIMAQUINE 26.3 MG TABLET' },
];
async function nadac() {
  const items = [];
  for (const it of NADAC_ITEMS) {
    const q = new URLSearchParams({ 'conditions[0][property]': 'ndc_description', 'conditions[0][value]': it.ndc_description, 'conditions[0][operator]': '=', limit: '50', 'sorts[0][property]': 'as_of_date', 'sorts[0][order]': 'desc' });
    const d = await get(`https://data.medicaid.gov/api/1/datastore/query/${NADAC_DATASET}/0?${q}`, { json: true });
    const r = d.results ?? [];
    if (!r.length) { console.error('! NADAC: no row for', it.ndc_description); continue; }
    const asOf = r[0].as_of_date;
    const latest = r.filter((x) => x.as_of_date === asOf).map((x) => +x.nadac_per_unit);
    items.push({ ...it, per_unit_usd: Math.max(...latest), per_unit_min_usd: Math.min(...latest), pricing_unit: r[0].pricing_unit, effective_date: r[0].effective_date, as_of_date: asOf, ndc_count: latest.length });
    await sleep(500);
  }
  await writeFile(join(DATA, 'nadac-antimalarials.json'), JSON.stringify({
    source: 'NADAC (National Average Drug Acquisition Cost) 2026, Centers for Medicare & Medicaid Services, data.medicaid.gov',
    source_url: `https://data.medicaid.gov/dataset/${NADAC_DATASET}`,
    licence: 'Public domain: https://www.usa.gov/publicdomain/label/1.0/',
    note: 'What retail pharmacies pay wholesalers per tablet, highest NDC of the latest weekly survey. The shelf price you pay is higher (dispensing fee and margin).',
    retrieved_at: today, items,
  }, null, 1));
  console.log(`nadac-antimalarials.json: ${items.length} items`);
}

// ---------- CDC Vaccine Price List: detect a new list ----------
async function pricelist() {
  const cur = JSON.parse(await readFile(join(DATA, 'cdc-adult-price-list.json'), 'utf8'));
  try {
    const html = await get('https://www.cdc.gov/vaccines-for-children/php/price-list/index.html');
    const pdf = html.match(/Adult-Vaccine-Price-List-[0-9-]+\.pdf/)?.[0];
    if (pdf && !cur.source_url.endsWith(pdf)) console.warn(`! New CDC adult price list published: ${pdf} (current: ${cur.source_url}). Update data/cdc-adult-price-list.json by hand.`);
    else console.log('CDC adult price list unchanged');
  } catch (e) { console.warn('! CDC price list page not reachable from this machine (cdc.gov blocks some clients):', e.message); }
}

const only = args.only;
if (!only || only === 'nadac') await nadac();
if (!only || only === 'pricelist') await pricelist();
if (!only || only === 'cdc') await cdcDestinations();
