# Zillit Global Production Rates Bible
## Developer Handoff Brief

**Product:** Zillit Coda — Platform-level feature (not per-production)  
**Module:** Global Production Rates Bible  
**Status:** HTML prototype complete, React/Tailwind implementation ready  
**Last updated:** April 2026

---

## 1. Overview

The Global Production Rates Bible is a platform-level reference tool within Zillit Coda. It gives production accountants, line producers, and UPMs instant access to union rate cards, working rules, and tax incentives across 34 territories — without navigating between PDFs, union websites, and browser bookmarks.

**Key user jobs-to-be-done:**
- Look up a crew member's rate tier before issuing a deal memo
- Check overtime rules and meal penalty triggers during timecard processing
- Compare rates across territories when planning an international shoot
- Verify tax incentive percentages and eligibility rules
- Ask natural language questions about rates (via the AI assistant)

**What it is NOT:**
- A live payroll system — rates are periodically updated from source PDFs
- A deal memo generator — this is the reference tool that informs memo creation
- A per-production tool — data is platform-wide, not production-scoped

---

## 2. Architecture

### Component tree

```
GlobalRatesBible
├── Sidebar
│   ├── SearchInput
│   ├── RegionGroup[]
│   │   └── TerritoryItem[]
│   ├── StatusLegend
│   └── StatFooter
│
├── WelcomeScreen                (shown when selectedId === null)
│   ├── HeroBlock
│   ├── QuickPins[]
│   ├── HowToCards[]
│   └── RegionGrid[]
│
├── TerritoryView                (shown when selectedId !== null)
│   ├── TerritoryHeader          (breadcrumb, name, badges)
│   ├── TabBar                   (Rates / Rules / Incentives)
│   ├── UnionPicker              (pill filter — rates tab only)
│   ├── ContentSearch            (row-level search — rates tab only)
│   └── ScrollArea
│       ├── RatesTab
│       │   └── AgreementCard[]
│       ├── RulesTab
│       │   └── RuleGroup[]
│       └── IncentivesTab
│           └── IncentiveCard[]
│
└── AIAssistantPanel             (slide-in panel, right)
    ├── MessageList
    │   ├── UserMessage[]
    │   └── AssistantMessage[]
    ├── QuickPrompts
    └── TextInput
```

### State management

Zustand store (`useRatesStore`) holds all UI state:

| Key | Type | Description |
|-----|------|-------------|
| `selectedId` | `string \| null` | Currently viewed territory; `null` = welcome screen |
| `activeTab` | `'rates' \| 'rules' \| 'incentives'` | Current tab within territory view |
| `agrFilter` | `string` | Selected union pill ID (`'all'` = show all) |
| `contentQuery` | `string` | Search query filtering rate rows |
| `sidebarQuery` | `string` | Search query filtering territory list |
| `aiOpen` | `boolean` | Whether AI panel is visible |
| `aiHistory` | `AiMessage[]` | Conversation history (trimmed to last 12) |

State is reset on territory change:
- `agrFilter` → `'all'`
- `contentQuery` → `''`

### Data flow

```
HTML Prototype (v10)
    ↓
data-extract.js (Node script)
    ↓
src/data/ratesData.ts          BIBLE: Territory[]
src/data/aiSystemPrompt.ts     AI_SYSTEM_PROMPT: string
    ↓
GlobalRatesBible component
    ↓
Sidebar + TerritoryView + AIAssistantPanel
```

---

## 3. Data Model

### Territory

```typescript
interface Territory {
  id: string              // 'uk' | 'us' | 'ca' | 'de' | ... (ISO 2-char, lowercase)
  flag: string            // emoji flag(s)
  name: string            // display name
  region: TerritoryRegion
  currency: string        // symbol or code e.g. '£' | '$' | '€' | 'CAD'
  tz: string              // display string e.g. 'GMT/BST'
  summary: string         // one paragraph overview
  agreements: Agreement[]
  rules: RuleGroup[]      // working rules, grouped by union
  incentives: Incentive[] // tax credits and rebates
}
```

