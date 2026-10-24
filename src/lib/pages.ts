/** Registry: every file of src/content/guides and src/content/countries is loaded here. */
import type { GuideDef, CountryDef } from './page-types';
import { hasDest } from './data';

const base = (file: string) => file.split('/').pop()!.replace(/\.ts$/, '');
const g = import.meta.glob<{ default: GuideDef }>(['../content/guides/*.ts', '!../content/guides/_*.ts'], { eager: true });
export const GUIDES: GuideDef[] = Object.entries(g).map(([f, m]) => {
  if (m.default.id !== base(f)) throw new Error(`${f}: id "${m.default.id}" differs from the file name`);
  return m.default;
}).sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
export const guideById = (id: string) => GUIDES.find((p) => p.id === id);

const c = import.meta.glob<{ default: CountryDef }>(['../content/countries/*.ts', '!../content/countries/_*.ts'], { eager: true });
export const COUNTRY_PAGES: CountryDef[] = Object.entries(c).map(([f, m]) => {
  if (m.default.slug !== base(f)) throw new Error(`${f}: slug "${m.default.slug}" differs from the file name`);
  if (!hasDest(m.default.slug)) throw new Error(`${f}: no CDC destination ${m.default.slug}`);
  return m.default;
}).sort((a, b) => a.slug.localeCompare(b.slug));
export const countryId = (slug: string) => `country:${slug}`;
export const countryById = (id: string) => COUNTRY_PAGES.find((p) => countryId(p.slug) === id);
/** First guide that carries a calculator: the target of a mini-simulator's link. */
export const pageOfTool = (kind: string) => (kind === 'trip' ? 'home' : GUIDES.find((p) => p.tool === kind)?.id);
