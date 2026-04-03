# Zillit Coda — Deal Memo Wizard · Developer Brief

**Production:** The Gilded Hour — Series 2  
**Module:** Deal Memo Creation Wizard  
**Prototype version:** v7  
**Prepared by:** Sarah Alderton (Production Accountant) via Zillit Coda design system  
**Stack:** React 18 · TypeScript · Next.js 14 App Router · Tailwind CSS · PostgreSQL/Prisma · Zustand · TanStack Query

---

## Overview

The Deal Memo Wizard is a 10-step form that creates, validates and issues crew employment contracts for film and TV productions. It is the entry point to the Payroll module — every timecard, cost report line, and compliance check downstream is seeded from the data entered here.

The wizard must handle **global agreements** (60+ unions, 20 territories), **custom/non-union deals** with production-defined rule templates, **multi-entity productions** (same production may have UK Ltd, Irish DAC, and US LLC contracting different crew), and **two-stage crew onboarding** (production fills half the fields; crew completes the rest via the Crew Portal).

---

## Architecture

### File structure delivered

```
zillit-coda-deal-memo-devkit/
├── types/
│   └── dealMemo.ts          ← All TypeScript interfaces
├── store/
│   └── dealMemoStore.ts     ← Zustand store with all actions
├── data/
│   ├── territoryRules.ts    ← Territory rules data (see prototype HTML for full dataset)
│   ├── deptRoles.ts         ← Department / role / union mapping
│   └── allowances.ts        ← Default allowances per agreement/territory
├── lib/
│   └── index.ts             ← nominalCoding, compliance, allowance helpers
├── components/
│   ├── DealMemoWizard.tsx   ← Main shell (layout, nav, step footer, right panel)
│   ├── StepNav.tsx          ← Left nav step item (implement as small component)
│   ├── SummaryPanel.tsx     ← Right panel: Summary / Timecard / Cost Est. tabs
│   ├── ProductionSettingsDrawer.tsx ← Slide-in production defaults editor
│   └── steps/
│       ├── Step1TerritoryUnion.tsx  ← Entity · Dept/Role · Territory · Agreement
│       ├── Step2CrewDetails.tsx     ← Identity + territory-aware employment status
│       ├── Step3DealStructure.tsx   ← Deal type, dates, guarantees, AI import
│       ├── Step4Rates.tsx           ← Currency, rates, HP treatment, OT table
│       ├── Step5Allowances.tsx      ← Expandable allowance rows with cap editor
│       ├── Step6NominalCoding.tsx   ← Auto-synced nominal lines + tax credit
│       ├── Step7Compliance.tsx      ← Dynamic compliance cards + onboarding list
│       ├── Step8AdditionalDocs.tsx  ← Contract + NDA + signing envelope
│       ├── Step9PayrollStartForm.tsx ← Bureau export: PDF / CSV / JSON
│       └── Step10PreviewIssue.tsx   ← Formatted memo preview + DocuSign issue
```

---

## Step-by-step implementation notes

### Step 1 — Contracting Entity · Department/Role · Territory · Agreement

**Ordering is intentional and important:**
1. Entity first — sets default territory and currency, determines which agreements are available
2. Department/Role — drives union suggestions before agreement is selected
3. Territory — loads the correct union panel
4. Agreement — loads the full rule dataset

**Entity selection** auto-cascades: selecting "Gilded Hour Films LLC" (US entity) should auto-click the US territory card and set currency to USD.

**Department suggestions** highlight matching union cards with a gold "Suggested" badge and show a contextual hint banner. The `DEPT_UNION_MAP` data covers all 17 departments across UK, US, CA, AU territories.

**Non-union / custom deal flow:**
- Selecting a `*-NU` union key triggers `enterCustomMode()`
- The loaded agreement rules panel is hidden; a custom editable panel replaces it
- The custom panel pre-fills from `PROD_SETTINGS` (production defaults)
- "Apply to this deal →" pushes custom values into Step 4's OT table as editable inputs
- The Production Default Rules drawer (⚙ button in nav footer) is the admin interface for setting production-level defaults

**Rule data structure:** The full `TERRITORY_RULES` dataset (40+ fields per agreement, 15+ agreements) is in the prototype HTML `<script>` block. Extract it and type it with `TerritoryRule` from `types/dealMemo.ts`.