### Agreement

```typescript
interface Agreement {
  id: string              // unique e.g. 'uk-cam', 'us-sag', 'ca-873'
  name: string            // full display name
  type: AgreementType     // 'crew' | 'performers' | 'writers' | 'directors' | 'post'
  union: string
  eff: string             // effective from (display string)
  effectiveTo?: string
  status: 'confirmed' | 'not_extracted' | 'broken'
  access: 'public' | 'member'
  source: string          // URL
  pdf?: string            // direct PDF URL (confirmed only)
  holNote?: string        // holiday pay treatment note
  note?: string           // general caveat
  rows: RateRow[]
}
```

### RateRow

```typescript
interface RateRow {
  // Section header row (gold divider)
  isHd?: boolean
  hd?: string             // header text (budget tier, year, etc.)
  
  // Rate row
  g?: string              // grade / item label
  r1?: string             // primary rate (DM Mono, formatted string)
  r2?: string             // secondary rate or note
  ind?: boolean           // purple — Ind. Neg.
  neg?: boolean           // teal — Own Negotiation
}
```

### Rule provision

```typescript
interface RuleItem {
  k: string               // rule name (left column, ~200px)
  v: string               // rule detail (right column)
  warn: boolean           // true = orange highlight = compliance risk
}
```

---

## 4. Setting Up

### Prerequisites

```bash
node >= 18
npm >= 9
```

### Install

```bash
git clone <repo>
cd zillit-rates-bible
npm install
```

### Extract data from HTML prototype

Place the HTML prototype in `public/`:

```bash
cp zillit-global-rates-bible-v10.html public/
npm run extract-data
```

This generates:
- `src/data/ratesData.ts` — typed BIBLE array (~220KB)
- `src/data/aiSystemPrompt.ts` — compressed AI context string

### Fonts

In `app/layout.tsx`:

```typescript
import { Syne, DM_Sans, DM_Mono } from 'next/font/google'

const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-syne',
})
const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-dm-sans',
})
const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-dm-mono',
})

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${syne.variable} ${dmSans.variable} ${dmMono.variable}`}>
      <body>{children}</body>
    </html>
  )
}
```

In `tailwind.config.ts`:

```typescript
fontFamily: {
  syne: ['var(--font-syne)', 'sans-serif'],
  dm:   ['var(--font-dm-sans)', 'sans-serif'],
  mono: ['var(--font-dm-mono)', 'monospace'],
}
```

### Page setup

```typescript
// app/rates-bible/page.tsx
import { GlobalRatesBible } from '@/components/rates-bible/GlobalRatesBible'

export default function RatesBiblePage() {
  return <GlobalRatesBible />
}
```

---

## 5. AI Assistant Integration

### Current implementation (claude.ai artifact)

The HTML prototype calls `https://api.anthropic.com/v1/messages` directly using the claude.ai ambient API key. This works inside the artifact but **not** in a deployed Next.js app.

### Production deployment

Create an API route:

```typescript
// app/api/rates-chat/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { messages, systemPrompt } = await req.json()

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type':         'application/json',
      'x-api-key':            process.env.ANTHROPIC_API_KEY!,
      'anthropic-version':    '2023-06-01',
    },
    body: JSON.stringify({
      model:      'claude-sonnet-4-20250514',
      max_tokens: 900,
      system:     systemPrompt,
      messages,
    }),
  })

  const data = await res.json()
  return NextResponse.json(data)
}
```

Update `AIAssistantPanel.tsx` to call `/api/rates-chat` instead of the Anthropic API directly.

### AI context strategy

The `data-extract.js` script generates `aiSystemPrompt.ts` which contains a compressed text representation of all confirmed rates, rules, and provisions. This is loaded into the AI's system prompt on every request.

**Context window usage:** ~80-120K tokens depending on version. Claude Sonnet 4.5+ can handle this comfortably. The compression strategy prioritises:
1. Confirmed rates (pending/broken agreements excluded)
2. Working rules with `warn: true` flagged with ⚠
3. Incentive headline rates

