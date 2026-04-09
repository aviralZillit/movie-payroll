# Movie Payroll — Complete Requirements Audit

## Status: What's Built vs What's Missing

### Legend
- ✅ Built & Working
- ⚠️ Built but Not Wired (frontend exists, no backend)
- 🔴 Not Built

---

## 1. DEAL MEMO

### ✅ Working
- 9-step wizard (Entity → Crew → Deal & Rates → RTW → Allowances → Codes → Docs → Payroll → Issue)
- Employment type drives form fields (PAYE/Ltd/Sole Trader/W-2/Loan-out/1099)
- Cascading auto-fill (territory → employment → deal type → rate type)
- Rate compliance check with progress bar
- OT Rate Cap display from territory rule
- Fringes section (shows/hides based on employment type)
- Allowances with v2 array + cap settings
- Per-deal crew required fields
- Payroll responsibility assignment table
- Counter-signature flow
- Approval chain

### 🔴 Missing from Deal Memo UI
- BTA rate/enabled toggle (field exists in model, no UI)
- Night premium flat amount input (field exists, no UI)
- Contracted hours per day type editor (SWD/CWD/SCWD)
- Camera dept flag toggle (affects 2T vs 1.5T OT)
- OT multiplier override
- Golden time toggle + multiplier + after hours
- OT tiers custom editor
- Workers comp % input
- H&W per hour input (US/IATSE)
- Vacation/holiday % input (US)
- Meal penalty escalation amounts editor (e.g., $25/$35/$50)
- Meal paid status (paid/unpaid/non-deductible)
- Working day type selector (SWD/CWD/SCWD as default)
- Allowance visibility toggle (crew can/can't see amounts)
- Bonus assignment UI
- Tax credit scheme selector (HETVC, Section 481, etc.)

---

## 2. TIMECARD

### ✅ Working
- TimecardShell layout with aside panel
- 4 time fields (Crew Call, Unit Call, Unit Wrap, Release)
- Day type selector (SWD/CWD/SCWD/Shoot/Prep/Wrap/RIG/TRVL/HOL/SICK/OFF)
- Week summary strip (7 metric cards)
- Pay estimate in aside panel
- Preferences toggles (GPS auto-fill, Override alerts, Show pay, Kit auto-apply)
- Source key legend
- Expandable day rows with 3-card detail (Times, OT Breakdown, Allowances)
- Save/Calculate/AI Fill/Submit footer

### 🔴 Missing from Timecard
- **Meal break inputs** — lunchStart/lunchEnd/secondMealStart/secondMealEnd not in UI
- **Source badges** on each time field (GPS/CS/BP/Manual/Override/Locked)
- **Amend modal** — click locked field → enter reason → audit logged
- **Allowance modal** — 4 types (per diem/mileage/meal buyout/kit rental) with dynamic fields
- **Submit modal** — pre-submit summary with confirmation
- **Audit log viewer** — per-day field change history
- **Day-level approval** — approve individual days
- **Amendment tracking** — reason field, amended by/at
- **Night shoot indicator** — visual badge when wrap past midnight
- **Turnaround display** — hours between days with violation warning
- **6th/7th day badges** — auto-detect from consecutive days
- **Production calendar integration** — auto-fill day types from production schedule
- **Week-over-week turnaround** — check last day of previous week
- **Travel day rate handling** — different rate for travel days
- **Minimum call rule** — 8hr minimum for IATSE, not defined for UK
- **Split day handling** — night shoots crossing midnight

### 🔴 Timecard Calculator NOT Wired
- `timecardCalculator.js` (new, universal, deal-memo-driven) exists but is NOT called
- `payrollEngine.js` still uses old `overtimeCalculator.js`
- Old calculator doesn't have: BTA, pre-call/wrap OT split, meal delay escalation, night premium flat

---

## 3. PAYROLL

### ✅ Working
- Payroll runs list with summary cards
- PayrollDetail with expandable crew rows
- GrossToNetBreakdown with employer on-costs
- Territory fringe calculator (employment type aware)
- Buyout/flat deal logic in payroll engine
- Taxable vs non-taxable allowance split

### ⚠️ Built but No Backend
- **PayrollGrid page** — frontend exists, API endpoint missing (`GET /payroll/production/:id/grid`)
- **Payment file generation** — `paymentFileGenerator.js` service exists, no endpoint to call it

### 🔴 Missing from Payroll
- New timecardCalculator not integrated into payroll engine
- No production-wide payroll grid API endpoint
- No BACS/ACH/SEPA export endpoint
- No payslip PDF generation
- No budget vs actual comparison
- No cost report generation
- No HETVC tracking in payroll output

---

## 4. COMPLETER VIEW

### ⚠️ Built but No Backend
- `Completer.jsx` page exists with full UI
- **No API endpoint** — `GET /timecards/completer/:deptId` not registered
- **No rate privacy logic** server-side (strip rate/pay from non-self entries)
- **Not in sidebar navigation**

---

## 5. CREW PAY HISTORY

### ⚠️ Built but No Backend
- `CrewPayHistory.jsx` page exists with hero card, phase timeline, week cards, pay breakdown
- **No API route file** — `/api/portal` doesn't exist at all
- **No endpoint** for `GET /portal/:crewId/production/:productionId`
- **Not in sidebar navigation**

---

## 6. DISPUTES

### 🔴 Not Built (Model Only)
- `DisputeTicket.js` model exists
- **No controller** — no CRUD operations
- **No routes** — no API endpoints
- **No UI** — CrewPayHistory has "Raise Dispute" button but it does nothing

---

## 7. APPROVAL WORKFLOW

### ⚠️ Partially Built
- Deal memo has `approvalStatus[]` array and `currentApprovalStep`
- `approveDealMemo` endpoint exists
- `countersignDealMemo` endpoint exists
- DealMemoDetail shows approval timeline
- **Missing:** No UI to configure approval chain per production
- **Missing:** Timecard approval chain not using production settings

---

## 8. NAVIGATION

### 🔴 Missing from Sidebar
- PayrollGrid (accessible only via URL)
- Completer (accessible only via URL)
- CrewPayHistory (accessible only via URL)
- Crew Portal still listed but should be removed (merged into DealMemoDetail)

---

## 9. DATA & SEEDING

### ✅ Complete
- 19 unions across 6 territories (UK, US, AU, DE, FR, ES)
- 480+ designations with rate cards
- Rate Bible with 19 agreements
- Budget tiers for all territories
- Productions with contracting entities
- Employment type rules (server + client)
- Cascading defaults per territory

---

## 10. KATE'S SPEC FEATURES — STATUS

| Feature | Kate's Screen | Status |
|---------|--------------|--------|
| Crew Weekly Timesheet | Screen 1 | ⚠️ Layout built, meal/amend/allowance modals missing |
| IATSE Completer | Screen 2 | ⚠️ Page exists, no backend, no rate privacy |
| Production Payroll Grid | Screen 3 | ⚠️ Page exists, no backend |
| Payroll Grid v3 (3 views) | Screen 4 | ⚠️ View switcher built, no backend |
| Crew Pay History Portal | Screen 5 | ⚠️ Page exists, no backend |
| GPS Auto-fill | Screen 1 | 🔴 Toggle exists, no GPS integration |
| Source Badges | Screen 1 | 🔴 Component built, not displayed on time fields |
| Audit Logging | Screen 1 | 🔴 Schema exists, no UI viewer |
| BACS Standard 18 | Screen 3 | ⚠️ Generator exists, no endpoint |
| HETVC Tagging | Screen 3 | 🔴 Field exists, not tracked |
| Dispute Workflow | Screen 5 | 🔴 Model exists, no CRUD/UI |
| Assignment Delegation | Screen 1 | 🔴 Not built |

---

## PRIORITY ORDER FOR COMPLETION

### P0 — Critical (Payroll accuracy)
1. Wire timecardCalculator into payroll engine
2. Add meal break inputs to timecard UI
3. Backend endpoints for PayrollGrid, Completer, CrewPayHistory
4. Fix OT calculations (BTA, night premium flat, meal escalation)

### P1 — High (User workflow)
5. Amend modal for locked fields
6. Allowance modal (4 types)
7. Day-level approval
8. Sidebar navigation for new pages
9. Dispute ticket CRUD + endpoints
10. Payment file export endpoint

### P2 — Medium (Completeness)
11. Source badges on time fields
12. Audit log viewer
13. Submit modal with summary
14. Deal memo: BTA/golden time/OT tiers UI
15. Rate privacy for completer (server-side)
16. Production calendar integration

### P3 — Nice to have
17. GPS integration
18. Payslip PDF generation
19. Budget vs actual comparison
20. Cost report generation
21. HETVC tracking
22. Assignment delegation