---

### Step 2 — Crew Details

**Two-tier field ownership:**
- Fields with `[PRODUCTION]` badge: pre-filled by coordinator
- Fields with `[CREW]` badge: sent to crew portal as empty, filled in by crew member

**Territory-aware employment status panels:**
- `UK/IE` → PAYE Employee / Ltd Company (IR35) / Sole Trader
  - PAYE: NI Number, Tax Code, Starter Declaration, P45, Bank Details
  - Ltd: Company name, Company Reg (Companies House), IR35 determination
  - Sole: UTR number, Public Liability Insurance confirmation
- `US` → W-2 Employee / Loan-out Corp / 1099 (with risk warning)
  - W-2: SSN, W-4 filing status, state withholding, I-9, union card, ACH
  - Loan-out: Corp name, EIN, loan-out agreement reference
  - 1099: Risk warning displayed — misclassification liability note
- `CA` → T4 Employee / Incorporated / Self-Employed
  - T4: SIN, province, TD1 forms, transit/institution/account
- `AU` → PAYG Employee / Pty Ltd / ABN Sole Trader
  - PAYG: TFN, Superannuation fund + member number, BSB + account
- Everything else → Generic international panel (Tax ID, Work Auth, IBAN/SWIFT)

---

### Step 3 — Deal Structure

**AI Contract Import:**
- Upload zone → POST to `/api/deal-memos/parse-contract` (or edge function)
- Returns extracted fields with confidence scores (0–100)
- Fields at `> 85%` confidence are pre-ticked for "Apply All"
- Fields at `< 60%` confidence shown in orange, require manual confirm
- Applied fields populate Step 3–5 automatically

**Deal types:**
- `daily` / `weekly` / `hourly` — straightforward
- `flat` — total engagement amount, no weekly calculation
- `picture` — run-of-schedule, fixed total
- `step` — WGA-style step deal structure (multiple delivery points)
- `pop` — Pay or Play: payment guaranteed regardless of whether production proceeds

---

### Step 4 — Rates & Compensation

**Currency auto-set:**
- Territory change → `setCurrencyForTerritory(territory)` → updates `f-currency` select
- Entity change → same, from entity's `defaultCurrency`
- Currency symbol propagates to: rate input prefix, OT table calculated rates, HP note, cost estimate

**OT table — two modes:**

*Agreement mode:* All cells are display-only spans. Calculated from `rateAmount / basicHrs × multiplier`. The ✎ button opens an inline override prompt. Override is audit-logged.

*Custom mode:* Rate cells are `<input>` elements. Description and trigger cells are also editable. All changes are per-deal only — "Edit Production Template" opens the drawer to change defaults.

**HP Treatment (UK/IE only):**
- `excl` → HP is additional: `hpAmount = basicRate × 0.1207`. Posts to 2302 separately.
- `incl` → HP is embedded: `basicRate = quotedRate / 1.1207`. Crew receives exactly quoted rate.
- HP card is hidden for non-UK/IE territories.

**Rate comparison bar:**
- Hidden for custom deals (no union minimum to compare against)
- Minimum rate is role-dependent — needs lookup by `role + unionKey` from a minimums database
- For the prototype, a fixed £440/day is used as demo data

---

### Step 5 — Allowances & Rentals

**Allowance caps model:**
Each `Allowance` has a `caps` object controlling:
- Frequency (daily/weekly/per-engagement)
- Weekly cap or daily cap / max days per week
- Minimum days for full rate (pro-rating)
- Day exclusions (Sundays, Saturdays)
- Travel day / prep day payability

**Auto-sync to Step 6:** Adding/removing/editing allowances in Step 5 immediately updates:
- The `nom-allow-tbody` table in Step 6
- The `psf-allow-tbody` table in Step 9
- The right panel allowances section and cost estimate

The `syncNominalCoding()` function in the store (`updateAllowance`, `addAllowance`, `removeAllowance`) handles this via `buildNominalLines()`.

---

### Step 6 — Nominal Coding

**Auto-generated lines:**
- Core lines (Basic Labour, OT, Employer On-costs) always present
- Allowance lines: one per active allowance from Step 5
- Fringe lines (H&W, Pension): appear for US/CA union agreements with `rfHw` or `rfPension` data

