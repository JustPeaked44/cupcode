# CupCode — Barista Cup-Marking Trainer

A complete browser-only, reveal-only barista practice app. Hear or read a fictional customer order, mark one to three interactive cups, then compare with explained reference markings. No accounts, grades, analytics, database, API keys, or saved practice history.

## Run locally

Requires Node **20.19+** (Node 22 LTS recommended) and npm.

```sh
npm ci
npm run dev
```

Open the URL printed by Vite (normally http://127.0.0.1:5173). Development can also use `npm run dev -- --port 5174`.

```sh
npm test                 # domain, React interaction and speech unit tests
npm run typecheck        # TypeScript including unit tests
npm run build            # TypeScript + Vite production build
npm run preview          # serve dist locally, normally port 4173
```

## Browser tests

Playwright uses installed Google Chrome (`channel: chrome`), desktop and iPhone-sized Chromium viewports. The tests mock speech so lifecycle assertions do not depend on OS audio or remote services; they do not certify audible output or real iOS Safari.

Start the dev server on port 5174, then run:

```sh
npm run dev -- --port 5174
npm run test:e2e
```

In a second terminal, set `TEST_URL` if using a different server (PowerShell: `$env:TEST_URL='http://localhost:4173'`). If Chrome is absent, install Chrome or change `channel` in `playwright.config.ts` to a locally installed Playwright Chromium. Browser tests save screenshots and retain traces on failure in `test-results/`, with an HTML report in `playwright-report/`.

## Implemented

- Home, practice and searchable contextual code library; hash navigation and refresh.
- Full 152-row FY25 catalog; 13 constrained PH recipe profiles; deterministic injected RNG for tests.
- One to three separate hot/cold cups, each with six editable marking fields and three customer-information lines.
- Typing and mental practice, contextual explanations and memory tips, spatial slash-over notation, original inputs preserved after reveal.
- Try Again keeps the exact customer/dialogue/drinks and clears attempts. Generate Order changes identity and avoids the previous beverage signature, even with a constant RNG.
- Native browser text-to-speech, voice discovery, best-effort male/female preferences, varied voice selection, replay/stop, cancellation and stale-callback protection.
- Keyboard labels/focus/order, mobile horizontal cup scrolling and navigation, reduced motion, increased contrast and reduced transparency support.

## Project structure

```text
src/data/          Full source catalog, verified recipe profiles, contextual lookups
src/domain/        Scenario construction, marking models, study tips, tests
src/audio/         Web Speech lifecycle, React hook, tests
src/components/    Cups, answer explanations, code library
src/App.tsx        Home and practice flow; temporary session state
src/styles.css    Responsive visual system and accessibility preferences
tests/            Playwright interaction, accessibility and viewport tests
scripts/          Reproducible manual-to-JSON parser
docs/             Supplied manual, provenance, implementation QA
public/           Favicon, manual download, robots.txt
```

## Deploy to Render's free Static Site service

1. Push this project, including `package-lock.json`, to a GitHub, GitLab or Bitbucket repository you can connect to Render. Do not commit `node_modules` or `dist`.
2. In the [Render Dashboard](https://dashboard.render.com/), choose **New → Static Site** (not Web Service) and connect the repository.
3. Select the branch you want deployed and name the site `cupcode` (or any available name).
4. **Root Directory:** leave blank when these files are at repository root; otherwise enter the folder containing `package.json`.
5. **Build Command:** `npm ci && npm run build`
6. **Publish Directory:** `dist`
7. **Environment:** set `NODE_VERSION` to `22`. No API keys, runtime secrets, database, backend, or start command are required.
8. Click **Create Static Site**. Wait for the successful build/deploy, then open the generated `https://<site-name>.onrender.com` URL.
9. Verify Start Practice, a three-cup order, Show Answer, Try Again, Generate Order, Replay/Stop, Exit, library search, and refresh at `/#practice` and `/#reference`. Test speech after an intentional user click on the actual target device.

No rewrite rule is required because navigation uses URL hashes. Render's static-site service is free subject to its current workspace bandwidth and build-minute limits; review the [official static-site documentation](https://render.com/docs/static-sites). This project has been prepared and locally tested; it has **not been deployed** to a Render account.

## Sources, limitations and speech

Read [docs/SOURCES.md](docs/SOURCES.md) before expanding recipes. Code authority is the supplied manual, never newer internet acronyms. Run `npm run catalog` after updating the manual, and synchronize `public/beverage-id-codes.md` when changing the source copy. Crossed-out and duplicated rows remain visible as documented. Generated orders mark explicit requests, without inferring standard recipe quantities. Broader-market espresso/light-whip customizations are labeled training assumptions; local availability varies. Unsupported drinks remain reference-only.

The four available manual photos were inspected. The two separate cup-layout images mentioned in the brief were not available, so exact visual matching is unverified.

Web Speech depends on browser, OS voices, audio output, and user-gesture/autoplay policy. Gender is not provided reliably by the API: preferences use a small known-name mapping and fall back to an English/default voice. Voices may arrive after page load, be missing, require OS network access, or sound alike. The app itself makes no speech service request; some system voices may use the device vendor's speech service. Text practice always works. Reload resets the session; Exit clears it. No orders or trainee inputs are written to browser storage.

Independent educational tool; not affiliated with or endorsed by Starbucks.
