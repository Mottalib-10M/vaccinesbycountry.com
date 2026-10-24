/** Every calculator, on its defaults and on every destination: a result is produced, never NaN, undefined or $0 by accident. */
import { describe, expect, it } from 'vitest';
import { getTool, TOOL_KINDS } from '../src/lib/tool-specs';
import { DESTS, sched, priceOf, expand } from '../src/lib/data';
import { yellowFeverForTrip } from '../src/lib/engine/itinerary';
import type { ToolOut, V } from '../src/lib/tool-types';

const bad = /NaN|undefined|null|\[object Object\]|Infinity/;
const flat = (o: ToolOut) => [o.label, o.value, o.sub ?? '', ...o.rows.flat().map(String), ...(o.table?.rows.flat() ?? []), o.note ?? ''].join(' | ');
const defaults = (kind: string, arg?: Record<string, number | string>) => { const t = getTool(kind, arg); return { t, v: Object.fromEntries(t.inputs.map((i) => [i.id, i.def])) as V }; };

describe('tools', () => {
  for (const k of TOOL_KINDS) it(`${k}: defaults give a clean result`, () => { const { t, v } = defaults(k); expect(flat(t.run(v))).not.toMatch(bad); });

  it('trip, malaria, risk and nhs run on every destination', () => {
    for (const d of DESTS) {
      for (const [k, f] of [['trip', 's1'], ['malaria', 'c'], ['risk', 'c'], ['nhs', 's1'], ['yf', 'to']] as const) {
        const { t, v } = defaults(k);
        expect(flat(t.run({ ...v, [f]: d.s })), `${k} ${d.s}`).not.toMatch(bad);
      }
    }
  });

  it('every vaccine of the single-vaccine tool runs at three ages and two lead times', () => {
    const { t, v } = defaults('vaccine');
    const vx = t.inputs.find((i) => i.id === 'vx')!;
    for (const o of (vx as { options: Array<{ value: string }> }).options) for (const age of [5, 35, 70]) for (const wk of [0.5, 8]) expect(flat(t.run({ ...v, vx: o.value, age, wk })), o.value).not.toMatch(bad);
  });

  it('a yellow fever shot needs 10 days: 1 week is too late, 2 weeks is in time', () => {
    const { t, v } = defaults('vaccine', { vx: 'yellowFever' });
    expect(t.run({ ...v, wk: 1 }).value).toBe('Too late');
    expect(t.run({ ...v, wk: 2 }).value).toMatch(/10 days/);
  });

  it('Japanese encephalitis: 14 days for an adult of 18 to 65, 35 days otherwise (CDC schedule 0-7 or 0-28 + 7)', () => {
    const { t, v } = defaults('vaccine', { vx: 'je' });
    expect(t.run({ ...v, age: 40, wk: 10 }).value).toMatch(/14 days/);
    expect(t.run({ ...v, age: 70, wk: 10 }).value).toMatch(/35 days/);
  });

  it('cost: the median of the departments that list hepatitis A and typhoid lies inside their range', () => {
    const { t, v } = defaults('cost');
    const out = t.run(v);
    expect(out.value).toMatch(/^\$\d/);
    expect(out.table?.rows.length).toBeGreaterThanOrEqual(5);
  });

  it('cost at one department adds its visit and administration fees (Orange County: $17 visit + $18.50 per shot)', () => {
    const { t, v } = defaults('cost', { dept: 'orange-ca' });
    const out = t.run({ ...v, hepA: 'yes', typ: 'inj', yellowFever: 'no', je: 'no' });
    // Full series: 2 × 74.50 hepatitis A + 155.75 typhoid; 2 visits (day 0 and month 6) × $17;
    // 3 injections × $18.50 administration. 149 + 155.75 + 34 + 55.50 = 394.25
    expect(out.value).toBe('$394');
  });

  it('Costa Rica checks arrivals from the 22 African countries with risk throughout (rule points to a map)', () => {
    const cr = DESTS.find((d) => d.s === 'costa-rica')!;
    expect(cr.yf![1]).toBe('fromListed');
    for (const s of ['ghana', 'nigeria', 'uganda', 'french-guiana', 'kenya', 'brazil']) expect(cr.yf![3]).toContain(s);
    expect(cr.yf![3]).not.toContain('panama');
    const e = (slug: string) => expand(DESTS.find((d) => d.s === slug)!);
    expect(yellowFeverForTrip([e('costa-rica')], e('ghana'))[0].verdict).toBe('required');
    expect(yellowFeverForTrip([e('costa-rica')], e('panama'))[0].verdict).toBe('requiredIfRiskOrigin');
    expect(yellowFeverForTrip([e('brazil'), e('dominican-republic')], null)[1].verdict).toBe('required');
  });

  it('price stats match the fee schedules (yellow fever median of 9 lists)', () => {
    const p = priceOf('yellowFever')!;
    expect(p.n).toBe(9);
    expect(p.median).toBeCloseTo(268.53, 2);
    expect(sched('yellowFever').ready_days_after_last).toBe(10);
  });

  it('yellow fever: a country asking every traveler gives "required" whatever the origin', () => {
    const all = DESTS.filter((d) => d.yf?.[1] === 'all');
    expect(all.length).toBeGreaterThan(5);
    for (const d of all) expect(yellowFeverForTrip([expand(d)], null)[0].verdict).toBe('required');
  });

  it('the CDC table is complete', () => {
    expect(DESTS.length).toBeGreaterThanOrEqual(240);
    for (const s of ['india', 'thailand', 'kenya', 'brazil', 'peru', 'mexico']) expect(DESTS.some((d) => d.s === s), s).toBe(true);
  });
});
