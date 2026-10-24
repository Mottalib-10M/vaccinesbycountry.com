import { describe, expect, it } from 'vitest';
import fees from '../data/fees-us.json';
import schedules from '../data/schedules.json';
import nadacDoc from '../data/nadac-antimalarials.json';
import type { Antimalarial, Destination, FeeSource, NadacItem, VaccineSchedule } from '../src/lib/engine/types';
import { mergeAdvice, yellowFeverForTrip, malariaForTrip } from '../src/lib/engine/itinerary';
import { priceStats, quoteAt, quoteRange, tabletsNeeded, antimalarialCost, median } from '../src/lib/engine/cost';
import { plan, addDays } from '../src/lib/engine/timeline';

const SRC = fees.sources as FeeSource[];
const SCH = schedules.vaccines as VaccineSchedule[];
const AM = schedules.antimalarials as Antimalarial[];
const NADAC = nadacDoc.items as NadacItem[];
const sch = (id: string) => SCH.find((s) => s.id === id)!;
const src = (id: string) => SRC.find((s) => s.id === id)!;

// Minimal destinations in the shape update-data.mjs writes (wording shortened from the CDC pages).
const d = (slug: string, name: string, diseases: Destination['diseases']): Destination => ({ slug, name, url: '', reviewed: null, notices: [], diseases });
const brazil = d('brazil', 'Brazil', {
  yellowFever: { label: 'Yellow Fever', text: ['CDC recommendations: Vaccine is recommended for all travelers ≥9 months old going to…'], level: null, recommendation: 'recommended', entryRequirement: 'none' },
  typhoid: { label: 'Typhoid', text: ['Recommended for most travelers.'], level: 'most' },
  malaria: { label: 'Malaria', text: ['CDC recommends that travelers going to certain areas of Brazil take prescription medicine'], level: 'prescription', details: { areas: ['Amazon states'], resistance: ['Chloroquine'], species: [], prophylaxis: ['Atovaquone-proguanil, doxycycline, mefloquine, tafenoquine'], updated: '2025-04-23' } },
});
const india = d('india', 'India', {
  yellowFever: { label: 'Yellow Fever', text: ['Vaccine is not recommended.', 'Travel from countries with risk…: Vaccine is required'], level: null, recommendation: 'notRecommended', entryRequirement: 'fromRiskCountries' },
  typhoid: { label: 'Typhoid', text: ['Recommended for most travelers.'], level: 'most' },
  je: { label: 'Japanese Encephalitis', text: ['Recommended for travelers who…'], level: 'some' },
  rabies: { label: 'Rabies', text: ['Please consult with a healthcare provider…'], level: 'consider' },
});
const thailand = d('thailand', 'Thailand', {
  typhoid: { label: 'Typhoid', text: ['Recommended for most travelers.'], level: 'most' },
  je: { label: 'Japanese Encephalitis', text: ['Recommended for travelers who…'], level: 'some' },
});
const angola = d('angola', 'Angola', { yellowFever: { label: 'Yellow Fever', text: ['Required for all arriving travelers ≥9 months old.'], level: null, recommendation: 'recommended', entryRequirement: 'all' } });

describe('itinerary', () => {
  it('merges advice and keeps the strongest level', () => {
    const m = mergeAdvice([india, thailand]);
    expect(m[0].level).toBe('most');
    const ty = m.find((x) => x.disease === 'typhoid')!;
    expect(ty.where).toEqual(['India', 'Thailand']);
    expect(ty.wording).toHaveLength(2);
    expect(m.find((x) => x.disease === 'yellowFever')).toBeUndefined();
  });
  it('yellow fever: India requires the certificate only after a risk country', () => {
    expect(yellowFeverForTrip([india])[0].verdict).toBe('requiredIfRiskOrigin');
    const r = yellowFeverForTrip([brazil, india]);
    expect(r[0].verdict).toBe('recommended');
    expect(r[1].verdict).toBe('required');
    expect(r[1].reason).toContain('Brazil');
  });
  it('yellow fever: entry rule for all travelers', () => {
    expect(yellowFeverForTrip([angola])[0].verdict).toBe('required');
  });
  it('malaria options are split from CDC list', () => {
    const m = malariaForTrip([brazil, thailand]);
    expect(m[0].prescription).toBe(true);
    expect(m[0].options).toEqual(['Atovaquone-proguanil', 'doxycycline', 'mefloquine', 'tafenoquine']);
    expect(m[1].prescription).toBe(false);
  });
});