If context window becomes a concern, implement territory-scoped context: only send the current territory's data + UK rules (most commonly queried).

---

## 6. Design System

### Colour tokens (CSS variables → Tailwind classes)

| CSS var | Tailwind class | Use |
|---------|----------------|-----|
| `--bg` `#070810` | `bg-bg` | Page background |
| `--bg-s` `#0c0e1a` | `bg-bg-s` | Sidebar, topbar, card bg |
| `--bg-e` `#131624` | `bg-bg-e` | Elevated surfaces, inputs |
| `--bg-h` `#1a1d2e` | `bg-bg-h` | Hover states, section headers |
| `--b` `#1e2234` | `border-border` | Standard border |
| `--bm` `#262b42` | `border-border-mid` | Input focus ring base |
| `--gold` `#e8b84b` | `text-gold` | Primary accent |
| `--gold-g` | `bg-gold-glow` | Gold tinted backgrounds |
| `--t1` `#edeef5` | `text-text-1` | Primary text |
| `--t2` `#8890ae` | `text-text-2` | Secondary text, labels |
| `--t3` `#464d68` | `text-text-3` | Muted, placeholders |
| `--teal` `#2dd4bf` | `text-teal` | Source links, public badge |
| `--green` `#4ade80` | `text-success` | Confirmed status |
| `--yellow` `#fbbf24` | `text-warning` | Pending status |
| `--orange` `#fb923c` | `text-orange` | Warning rules |

### Typography

| Context | Class | Details |
|---------|-------|---------|
| Page title | `font-syne font-black text-2xl tracking-tight` | Syne 800 |
| Section heading | `font-syne font-bold text-xl tracking-tight` | Syne 700 |
| Card title | `font-syne font-black text-sm` | Syne 800 |
| Label / badge | `font-syne font-bold text-2xs uppercase tracking-wide-xl` | Syne 700 |
| Body copy | `font-dm text-sm leading-relaxed` | DM Sans 400 |
| Rate values | `font-mono text-sm text-text-1` | DM Mono 400 |
| Source URLs | `font-mono text-2xs text-teal` | DM Mono 400 |

### Border radius

| Use | Class |
|-----|-------|
| Buttons, inputs, small elements | `rounded-sm` (5px) |
| Cards, panels | `rounded-md` (10px) |
| Pills | `rounded-full` |

### Status dot colours (sidebar)

| Status | Condition | Tailwind |
|--------|-----------|---------|
| Full | All agreements confirmed | `bg-success` |
| Partial | Some confirmed | `bg-warning` |
| Minimal | None confirmed | `bg-orange` |

---

## 7. Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `/` | Focus sidebar search |
| `Esc` | Blur focused input |

---

## 8. Data Update Process

Rate cards are periodically updated from source PDFs and union websites. The update workflow:

1. Open `zillit-global-rates-bible-v10.html` in a text editor
2. Find the relevant agreement by its `id` (e.g. `uk-cam` for Camera Branch)
3. Update the `rows` array and `eff`/`effectiveTo` fields
4. Re-run: `npm run extract-data`
5. Commit and deploy

**Rate sources to monitor:**

| Branch | URL | Frequency |
|--------|-----|-----------|
| Camera Branch | camerabranch.org.uk | April annually |
| Lighting Technicians | sites.google.com/view/sparksbranch | April annually |
| Art Department | britishfilmdesigners.com | April annually |
| Costume Film/TV | bectucostume.com | Nov 2025 last update |
| Hair & Makeup | hairmakeupbranch.org.uk | 2023 V5 (check for V6) |
| SAG-AFTRA | sagaftra.org | July annually |
| DGA | dga.org | July annually |
| IATSE 873 Ontario | iatse873.com | April 2024 (4yr deal) |
| BCCFU | bccfu.org | April annually |

---

## 9. Current Data Status