**Tax credit tagging** flows automatically into every cost report line — sets `HETVC`, `FTC`, or other scheme on every nominal entry generated from this deal memo.

---

### Step 7 — Compliance & Onboarding

**Fully dynamic:** `buildComplianceCards()` and `buildChecklist()` are called on every territory/union change. They derive from the `COMPLIANCE_DATA` object (keyed by `getComplianceKey(territory, unionKey)`).

**Compliance card statuses:** `ok` (green) / `pending` (amber) / `warn` (amber) / `required` (gold) / `tracking` (blue) / `review` (grey). These are display-only in the prototype — a real implementation would compute them from actual crew submission state.

---

### Step 8 — Additional Documents

**Document model:**
- `isProductionContract: true` → auto-filled template, always first in envelope
- `requiresSignature: true` → sent as a signing tab in DocuSign/HelloSign
- `requiresSignature: false` → sent as read-only attachment

**Signing envelope:** Produced on issue. All documents delivered as a single DocuSign envelope. Crew signs once and all documents complete simultaneously.

**Production templates** (NDA, H&B policy, H&S policy, CoC, GDPR notice) are configured in `ProductionSettings.standardSigningDocuments` and pre-populated here.

---

### Step 9 — Payroll Start Form

**Purpose:** A structured extract of all crew data needed by an external payroll bureau (Sargent-Disc, Cast & Crew, Entertainment Partners, etc.) to create a new employee record. Must be exportable as:
- PDF — formatted bureau-ready document
- CSV — bureau-specific intake format (each bureau has its own column layout)
- JSON — API integration with bureau systems

**Outstanding field flagging:** `getOutstandingFields()` in the store returns a list of field names pending crew completion. The export warns if outstanding fields exist.

---

### Step 10 — Preview & Issue

**Formatted deal memo preview** uses `DM Serif Display` for the document heading, `DM Mono` for reference numbers and amounts. Crew-to-complete fields are shown in amber as `[Crew to complete]`.

**Issue action:**
```
POST /api/deal-memos
→ Server generates reference (GH2-DM-2026-XXXX)
→ Creates DB record (status: 'issued')
→ Triggers DocuSign envelope send
→ Creates crew portal invite (email with self-completion link)
→ Activates timecard template for this crew member
→ Creates cost report lines (2302, 2340, 2350, 2360, 2399)
→ Sends HOD notification
→ Starts onboarding checklist workflow
```

---

## Prisma Schema additions required

```prisma
model DealMemo {
  id                  String   @id @default(cuid())
  reference           String   @unique  // GH2-DM-2026-0047
  productionId        String
  contractingEntityId String
  crewMemberId        String?
  territory           String   // TerritoryKey
  unionKey            String   // UnionKey
  isCustomDeal        Boolean  @default(false)
  department          String
  role                String
  screenCredit        String?
  dealType            String   // DealType
  startDate           DateTime
  endDate             DateTime?
  currency            String   // CurrencyCode
  rateBasis           String
  rateAmount          Decimal
  hpMode              String   // 'excl' | 'incl' | 'na'
  status              String   // 'draft' | 'issued' | 'signed' | 'active'
  issuedAt            DateTime?
  docuSignEnvelopeId  String?
  createdBy           String
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  production          Production    @relation(fields: [productionId], references: [id])
  allowances          DealAllowance[]
  nominalLines        DealNominalLine[]
  checklistItems      DealChecklistItem[]
  signingDocuments    DealSigningDocument[]
  payrollStartForm    PayrollStartForm?

  @@index([productionId, status])
  @@index([crewMemberId])
}

model DealAllowance {
  id              String  @id @default(cuid())
  dealMemoId      String
  name            String
  amount          Decimal
  taxTreatment    String
  nominalCode     String
  frequency       String
  weeklyCap       Decimal?
  maxDaysPerWeek  Int?
  excludeSundays  Boolean @default(false)
  dealMemo        DealMemo @relation(fields: [dealMemoId], references: [id], onDelete: Cascade)
}

model DealNominalLine {
  id            String  @id @default(cuid())
  dealMemoId    String
  lineKey       String
  label         String
  nominalCode   String
  costCentre    String
  episode       String  @default("All Episodes")
  isCore        Boolean @default(false)
  isFringe      Boolean @default(false)
  dealMemo      DealMemo @relation(fields: [dealMemoId], references: [id], onDelete: Cascade)
}

model DealChecklistItem {
  id             String  @id @default(cuid())
  dealMemoId     String
  itemKey        String
  name           String
  responsibility String
  isChecked      Boolean @default(false)
  isRequired     Boolean @default(true)
  checkedAt      DateTime?
  checkedBy      String?
  dealMemo       DealMemo @relation(fields: [dealMemoId], references: [id], onDelete: Cascade)
}

model PayrollStartForm {
  id                  String  @id @default(cuid())
  dealMemoId          String  @unique
  bureau              String
  productionReference String
  payFrequency        String
  isComplete          Boolean @default(false)
  outstandingFields   String[] // JSON array of field names
  exportedAt          DateTime?
  exportedBy          String?
  dealMemo            DealMemo @relation(fields: [dealMemoId], references: [id])
}
```

