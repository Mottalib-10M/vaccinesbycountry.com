// Shapes of the JSON files written by scripts/update-data.mjs and curated in data/.

/** Sorting level derived from CDC's wording; the wording itself (`text`) is what pages show. */
export type Level = 'routine' | 'most' | 'some' | 'consider' | 'notRecommended' | 'info' | 'prescription' | 'awareness' | 'none';

export interface DiseaseEntry {
  label: string;
  text: string[];
  level: Level | null;
  /** Yellow fever only. */
  recommendation?: 'recommended' | 'generallyNotRecommended' | 'notRecommended' | 'unknown';
  entryRequirement?: 'all' | 'fromRiskCountries' | 'fromListed' | 'none' | 'see text';
  /** Yellow fever, fromListed: the countries the rule names (destination slugs). */
  entryFrom?: string[];
  /** Yellow fever, recommended: for the whole country or for listed areas only. */
  scope?: 'country' | 'areas' | null;
  /** Malaria only. */
  details?: { areas: string[]; resistance: string[]; species: string[]; prophylaxis: string[]; updated: string | null };
}

export interface Destination {
  slug: string;
  name: string;
  url: string;
  reviewed: string | null;
  notices: { level: number; title: string; date: string | null; url: string }[];
  diseases: Record<string, DiseaseEntry>;
}

export interface FeeSource {
  id: string;
  name: string;
  state: string;
  url: string;
  date: string | null;
  unit: string;
  includes_admin: boolean | null;
  visit_fee: number | null;
  /** Consultation billed on the first visit only. */
  visit_fee_once?: boolean;
  admin_first: number | null;
  admin_additional: number | null;
  prices: Record<string, number>;
}

export interface VaccineSchedule {
  id: string;
  fee: string;
  doses_days: number[];
  doses_days_18_65?: number[];
  /** Doses that must be given before departure (default: all). */
  doses_before_travel?: number;
  /** Number of billed units when several doses come in one package (oral typhoid). */
  doses_billed?: number;
  ready_days_after_last: number | null;
  min_age_months?: number;
  max_age_years?: number;
}

export interface Antimalarial {
  id: string;
  nadac: string | null;
  tablets_per_dose: number;
  every_days: number;
  loading_days?: number;
  start_days_before: number;
  continue_days_after: number;
  label: string;
}

export interface NadacItem { drug: string; per_unit_usd: number; as_of_date: string }
