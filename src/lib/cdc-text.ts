/** Build-time only: the verbatim CDC wording of a destination (data/destinations.json). Never imported by a client component. */
import FULL from '../../data/destinations.json';
import type { Destination } from './engine/types';
const D = (FULL as unknown as { destinations: Destination[]; retrieved_at: string });
export const CDC_FULL_DATE = D.retrieved_at;
export const fullDest = (slug: string) => { const d = D.destinations.find((x) => x.slug === slug); if (!d) throw new Error(`No CDC page for ${slug}`); return d; };
