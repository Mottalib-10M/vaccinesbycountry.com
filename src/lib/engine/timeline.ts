// Timeline engine: latest date to start each vaccine so that the last dose before departure plus the
// protection delay (CDC) ends on or before the departure date. Dates are ISO strings (UTC days).
import type { VaccineSchedule } from './types';

const DAY = 86_400_000;
export const addDays = (iso: string, n: number) => new Date(Date.parse(`${iso}T00:00:00Z`) + n * DAY).toISOString().slice(0, 10);
export const daysBetween = (a: string, b: string) => Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / DAY);

export interface Step { vaccine: string; startBy: string; doseDates: string[]; readyOn: string; tooLate: boolean }

/**
 * @param age adult 18–65 gets the shorter Japanese encephalitis schedule (days 0 and 7).
 * Doses that may follow the trip (second hepatitis A dose) are not counted in the deadline.
 */
export function plan(schedules: VaccineSchedule[], today: string, departure: string, age = 30): Step[] {
  return schedules.map((s) => {
    const days = age >= 18 && age <= 65 && s.doses_days_18_65 ? s.doses_days_18_65 : s.doses_days;
    const before = days.slice(0, s.doses_before_travel ?? days.length);
    const span = before[before.length - 1] + (s.ready_days_after_last ?? 0);
    const startBy = addDays(departure, -span);
    const start = startBy < today ? today : startBy;
    const doseDates = days.map((d) => addDays(start, d));
    const readyOn = addDays(start, span);
    return { vaccine: s.id, startBy, doseDates, readyOn, tooLate: readyOn > departure };
  }).sort((a, b) => a.startBy.localeCompare(b.startBy));
}
