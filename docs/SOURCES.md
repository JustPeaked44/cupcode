# CupCode data provenance

Research date: **19 October 2026 (Asia/Manila)**. Runtime generation is local; the app makes no recipe or AI requests.

## Code authority

`beverage-id-codes.md`, supplied FY25 appendix transcription, is the sole code authority. A complete copy is retained in this directory and in `public/` for the in-app manual link. `npm run catalog` parses the 152 source table rows to `src/data/catalog.json`, preserving field, category, meaning, status, source line, duplicate CH row and both crossed-out rows. The library shows all rows. Active lookup rejects crossed-out TOP and selects the active Whipped Cream definition of WC.

V / LS, C + M, C + CJF, CJ + VCFGMTL and CJ + VCFBTL are separately represented in `catalog.ts`; they are examples, not invented standalone catalog rows. V is only attested in the sweetness example. LS/NS accompany the syrup ID. No generated order depends on an unspecified syrup definition.

Inspected original images: IMG_20261017_181838.jpg, IMG_20261017_181842.jpg, IMG_20261017_181844.jpg and IMG_20261017_181855.jpg. These are manual pages. The two separate cup-layout reference images mentioned in the brief were unavailable. Cup geometry is an original CSS illustration using the six-field order explicitly specified by the user; exact visual agreement with missing cup references is unverified. The additional PDF in the resource folder was not used as a recipe or code authority.

## Recipe and compatibility sources

- [Official Philippines menu](https://starbucks.ph/menu): regional drink-name and category cross-check. Site can return 403 with the www hostname. It is not a complete operational recipe manual.
- [Official Philippines nutrition database](https://starbucks.ph/docs/CalorieContentandNutriInfoDatabase.pdf): supported sizes, temperatures, milk alternatives and whip/no-whip combinations. Printed product variants support Latte, Cappuccino, Americano, Mocha, White Chocolate Mocha, Caramel Macchiato, Cold Brew, Pure Matcha Latte, Caramel Coffee Frappuccino, Mocha Frappuccino, Pure Matcha Cream Frappuccino, Pink Drink and Strawberry Açaí Lemonade. Hot/cold drinks use Tall/Grande/Venti where listed; blended and Refreshers drinks remain cold. Specific page anchors are retained on each recipe. No US fluid-ounce quantities or pump defaults are imported.
- [Starbucks Philippines Pink Drink introduction](https://www.starbucks.ph/story/27): fruit, coconut-milk and lemonade ingredient context.
- [Official customization guidance](https://about.starbucks.com/stories/2025/ways-to-customize-your-beverage-at-starbucks/): general decaf, espresso-shot and light/no-whip guidance. This is broader-market guidance, not evidence of Philippine store availability or policy.
- [Official Caramel Frappuccino description](https://www.starbucks.com/menu/product/424/iced): ingredient-level context only. US sizes, pump quantities and caffeine specifications are not transferred to the PH exercise catalog.

## Explicit training assumptions and exclusions

1. This is a **marking exercise**, not a beverage-preparation recipe trainer. Only the drink identifier and explicitly requested changes are marked. Standard ingredients, default milk, default shots, syrup pumps, scoops and topping quantities remain unmarked. Empty fields mean “no explicit change in this exercise,” not a claim about official default cup-marking policy.
2. General espresso customizations (decaf, two or three espresso shots **in total**) and light whip are applied to compatible PH drinks as **documented training assumptions**. They are disclosed in the answer when used. Numeric codes describe the customer's explicit total; the generator never derives shot quantities from caffeine values or asks for “one extra shot” without a known base count. Full/half decaf conventions remain in the catalog; half decaf is not generated.
3. Milk substitutions are limited to the nonfat, soy, oat and almond variants documented for the chosen drinks. Pink Drink keeps its coconut base and Refreshers receive no arbitrary dairy/espresso changes. Coffee Frappuccino does not receive decaf espresso or a guessed FR pump count.
4. Whipped-cream removal uses the active WC definition plus the active Custom slash-over rule. The crossed-out No Whipped Cream standalone row is never reactivated. Light uses Lt before WC. Extra (X before a code) is taught in the library; unsupported extra-whip requests are excluded from generation.
5. Caramel syrup is added only to Mocha using the manual's explicit C (Syrup) + M (Drink) example. It is a documented training example; no pump quantity or current local syrup stock is asserted. Syrup and sauce share one field. Syrup changes for other drinks are excluded until verified.
6. `->` means a requested carrier bag only by the user's training convention. It is not an official Starbucks code. Customer names are fictional; the third information line starts blank. To-go alone does not imply a bag.
7. All source categories are available in the library, but only the 13 researched recipes enter random generation. Teavana shaken teas and other unsupported recipes/customizations remain reference-only. Product appearance in a manual or historical nutrition table does not guarantee stock today. The app does not claim official operational certification.
8. Combined custom/drink examples and sweetness notation stay reference-only until their full supported recipes and regional availability can be verified.

## Design and deployment sources

- [Apple HIG: Motion](https://developer.apple.com/design/human-interface-guidelines/motion): brief, purposeful, optional motion and immediate feedback. CupCode uses brief opacity transitions, native scroll behavior, press feedback, focus indicators, and reduced-motion/transparency/contrast media preferences.
- [Render Static Sites](https://render.com/docs/static-sites) and [Render static build settings](https://render.com/tutorials/web-service-vs-static-site/static-sites): build once to dist; no backend. Hash routes require no server rewrite.
