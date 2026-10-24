import type { Locale } from './routes';
const en = {
  updatedOn: 'Data checked on', editorialPolicy: 'Editorial policy', contactLabel: 'Contact', reviewedBy: 'Compiled by',
  skipToContent: 'Skip to content', mainNav: 'Main navigation', breadcrumbLabel: 'Breadcrumb', breadcrumbHome: 'Home', menuOpen: 'Open menu',
  faqTitle: 'Questions travelers ask', relatedCalculators: 'Next steps', sourcesTitle: 'CDC pages, price lists and data behind this page', writtenBy: 'Compiled by',
  asOf: 'Data of', lastUpdated: 'CDC pages and price lists last read on', footerValidated: 'Data: CDC Travelers’ Health destination pages and Yellow Book, self-pay fee schedules of US county health departments, CDC adult vaccine price list, NADAC (CMS), NHS',
  footerBrowser: 'The checker runs in your browser on a static table · no name, phone or e-mail asked · no vaccine sold, no clinic paid',
  footerDisclaimer: 'Independent site published by Radif Partners. Not affiliated with CDC, HHS, the NHS or any clinic or pharmacy; the use of CDC material does not imply endorsement by CDC, ATSDR, HHS or the United States Government. CDC material reproduced here is available free of charge on cdc.gov. This site is not medical advice and does not replace a doctor, nurse or pharmacist, who decides which vaccines suit you.',
  footerPopular: 'Vaccines by country',
  notFound: 'This address leads nowhere. The trip checker on the home page lists the vaccines CDC advises for up to three countries, the yellow fever rule at each border and the published price of each shot.',
  readMore: 'Read the full answer',
  estimate: 'CDC advice is quoted from the destination page of each country; prices are the self-pay lists of US public health departments, dated, not quotes. Your clinician decides what you need from your health, age, plans and past vaccines.',
};
export function t(_lang: Locale) { return en; }
