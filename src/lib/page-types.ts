/**
 * One page = ONE content file (CONTRIBUTING-PAGES.md):
 *  - a topic page with its calculator: `src/content/guides/<id>.ts` (GuideDef);
 *  - a destination page: `src/content/countries/<cdc-slug>.ts` (CountryDef), served at /en/vaccines-for-<slug>/.
 * Routes, menus, footer, sitemap, schemas, llms.txt and internal links read these files alone.
 */
import type { Kit } from './kit';

export interface FAQ { q: string; a: string }
export interface MiniOpts { /** title */ t?: string; /** ids of the fields shown */ p?: string[]; /** default values */ d?: Record<string, number | string>; /** link text */ c?: string }

export interface Helpers extends Kit {
  /** Internal link by page id ("yellow-fever-vaccine", "country:india", "method"). Unknown id = failed test. */
  a: (id: string, text: string) => string;
  /** Table; numbers are formatted, strings are inserted as HTML. */
  table: (headers: string[], rows: Array<Array<string | number>>, caption?: string, align?: Array<'l' | 'r'>) => string;
  /** Link to a source of params-2026.json (key), with optional text. */
  src: (key: string, text?: string) => string;
  /** Link to any official URL already read. */
  ext: (url: string, text: string) => string;
  /** Link to the CDC destination page of a country. */
  cdc: (slug: string, text?: string) => string;
  /** Link to the fee schedule of a health department (fees-us.json id). */
  fee: (id: string, text?: string) => string;
  /** Ruled note. */
  box: (title: string, html: string) => string;
  /** Inline mini-simulator built on a calculator of tool-specs.ts. */
  mini: (kind: string, opts?: MiniOpts) => string;
}

export type Group = 'vaccines' | 'cost' | 'malaria' | 'trip';

export interface GuideDef {
  id: string; group: Group; order: number;
  /** URL segment, lowercase and dashes, no year. */
  slug: string;
  nav: string; card: string;
  /** 50 to 60 characters, key term first, year included (RECETTE §11). */
  title: string;
  /** 150 to 160 characters, year included. */
  description: string;
  h1: string; intro: string;
  /** ONE paragraph of 120 words or more: the direct answer with the figures (RECETTE §21). */
  resume: string;
  faqs: FAQ[];
  body: (h: Helpers) => string;
  /** Calculator at the top: a key of tool-specs.ts. */
  tool: string;
  toolArg?: Record<string, number | string>;
  related: string[];
  /** Keys of params-2026.json > sources. */
  sources: string[];
}
export const defineGuide = (p: GuideDef): GuideDef => p;

export interface CountryDef {
  /** = file name = CDC slug ("india"). */
  slug: string;
  title: string; description: string; h1: string; intro: string; resume: string;
  toolArg?: Record<string, number | string>;
  body: (h: Helpers) => string;
  faqs: FAQ[];
  related: string[];
}
export const defineCountry = (s: CountryDef): CountryDef => s;