describe('cost', () => {
  it('median', () => { expect(median([1, 3, 2])).toBe(2); expect(median([1, 2, 3, 4])).toBe(2.5); });
  it('yellow fever published self-pay prices (9 departments, 2025-06 to 2026-10)', () => {
    const s = priceStats(SRC, 'yellowFever')!;
    expect(s.n).toBe(9);
    expect(s.min).toBe(226); // Southwest Utah, effective 2026-08-24
    expect(s.max).toBe(360); // Fairfax County
    expect(s.median).toBe(268.53); // Miami-Dade
  });
  it('Orange County quote = vaccines + $17 visit + $18.50 per shot', () => {
    const q = quoteAt(src('orange-ca'), [sch('yellowFever'), sch('typhoid_inj')]);
    expect(q.vaccines).toBeCloseTo(226.75 + 155.75, 2);
    expect(q.fees).toBeCloseTo(17 + 18.5 * 2, 2);
    expect(q.total).toBeCloseTo(436.5, 2);
  });
  it('Fairfax: consultation once, $25 first shot then $14', () => {
    const q = quoteAt(src('fairfax-va'), [sch('yellowFever'), sch('typhoid_inj'), sch('hepA')], { beforeTravelOnly: true });
    expect(q.vaccines).toBe(360 + 185 + 90);
    expect(q.fees).toBe(40 + 25 + 14 * 2);
  });
  it('Tarrant: administration already included', () => {
    expect(quoteAt(src('tarrant-tx'), [sch('rabies')]).total).toBe(480 * 2);
  });
  it('missing vaccine is reported, not invented', () => {
    const q = quoteAt(src('lee-fl'), [sch('rabies')]);
    expect(q.missing).toEqual(['rabies']);
    expect(q.total).toBe(0);
  });
  it('range only over departments listing every chosen vaccine', () => {
    const r = quoteRange(SRC, [sch('je'), sch('rabies')])!;
    expect(r.quotes.every((q) => q.missing.length === 0)).toBe(true);
    expect(r.min).toBeLessThanOrEqual(r.median);
    expect(r.median).toBeLessThanOrEqual(r.max);
  });
  it('antimalarial tablets follow CDC adult regimens', () => {
    const am = (id: string) => AM.find((a) => a.id === id)!;
    expect(tabletsNeeded(am('atovaquone-proguanil'), 14)).toBe(2 + 14 + 7);
    expect(tabletsNeeded(am('doxycycline'), 14)).toBe(2 + 14 + 28);
    expect(tabletsNeeded(am('mefloquine'), 14)).toBe(2 + 2 + 4);
    expect(tabletsNeeded(am('tafenoquine'), 14)).toBe((3 + 2 + 1) * 2);
    expect(tabletsNeeded(am('doxycycline'), 0)).toBe(0);
  });
  it('NADAC cost uses the weekly per-tablet figure, tafenoquine has none', () => {
    const am = (id: string) => AM.find((a) => a.id === id)!;
    const c = antimalarialCost(am('atovaquone-proguanil'), 14, NADAC);
    expect(c.perTablet).toBeGreaterThan(0);
    expect(c.acquisitionCost).toBeCloseTo(23 * c.perTablet!, 6);
    expect(antimalarialCost(am('tafenoquine'), 14, NADAC).acquisitionCost).toBeNull();
  });
});

describe('timeline', () => {
  it('JE adult schedule: start 14 days before (dose day 7 + 1 week)', () => {
    const [s] = plan([sch('je')], '2026-10-24', '2026-12-01', 40);
    expect(s.startBy).toBe(addDays('2026-12-01', -14));
    expect(s.tooLate).toBe(false);
  });
  it('JE over 65 uses days 0 and 28', () => {
    const [s] = plan([sch('je')], '2026-10-24', '2026-12-31', 70);
    expect(s.startBy).toBe(addDays('2026-12-31', -35));
  });
  it('yellow fever certificate needs 10 days; too late is flagged', () => {
    const [s] = plan([sch('yellowFever')], '2026-10-24', '2026-10-30');
    expect(s.tooLate).toBe(true);
    expect(s.readyOn).toBe('2026-11-03');
  });
  it('hepatitis A: only the first dose counts before departure', () => {
    const [s] = plan([sch('hepA')], '2026-10-24', '2026-11-01');
    expect(s.tooLate).toBe(false);
    expect(s.doseDates).toHaveLength(2);
  });
});

describe('hepatitis B schedules (CDC adult schedule notes)', () => {
  it('Heplisav-B: 2 doses 4 weeks apart, start 28 days before departure', () => {
    const [s] = plan([sch('hepB_2dose')], '2026-10-24', '2026-12-31', 40);
    expect(s.startBy).toBe('2026-12-03');
    expect(s.doseDates).toEqual(['2026-12-03', '2026-12-31']);
    expect(s.tooLate).toBe(false);
  });
  it('Engerix-B type: 0, 1, 6 months does not fit a trip 2 months away', () => {
    const [s] = plan([sch('hepB_3dose')], '2026-10-24', '2026-12-24', 40);
    expect(s.doseDates).toHaveLength(3);
    expect(s.tooLate).toBe(true);
  });
});
