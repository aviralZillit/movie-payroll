# Zillit Global Production Rates Bible — Developer Kit

**Version:** v10 · **Date:** April 2026 · **Stack:** React 18 · TypeScript · Next.js 14 · Tailwind CSS · Zustand

---

## What's in this kit

### Shareable prototype
| File | Description |
|------|-------------|
| `zillit-global-rates-bible-v10.html` | Fully self-contained standalone HTML. Open directly in a browser — no server, no dependencies. Share with stakeholders, producers, accountants. |

### Developer files

| File | Description |
|------|-------------|
| `zillit-rates-bible-types.ts` | All TypeScript interfaces: Territory, Agreement, RateRow, RuleGroup, Incentive, AiMessage, plus utility functions |
| `zillit-rates-bible-tailwind.config.ts` | Zillit design tokens mapped to Tailwind — all colour, font, spacing, animation tokens |
| `zillit-rates-bible-useRatesStore.ts` | Zustand store — selectedId, activeTab, agrFilter, contentQuery, sidebarQuery, aiOpen, aiHistory |
| `zillit-rates-bible-GlobalRatesBible.tsx` | Root component — layout, topbar, keyboard shortcuts |
| `zillit-rates-bible-Sidebar.tsx` | Territory list with search, region groups, status dots, legend, stats footer |
| `zillit-rates-bible-WelcomeScreen.tsx` | Landing screen — hero, quick pins, how-to cards, region grid |
| `zillit-rates-bible-TerritoryView.tsx` | Territory detail — tabs, union picker, content search, rate/rules/incentives tabs, all sub-components |
| `zillit-rates-bible-AIAssistantPanel.tsx` | Claude-powered chat panel with quick prompts and API route pattern |
| `zillit-rates-bible-data-extract.js` | Node script — extracts BIBLE array from HTML prototype into typed TypeScript |
| `zillit-rates-bible-package.json` | Dependencies and npm scripts |
| `zillit-rates-bible-developer-brief.md` | Full architecture docs, data model, setup guide, design system, deployment notes |

### Generated data files (from running `data-extract.js`)
| File | Size | Description |
|------|------|-------------|
| `zillit-rates-bible-ratesData.ts` | 253KB | Full BIBLE array typed as `Territory[]` — import directly |
| `zillit-rates-bible-aiSystemPrompt.ts` | 119KB | Compressed AI context string — pass to Claude as system prompt |

### Documentation
| File | Description |
|------|-------------|
| `zillit-rates-bible-narration-script.docx` | Video walkthrough narration script with full screen-by-screen notes |
| `zillit-rates-bible-developer-brief.md` | Architecture, data model, setup, AI integration, update workflow |

---

## Quick start

```bash
# 1. Install
npm install

# 2. Rename files to match expected paths
#    (strip the "zillit-rates-bible-" prefix, place in the right folders)
mkdir -p src/components/rates-bible src/data

# 3. Generate typed data from the HTML prototype
node src/components/rates-bible/data-extract.js \
  public/zillit-global-rates-bible-v10.html \
  --out src/data

# 4. Add the page route
# app/rates-bible/page.tsx → import { GlobalRatesBible } from '@/components/rates-bible/GlobalRatesBible'

# 5. Add fonts in app/layout.tsx (Syne, DM Sans, DM Mono via next/font/google)

# 6. Run
npm run dev
```

---

## Data update workflow

Rate cards update annually (mostly April for UK, July for USA). When BECTU or a union publishes new rates:

1. Open `zillit-global-rates-bible-v10.html` in a text editor
2. Find the agreement by its `id` (e.g. `uk-cam` for Camera Branch)
3. Update the `rows` array and `eff`/`effectiveTo` fields
4. Re-run: `npm run extract-data`
5. Commit and deploy

The HTML prototype is the single source of truth for rate data.

---

## Contents: 34 territories · 57 confirmed agreements · 19 UK BECTU branches

**Fully confirmed:** UK (all 19 branches + all budget tiers), USA (SAG-AFTRA, DGA, IATSE 600/695/44, WGA), Canada BC (BCCFU), Canada Ontario (IATSE 873), Germany (Ver.di), France (CCN 3097 + 2642), Ireland (SIPTU/SPI), Australia (MPPA), New Zealand (SIWA)

**Framework data:** Denmark, Austria, Portugal, Greece, Belgium, Netherlands, Finland, Czech Republic, Hungary, Poland, Romania, UAE, South Africa, Morocco, Mexico, Brazil, Colombia, Argentina, Japan, South Korea, India, Singapore, Spain, Italy, Norway, Sweden

---

*Zillit — Global Production Rates Bible · Platform-level feature · Zillit Coda*
