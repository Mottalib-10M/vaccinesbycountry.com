// Itinerary engine: merges the CDC advice of several destinations into one list, and applies the
// yellow fever entry rules in the order the countries are visited. Pure functions, no I/O.
import type { Destination, DiseaseEntry, Level } from './types';

/** Strongest first. 'prescription' is malaria's own "take medicine" level. */
const RANK: Record<Level, number> = { most: 6, prescription: 6, some: 5, consider: 4, routine: 3, awareness: 2, info: 1, notRecommended: 0, none: 0 };

export interface MergedItem {
  disease: string;
  label: string;
  level: Level;
  /** Countries where this level applies, in itinerary order. */
  where: string[];
  /** CDC wording per country (kept verbatim, CDC asks not to change substantive content). */
  wording: { country: string; text: string[] }[];
}

export function mergeAdvice(stops: Destination[]): MergedItem[] {
  const map = new Map<string, MergedItem>();
  for (const d of stops) {
    for (const [k, e] of Object.entries(d.diseases)) {
      if (k === 'yellowFever') continue; // see yellowFeverForTrip
      const lvl = (e.level ?? 'info') as Level;
      const cur = map.get(k);
      if (!cur || RANK[lvl] > RANK[cur.level]) {
        map.set(k, { disease: k, label: e.label, level: lvl, where: [d.name], wording: [...(cur?.wording ?? []), { country: d.name, text: e.text }] });
      } else {
        if (RANK[lvl] === RANK[cur.level]) cur.where.push(d.name);
        cur.wording.push({ country: d.name, text: e.text });
      }
    }
  }
  return [...map.values()].sort((a, b) => RANK[b.level] - RANK[a.level] || a.label.localeCompare(b.label));
}

/** A country counts as having yellow fever risk when CDC recommends the vaccine or "generally" does not (low-risk areas). */
export const hasYellowFeverRisk = (e?: DiseaseEntry) => e?.recommendation === 'recommended' || e?.recommendation === 'generallyNotRecommended';

export type YfVerdict = 'required' | 'requiredIfRiskOrigin' | 'recommended' | 'considered' | 'notNeeded';

export interface YfStop { country: string; verdict: YfVerdict; reason: string }

/**
 * Yellow fever, stop by stop. `origin` is where the trip starts (a destination slug, or null for a
 * country without risk such as the US, UK, Canada or Australia).
 * - entry rule "all": certificate required whatever the route;
 * - entry rule "fromRiskCountries": required when the previous stop (or the origin) has YF risk;
 * - entry rule "fromListed": required when the previous stop is one of the countries the rule names;
 *   the exact list each country uses can differ from CDC's, so the verdict is "required" only when the
 *   previous stop is a CDC risk country, and the page shows the country's own wording.
 */
export function yellowFeverForTrip(stops: Destination[], origin: Destination | null = null): YfStop[] {
  const out: YfStop[] = [];
  let prev: Destination | null = origin;
  for (const d of stops) {
    const yf = d.diseases.yellowFever;
    const prevRisk = prev ? hasYellowFeverRisk(prev.diseases.yellowFever) : false;
    let verdict: YfVerdict = 'notNeeded';
    let reason = 'No entry requirement for this route and CDC does not recommend the vaccine.';
    if (yf?.entryRequirement === 'all') { verdict = 'required'; reason = 'Certificate required for all arriving travelers (age limits in the country wording).'; }
    else if (yf?.entryRequirement === 'fromRiskCountries' && prevRisk) { verdict = 'required'; reason = `Certificate required because you arrive from ${prev!.name}, a country with yellow fever risk.`; }
    else if (yf?.entryRequirement === 'fromListed' && prev && yf.entryFrom?.includes(prev.slug)) { verdict = 'required'; reason = `Certificate required because ${d.name} names ${prev.name} among the countries it checks.`; }
    else if (yf?.recommendation === 'recommended') { verdict = 'recommended'; reason = 'CDC recommends the vaccine for this destination (see areas in the wording).'; }
    else if (yf?.recommendation === 'generallyNotRecommended') { verdict = 'considered'; reason = 'CDC says generally not recommended: may be considered for some itineraries.'; }
    else if (yf?.entryRequirement === 'fromRiskCountries') { verdict = 'requiredIfRiskOrigin'; reason = 'Required only if you arrive from a country with yellow fever risk.'; }
    else if (yf?.entryRequirement === 'fromListed') { verdict = 'requiredIfRiskOrigin'; reason = `Required only if you arrive from a country ${d.name} names (see the country wording).`; }
    else if (yf?.entryRequirement === 'see text') { verdict = 'requiredIfRiskOrigin'; reason = 'Entry rule needs reading: see the country wording.'; }
    out.push({ country: d.name, verdict, reason });
    prev = d;
  }
  return out;
}

export interface MalariaStop { country: string; prescription: boolean; areas: string[]; options: string[]; updated: string | null }

export function malariaForTrip(stops: Destination[]): MalariaStop[] {
  return stops.map((d) => {
    const m = d.diseases.malaria;
    return { country: d.name, prescription: m?.level === 'prescription', areas: m?.details?.areas ?? [], options: (m?.details?.prophylaxis ?? []).flatMap((s) => s.split(/,\s*|\s+or\s+/)).map((s) => s.trim()).filter(Boolean), updated: m?.details?.updated ?? null };
  });
}