---

## API Routes (Next.js App Router)

```
POST   /api/deal-memos                          create + issue
GET    /api/deal-memos/:id                      fetch by ID
PATCH  /api/deal-memos/:id                      update draft
POST   /api/deal-memos/:id/issue                issue (triggers DocuSign etc.)
POST   /api/deal-memos/parse-contract           AI contract import
GET    /api/deal-memos/:id/payroll-start-form   export PSF data
POST   /api/productions/:id/settings            update production defaults
```

---

## Design system tokens (relevant to this module)

```css
--bg:       #0b0c10   /* page background */
--bg-s:     #0f1117   /* card / panel surface */
--bg-h:     #161820   /* hover / input background */
--b:        #1e2030   /* border */
--bm:       #2a2d3e   /* border medium / focus */
--t1:       #f1f5f9   /* primary text */
--t2:       #9ca3af   /* secondary text */
--t3:       #6b7280   /* tertiary text */
--t4:       #3d4257   /* label / eyebrow text */
--gold:     #e8b84b   /* brand accent */
--gold-d:   rgba(232,184,75,.35)
--gold-g:   rgba(232,184,75,.07)
--green:    #4ade80
--orange:   #fb923c
--red:      #f87171
--blue:     #60a5fa
--teal:     #2dd4bf
--purple:   #c084fc

/* Fonts */
font-family: 'Syne', sans-serif       /* headings, nav items, amounts */
font-family: 'DM Sans', sans-serif    /* body, labels, inputs */
font-family: 'DM Mono', monospace     /* codes, amounts, eyebrows, rates */
font-family: 'DM Serif Display', serif /* deal memo document preview only */
```

---

## Dependencies to install

```bash
npm install zustand @tanstack/react-query
npm install uuid
npm install @types/uuid -D
# DocuSign integration (choose one)
npm install docusign-esign
# Or use HelloSign / Adobe Sign SDK
```

---

## Notes for developers

- The **right panel** (Summary / Timecard / Cost Estimate) must react to every change in the wizard. Wire it to `updateRightPanel()` which is called at the end of `recalcRates()`, `setUnion()`, `setTerritory()`, `addAllowance()`, `updateAllowance()`, `removeAllowance()`, and `setHPMode()`.

- The **Production Settings drawer** is a slide-in panel (not a modal) — it should overlay the right panel only, not the full wizard. Use `position: fixed; right: 0; top: 52px; bottom: 0; width: 480px; z-index: 201`.

- **Role-gating:** Delegates (crew members completing their own timecards) cannot see pay rates or allowance amounts. This is controlled via the `delegateCannotSeeAmounts` flag. The deal memo wizard itself is PA/accountant-only — role gate at the route level.

- **Auto-save:** The store is wrapped in Zustand `persist()` middleware for draft auto-save. In production, debounce PATCH calls to `/api/deal-memos/:id` with a 2s delay on any store change.

- **Crew Portal integration:** On issue, a separate `CrewPortal` invite is sent. The portal only shows fields with `responsibility: 'CREW UPLOADS'` — NI number, bank details, DOB, address, emergency contact. These are never editable by production staff.

- See the **shareable HTML prototype** (`zillit-coda-deal-memo-v7-review.html`) for the full interactive reference. All 10 steps, full rules data, compliance cards, and production settings are implemented in the HTML prototype.
