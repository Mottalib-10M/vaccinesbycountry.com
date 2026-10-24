/** Regions used by the region pages (geography, not CDC data) and the row each page shows per destination. */
import { dest, levelOf, LEVEL_TEXT } from './data';

export const REGIONS: Record<string, string[]> = {
  africa: ['algeria', 'angola', 'benin', 'botswana', 'burkina-faso', 'burundi', 'cameroon', 'cape-verde', 'central-african-republic', 'chad', 'comoros', 'congo', 'ivory-coast', 'democratic-republic-of-congo', 'djibouti', 'egypt', 'equatorial-guinea', 'eritrea', 'eswatini', 'ethiopia', 'gabon', 'the-gambia', 'ghana', 'guinea', 'guinea-bissau', 'kenya', 'lesotho', 'liberia', 'libya', 'madagascar', 'malawi', 'mali', 'mauritania', 'mauritius', 'morocco', 'mozambique', 'namibia', 'niger', 'nigeria', 'rwanda', 'sao-tome-and-principe', 'senegal', 'seychelles', 'sierra-leone', 'somalia', 'south-africa', 'south-sudan', 'sudan', 'tanzania', 'togo', 'tunisia', 'uganda', 'zambia', 'zimbabwe'],
  southAmerica: ['argentina', 'bolivia', 'brazil', 'chile', 'colombia', 'ecuador', 'french-guiana', 'guyana', 'paraguay', 'peru', 'suriname', 'uruguay', 'venezuela'],
  southeastAsia: ['brunei', 'burma', 'cambodia', 'indonesia', 'laos', 'malaysia', 'philippines', 'singapore', 'thailand', 'east-timor', 'vietnam'],
};

const short: Record<string, string> = { most: 'most', some: 'some', consider: 'consider', routine: 'routine', notRecommended: 'no', info: 'info', prescription: 'tablets', awareness: 'awareness', none: '' };
const lv = (code: string | undefined) => (code ? short[levelOf(code)!] : '');
const YF_REC: Record<string, string> = { recommended: 'recommended', generallyNotRecommended: 'generally not', notRecommended: 'no' };
const YF_RULE: Record<string, string> = { all: 'every traveler', fromRiskCountries: 'from risk countries', fromListed: 'from listed countries', none: 'no', 'see text': 'see CDC' };

/** One row per destination: name, hepatitis A, typhoid, yellow fever advice (with scope), certificate rule, malaria. */
export function regionRows(slugs: string[]) {
  return slugs.map((s) => {
    const d = dest(s);
    const yf = d.yf;
    return {
      s, n: d.n,
      hepA: lv(d.d.hepA), typhoid: lv(d.d.typhoid),
      yfRec: yf ? `${YF_REC[yf[0]] ?? 'see CDC'}${yf[0] === 'recommended' && yf[2] === 'areas' ? ', some areas' : ''}` : 'no',
      yfRule: yf ? YF_RULE[yf[1]] : 'no',
      malaria: d.m?.l === 'P' ? 'tablets' : 'no',
    };
  });
}
export { LEVEL_TEXT };
