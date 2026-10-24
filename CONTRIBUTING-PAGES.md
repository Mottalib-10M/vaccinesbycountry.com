# Writing a page

One page = one file. Routes, menus, sitemap, schemas, llms.txt and internal links read these files alone.

- Topic page (a vaccine, a price, malaria, a region): `src/content/guides/<id>.ts` with `defineGuide`
  (model: `yellow-fever-vaccine.ts`). `tool` names the calculator at the top (`src/lib/tool-specs.ts`:
  `trip`, `cost`, `vaccine`, `yf`, `malaria`, `risk`, `clinic`, `nhs`), `toolArg` its defaults.
- Destination page: `src/content/countries/<cdc-slug>.ts` with `defineCountry` (model: `india.ts`), served at
  `/en/vaccines-for-<slug>/`. The slug is CDC's (`wwwnc.cdc.gov/travel/destinations/traveler/none/<slug>`); the page
  shows the trip checker set on the country and, under the text, the CDC wording quoted in full (generated).
- The list of pages the site must have is `src/lib/planned.ts`.

## Facts

`node scripts/facts.mjs <slug> …` prints the CDC levels and wording of a destination, its yellow fever rule,
malaria details and the published prices. Write from that, never from memory.

Every figure in a text comes from the kit (`src/lib/kit.ts`, documented at its top): `K.price(fee)` (n, min,
median, max per dose), `K.range([ids])` (series with fees across departments), `K.lead(id, age)` (days before
departure), `K.tablets(drug, days)`, `K.list(fee)` (CDC private-sector price), `K.d(slug)` (CDC levels),
`K.yfAll()` etc. Never type a price, a dose count or a lead time.

## CDC material (public domain, with conditions)

cdc.gov/other/agencymaterials.html: attribution to CDC, no implied endorsement, **no change to the substantive
content**, and a statement that the material is available free on cdc.gov. So: the country pages quote CDC word for
word in the generated block; our own text explains and never rewrites CDC's advice into something else (no
"CDC says you must" when CDC says "consider"). The footer and each quoted block carry the disclaimer.
`scripts/update-data.mjs` reads CDC with one request every 20 seconds (robots.txt Crawl-delay).

## Tone (health page)

Facts and conditions, never a personal recommendation: "CDC lists… for most travelers", "a clinician decides".
No "you should get", no "we recommend", no booking, no clinic link, no form.

## Rules checked by `npx vitest run tests/pages.test.ts` (PAGE_FILES=id1,id2 to test only some)

- title 50 to 60 characters, key term first, 2026, unique; description 150 to 160, 2026, unique;
- `resume`: one paragraph of 120 words or more with the figures (the direct answer);
- body: 650 words of prose for a guide, 450 for a country page, tables apart; at least one `h.mini(...)`;
- 3 to 8 FAQ, answers of 40 to 90 words, questions unique across the site;
- no em or en dash, none of the banned phrases listed in the test.

Then `npm run check` (build and every rule of the factory) must end at 0.

## Keeping data current

`node scripts/update-data.mjs` (CDC ≈ 81 min, NADAC, CDC price list watch) then `node scripts/build-data.mjs`.
The workflow `.github/workflows/deploy.yml` runs them on the 1st of each month and NADAC every Monday. Health
department price lists (`data/fees-us.json`) are reread by hand every quarter: each record keeps its URL and date.
