import { route, type Locale } from './routes';
import { GUIDES, guideById, countryById, COUNTRY_PAGES, countryId } from '../lib/pages';
import { dest } from '../lib/data';
import type { Group } from '../lib/page-types';
export interface NavLink { href: string; label: string } export interface NavCategory { label: string; links: NavLink[] }
const CORE: Record<string, string> = { home: 'Travel vaccines by trip', method: 'Method and sources', about: 'About', widget: 'Embed the trip checker', contact: 'Contact', editorial: 'Editorial policy', privacy: 'Privacy', terms: 'Legal notice', cookies: 'Cookies' };
export const GROUPS: Array<{ id: Group; label: string }> = [
  { id: 'vaccines', label: 'Vaccines one by one' },
  { id: 'cost', label: 'Prices and clinics' },
  { id: 'malaria', label: 'Malaria' },
  { id: 'trip', label: 'Regions and borders' },
];
export const label = (id: string, _lang?: Locale) => {
  if (CORE[id]) return CORE[id];
  const g = guideById(id); if (g) return g.nav;
  const c = countryById(id); if (c) return `Vaccines for ${dest(c.slug).n}`;
  return id;
};
const link = (id: string, lang: Locale): NavLink => ({ href: route(id, lang), label: label(id) });
export const inGroup = (g: Group, lang: Locale): NavLink[] => GUIDES.filter((p) => p.group === g).map((p) => link(p.id, lang));
export function navCategories(lang: Locale): NavCategory[] {
  return [...GROUPS.map((g) => ({ label: g.label, links: inGroup(g.id, lang) })), { label: 'Countries', links: popularLinks(lang) }].filter((c) => c.links.length);
}
export const navDirect = (lang: Locale): NavLink[] => [link('method', lang)];
export const footerColumns = (lang: Locale): NavCategory[] => [
  ...GROUPS.map((g) => ({ label: g.label, links: inGroup(g.id, lang) })).filter((c) => c.links.length),
  { label: 'This site', links: ['home', 'method', 'about', 'contact', 'editorial', 'widget', 'terms', 'privacy', 'cookies'].map((i) => link(i, lang)) },
];
/** Every country page from the footer: one click from any page (RECETTE §18.2). */
export const popularLinks = (lang: Locale): NavLink[] => COUNTRY_PAGES.map((s) => ({ href: route(countryId(s.slug), lang), label: dest(s.slug).n }));
