/** llms.txt (RECETTE §21), generated from the page registry. */
import { GUIDES, COUNTRY_PAGES, countryId } from '../lib/pages';
import { SITE_URL, LAST_UPDATED, SITE_NAMES } from '../data/site-config';
import { route } from '../i18n/routes';
import { GROUPS, label } from '../i18n/nav';
import { DESTS } from '../lib/data';
export function GET() {
  const lines = [
    `# ${SITE_NAMES.en}`, '',
    `> Travel vaccines for a whole itinerary, from the CDC Travelers' Health page of each of ${DESTS.length} destinations: the vaccines CDC lists for most or some travelers, the yellow fever certificate each border asks for given the country you arrive from, malaria tablets and their count, the latest date to start each series (CDC Yellow Book schedules) and the self-pay price of each shot published by nine US county health departments, with the CDC private-sector list price and NADAC tablet costs. UK readers see which jabs are free on the NHS. Independent site published by Radif Partners; not affiliated with or endorsed by CDC; no booking, no form; not medical advice. Last updated ${LAST_UPDATED}.`, '',
    ...GROUPS.flatMap((g) => [`## ${g.label}`, ...GUIDES.filter((p) => p.group === g.id).map((p) => `- [${p.nav}](${SITE_URL}${route(p.id, 'en')}): ${p.card}`), '']),
    '## Vaccines by country', ...COUNTRY_PAGES.map((s) => `- [${label(countryId(s.slug))}](${SITE_URL}${route(countryId(s.slug), 'en')}): ${s.intro}`), '',
    '## About', `- [How the lists, dates and prices are built](${SITE_URL}${route('method', 'en')})`, `- [About](${SITE_URL}${route('about', 'en')})`,
  ];
  return new Response(lines.join('\n') + '\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
