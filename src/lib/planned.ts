/** Every page id the site is meant to have. Content tests accept links to these ids while pages are being
 *  written; the "all planned pages exist" test fails until each has its file. */
export const PLANNED_GUIDES = [
  'travel-vaccines-cost', 'yellow-fever-vaccine', 'yellow-fever-vaccine-cost', 'yellow-fever-certificate-countries',
  'typhoid-vaccine', 'typhoid-vaccine-cost', 'hepatitis-a-vaccine', 'hepatitis-a-vaccine-cost', 'japanese-encephalitis-vaccine',
  'rabies-vaccine-for-travel', 'cholera-vaccine', 'chikungunya-vaccine', 'hepatitis-b-vaccine-for-travel', 'polio-booster-for-travel',
  'malaria-pills', 'malaria-risk-by-country', 'travel-clinic', 'travel-jabs', 'vaccines-for-africa', 'vaccines-for-south-america', 'vaccines-for-southeast-asia',
];
export const PLANNED_COUNTRIES = [
  'india', 'thailand', 'vietnam', 'kenya', 'mexico', 'brazil', 'peru', 'indonesia', 'philippines', 'egypt', 'morocco',
  'colombia', 'costa-rica', 'tanzania', 'south-africa', 'dominican-republic', 'cambodia', 'nepal', 'ghana', 'china',
].map((x) => `country:${x}`);
export const PLANNED_IDS = new Set<string>([...PLANNED_GUIDES, ...PLANNED_COUNTRIES]);
