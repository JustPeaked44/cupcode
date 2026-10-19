# CupCode V1 verification

Verified locally on 19 October 2026, using Node 20.19.2 on Windows.

## Passing checks

- `npm test`: **21 tests across 4 files**. Includes source fidelity for all 152 rows, contextual collisions, crossed-out exclusions, all 11 manual categories, 2,000 deterministic generation samples spanning all 13 recipe profiles and 1–3 drinks, customization compatibility, exact dialogue correspondence, blank fields, independent attempts, repeat avoidance, bag notation and spatial modifiers.
- React tests cover start, editable independent cups, preserved inputs on reveal, mental practice, memory tips without grading, exact retry, reset, generation, exit, help and library search.
- Speech tests cover voice selection/fallback, identical replay text, cancellation before playback, stale callbacks, delayed startup, missing/throwing speech engines, asynchronous `voiceschanged`, no autoplay on discovery and listener cleanup.
- `npm run typecheck`: passed. The final `npm run build` repeats TypeScript validation, including browser tests, and passed.
- Final production output: `dist/index.html`, CSS **31.00 kB** (8.00 kB gzip), JS **282.98 kB** (84.52 kB gzip), favicon and reference files. No runtime backend is required.
- `TEST_URL=http://localhost:4173 npm run test:e2e` (environment variable syntax varies by shell): **4 of 4 passed against the production build**. Chrome desktop 1440×1050 and Chromium with iPhone 13 viewport 390×664, touch enabled. Browser tests exercise all main controls, keyboard order, multiple independent cups, horizontal navigation, exact retry speech, rapid generation, input preservation, route refresh/back, unavailable speech, reduced motion, and empty browser storage.
- Axe checks report **zero violations** on the homepage, full 152-entry library, filtered library and answer reveal in both browser projects.
- Chrome DevTools Lighthouse snapshot: **100 Accessibility, 100 Best Practices, 100 SEO** for final production homepage and practice answer view. Performance was not audited. The optional llms.txt/agentic-browsing recommendation was not implemented; it is outside the trainer requirements.

## Visual review

Inspected homepage and practice captures on desktop; inspected tablet at 820px and narrow layouts; opened Playwright-generated mobile home/reveal captures. Confirmed multiple-cup scrolling remains inside the workspace, with no horizontal page overflow at 390px or 820px. Mobile marking inputs are at least 44px high; input values accept letters, numbers, slashes, percent signs and spaces. Fixed small-text contrast in mode controls, search, homepage step numbers and crossed-out source entries. Removed overlapping decorative labels from the smallest hero layout and made the skip link visually clipped until focused.

Browser screenshots and the HTML test report are generated in ignored `test-results/` and `playwright-report/`. Rerunning the browser suite regenerates them.

## Practical limits

- Web Speech was also exercised without mocks in desktop Chrome: three English system voices were discovered and the utterance lifecycle reported start/completion. This does not verify audible output quality, actual male/female identity, or every OS/browser. Automated browser speech assertions use a mock engine.
- No physical-device, actual iOS Safari, Firefox, screen-reader session or real-person usability study was performed. Native scrolling/touch support uses platform behavior; viewport emulation is not a physical-device certification.
- The separate cup-layout reference images were missing. Code-manual photos were inspected. Exact matching to the absent cup references cannot be verified.
- General espresso/light-whip customization rules are documented training assumptions, not certified Philippine store policy. Unsupported recipes stay reference-only. See `SOURCES.md`.
- Render deployment was **not performed**. The README provides exact free Static Site settings and a post-deployment smoke checklist.