| Territory | Agreements | Confirmed | Pending | Notes |
|-----------|-----------|-----------|---------|-------|
| 🇬🇧 UK | 19 | 19 | 0 | All 19 BECTU branches. All budget tiers (Film MMP, TV Bands 1-4) |
| 🇺🇸 USA | 5 | 5 | 0 | SAG-AFTRA, DGA, IATSE 600/695/44, WGA West |
| 🇨🇦 Canada | 4 | 4 | 0 | BCCFU (BC), IATSE 873 (Ontario), DGC, WGC |
| 🇩🇪 Germany | 2 | 2 | 0 | Ver.di TV FFS, market rates |
| 🇫🇷 France | 2 | 2 | 0 | CCN 3097 (cinema), CCN 2642 (TV) |
| 🇮🇪 Ireland | 1 | 1 | 0 | SIPTU/SPI |
| 🇦🇺 Australia | 1 | 1 | 0 | MPPA |
| 🇳🇿 New Zealand | 1 | 1 | 0 | Screen Industry Workers Act |
| ... | ... | ... | ... | |

**Pending/member-gated sources:**
- IATSE Local 667 Ontario (camera) — member login required
- Norway, Sweden crew CBAs — member login required
- Netherlands FNV Kiem — member login required
- Italy CCNL audiovisual salary grille — member login required
- Belgium CP 303.01 — member login required

---

## 10. Integration with Zillit Coda

### Placement

The Rates Bible is a platform-level tool accessible from:
- The Zillit Coda global navigation (sidebar or top nav)
- Deep link: `/rates-bible` or `/rates-bible?territory=uk&tab=rules`

It does **not** require production context to function — rates are platform-wide.

### URL state

For shareable deep links, consider syncing the Zustand store to URL params:

```typescript
// useEffect in GlobalRatesBible.tsx
useEffect(() => {
  const params = new URLSearchParams(window.location.search)
  if (params.get('territory')) {
    selectTerritory(params.get('territory')!, params.get('tab') as ActiveTab ?? 'rates')
  }
}, [])

// On territory selection, push to history
useEffect(() => {
  if (selectedId) {
    const url = new URL(window.location.href)
    url.searchParams.set('territory', selectedId)
    url.searchParams.set('tab', activeTab)
    window.history.replaceState({}, '', url)
  }
}, [selectedId, activeTab])
```

### Deal memo integration (future)

The Rates Bible is designed to be the reference layer for deal memo generation. When a deal memo is being created for a UK camera operator on a £30m+ production, the memo UI could:

1. Auto-detect territory from the production's shoot country
2. Deep-link to the relevant agreement (`/rates-bible?territory=uk&union=uk-cam`)
3. Allow the accountant to pull the exact rate from the Bible into the memo field

This integration is out of scope for v1 but the data model is designed to support it.

---

## 11. Files Delivered

| File | Purpose |
|------|---------|
| `types.ts` | All TypeScript interfaces (Territory, Agreement, RateRow, etc.) |
| `tailwind.config.ts` | Zillit design tokens mapped to Tailwind |
| `useRatesStore.ts` | Zustand store — all UI state + selectors |
| `GlobalRatesBible.tsx` | Root component, layout, keyboard shortcuts |
| `Sidebar.tsx` | Territory list, search, legend, stats |
| `WelcomeScreen.tsx` | Landing screen — hero, pins, how-to, region grid |
| `TerritoryView.tsx` | Territory detail — tabs, union picker, search, rate/rules/incentives tabs |
| `AIAssistantPanel.tsx` | Claude-powered chat panel with quick prompts |
| `data-extract.js` | Node script — extracts BIBLE array from HTML prototype |
| `package.json` | Dependencies and npm scripts |
| `developer-brief.md` | This document |
| `zillit-global-rates-bible-v10.html` | Standalone shareable prototype (self-contained, no server needed) |

---

## 12. Contact

**Design system reference:** Expense Cards v10 (`zillit-cards-v10.html`)  
**Production Accountant persona:** Sarah Alderton, The Gilded Hour S2  
**Fictional production:** Gilded Hour Productions  
**Design:** Kate, Glasgow
