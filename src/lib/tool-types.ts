/** Declarative calculators (src/lib/tool-specs.ts), rendered by components/calc/SpecTool.tsx. */
export type V = Record<string, number | string>;
interface Common { id: string; label: string; help?: string; adv?: boolean; wide?: boolean; /** Shown only when this returns true (the field still keeps its value). */ show?: (v: V) => boolean; /** Label that depends on the other fields. */ dynLabel?: (v: V) => string }
export interface NumIn extends Common { kind?: 'num'; def: number; unit?: string; max?: number; decimals?: number }
export interface ChoiceIn extends Common { kind: 'choice'; def: string; options: Array<{ value: string; label: string }> }
export interface SelectIn extends Common { kind: 'select'; def: string; options: Array<{ value: string; label: string }>; /** Options that depend on the other fields (states verified for the chosen bond). */ dyn?: (v: V) => Array<{ value: string; label: string }> }
export type Input = NumIn | ChoiceIn | SelectIn;
export interface ToolOut {
  label: string; value: string; sub?: string;
  rows: Array<[string, string, number?]>;
  table?: { caption?: string; headers: string[]; rows: string[][]; align?: Array<'l' | 'r'> };
  note?: string;
}
export interface ToolSpec { inputs: Input[]; run: (v: V) => ToolOut }
export const visible = (i: Input, v: V) => !i.show || i.show(v);
export const labelOf = (i: Input, v: V) => (i.dynLabel ? i.dynLabel(v) : i.label);
