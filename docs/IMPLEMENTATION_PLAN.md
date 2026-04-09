# Final Implementation Plan — All R&D Complete

## All Questions Resolved

| Question | Answer | Impact |
|----------|--------|--------|
| Meal break input | M1 Out/In + M2 Out/In on timecard, from production report | Add 4 meal fields to day row |
| Second meal trigger | >5hrs after M1 end (Film) / 6hrs (TV Drama), auto-show M2 | M2 fields optional, auto-appear |
| Turnaround measurement | From individual **Release** time (not unit wrap) | Our 4th field (Release) is correct |
| Partial days | No partial rate — full daily rate or nothing (UK) | No partial day calculator needed |
| Payslip | Don't generate. Build **Hot Cost** estimate instead | New "Hot Cost" view per crew |
| Ltd company timecard | Lightweight day log (not full timecard, IR35 risk) | New "Ltd Day Log" component |
| Day type | User fills it in (confirmed by client) | Keep dropdown, user selects |
| Receipt upload | Not needed for now (confirmed by client) | Skip receipt feature |

---

## Sprint 1: Wire Calculator + Meal Breaks (Payroll Accuracy)

### 1A. Wire timecardCalculator into payrollEngine
**File:** `server/src/services/payrollEngine.js`
- Import `calculateDay` and `calculateWeek` from `timecardCalculator.js`
- Replace old `calculateDayHours()` calls with new `calculateDay()` 
- All rates flow from deal memo — BTA, pre-call/wrap OT, meal escalation, night premium

### 1B. Add Meal Break Fields to Timecard UI
**File:** `client/src/components/timecard/TimecardShell.jsx` (DayRowNew)
- Add to expanded view Times card: M1 Out, M1 In, M2 Out, M2 In
- M2 fields hidden by default, auto-show when elapsed time from M1 In > 5hrs
- Meal penalty auto-calculates: if M1 Out - Crew Call > mealPenaltyAfterHrs (from deal memo)
- CWD exempt from meal penalty (already in calculator)
- US NDM flag: `mealDeductible` from deal memo (UK=true/deductible, US=false/NDM)

### 1C. Night Shoot Handling
- Day "belongs to" date of crew call (universal)
- If release < crew call → overnight detected, add 1440 mins (already in calculator)
- Night premium: flat amount or percentage from deal memo

---

## Sprint 2: Backend Endpoints (Make Pages Work)

### 2A. PayrollGrid API
**New endpoint:** `GET /api/payroll/production/:productionId/grid`
- Fetch all timecards for production + week
- Join with deal memos for rates
- Return crew list with per-person pay breakdown
- Rate privacy: only production_accountant/payroll_admin see all

### 2B. Completer API  
**New endpoint:** `GET /api/timecards/completer/:deptId`
- Fetch dept crew timecards
- **Strip rate/pay from non-self entries server-side** (not UI-side)
- Return hours breakdown only for other crew

### 2C. CrewPayHistory API
**New route file:** `server/src/routes/portalRoutes.js`
- `GET /api/portal/:crewId/production/:productionId` — crew info, phases, weeks, pay breakdown
- Only accessible by crew member themselves or admin

### 2D. Sidebar Navigation
- Add PayrollGrid link under Payroll
- Add Completer link under Timecards (dept_head role only)
- Remove Crew Portal → replaced by pay history link in deal memo detail

### 2E. Hot Cost View (instead of payslip)
**New component:** Per-crew daily cost estimate card
- Shows: basic, OT breakdown, penalties, premiums, allowances, estimated gross
- Compares estimated vs budgeted daily cost
- Label: "Cost Estimate" — NOT "payslip"
- Accessible from PayrollGrid detail panel

---

## Sprint 3: Timecard Features (Kate's Spec)

### 3A. Amend Modal
- Click locked field (Unit Call / Unit Wrap) → AmendModal
- Fields: new time, original (read-only), mandatory reason textarea
- On save: update field, log in auditLog[], source = 'amend'
- Endpoint: `POST /api/timecards/:id/amend` — { dayIndex, field, newValue, reason }

### 3B. Allowance Modal
- 4 types: Per Diem 🍽️, Mileage 🚗, Meal Buyout 🧾, Kit Rental 🎒
- Lock notice: "OT is system-calculated"
- Dynamic fields per type (day select, amount, quantity, notes)
- Per diem at HMRC/IRS scale rate = no receipt needed
- Mileage: miles input, auto-calculate at HMRC/IRS rate

### 3C. Source Badges
- Each time field shows colored badge: GPS/CS/BP/Manual/Override/Locked
- Default = 'manual', GPS auto-fill = 'gps', production-set = 'locked'

### 3D. Audit Log Viewer
- In expanded day detail: chronological activity log
- Each entry: timestamp, source, description
- Amendments highlighted in yellow with reason

### 3E. Day-Level Approval
- "Approve" button per day (visible to dept_head/admin)
- Marks dayApproved = true
- All days must be approved before weekly submission

### 3F. Submit Modal
- Pre-submit summary: days worked, total hours, OT, estimated gross
- Confirmation checkbox
- Cancel + Submit buttons

---

## Sprint 4: GPS + Assignment + Disputes

### 4A. GPS Punch In/Out
**New model:** `PunchLog` — crewId, productionId, type (in/out), timestamp, location
**New endpoints:** `POST /api/punch/in`, `POST /api/punch/out`, `GET /api/punch/today`
**New page:** Mobile-friendly punch page with big Punch In / Punch Out button
- When GPS auto-fill preference ON: crewCall = first punch-in, release = last punch-out
- Source badge = 'gps'

### 4B. Assignment Delegation
- New fields on Timecard: `assignedTo`, `assignmentScope`
- Assignee can edit: times, day types, notes, allowances
- Assignee CANNOT see: rates, pay, OT amounts, gross
- Assignee CANNOT: submit or approve
- API: strip pay fields when req.user._id !== timecard.ownerId
- AssignmentModal: select crew + scope (all weeks / this week / custom)

### 4C. Dispute Ticket CRUD
**Controller + Routes:** Create, list, update, add comment
**Endpoints:** `POST /api/disputes`, `GET /api/disputes`, `PATCH /api/disputes/:id`
**UI:** DisputeModal in CrewPayHistory — select week, type, description
**Types:** incorrect_time, missing_overtime, wrong_day_type, allowance_missing, rate_incorrect, payment_missing, other

### 4D. Travel Day Handling
- dayType === 'TRVL': basicPay = dealMemo.travelRate (if separate rates) or dailyRate * 0.5
- No OT on travel days
- No meal penalty on travel days  
- Allowances still apply
- BECTU: travel days neutral for consecutive counting

---

## Sprint 5: Lt Company + Deal Memo Completeness

### 5A. Ltd Company Day Log
**New component:** Lightweight day log (NOT a full timecard — IR35 risk)
- Fields: date, worked (yes/no), UK location (yes/no), notes
- Linked to Purchase Order (not deal memo)
- For AVEC/HETVC: track UK vs overseas days
- Invoice cross-reference against day log for approval

### 5B. Payment File Export Endpoint
**New endpoint:** `POST /api/payroll/:id/export-payment`
- Territory-driven: UK→BACS, US→ACH, AU→ABA, EU→SEPA
- Pre-submission validation checklist
- Returns file as download
- `paymentFileGenerator.js` already built — just needs endpoint

### 5C. Deal Memo Remaining Fields UI
Add to Deal & Rates step:
- BTA enabled toggle + BTA rate
- Night premium flat amount
- Contracted hours per day type (SWD/CWD/SCWD)
- Camera dept flag (affects 2T vs 1.5T)
- OT multiplier override
- Golden time toggle + multiplier
- Meal penalty escalation amounts array
- Meal deductible flag (UK=yes, US=no/NDM)
- Workers comp %
- H&W per hour (US)

### 5D. Timecard UI Polish
- Fix cramped spacing in TimecardShell
- Proper responsive layout
- Better typography and visual hierarchy
- Smooth animations on expand/collapse
- Week summary cards with proper sizing

---

## Execution Timeline

```
Sprint 1 (Calculator + Meals) ──→ Payroll accuracy fixed
Sprint 2 (Backend APIs) ────────→ All pages functional  
Sprint 3 (Timecard Features) ───→ Kate's spec complete
Sprint 4 (GPS + Workflows) ────→ Full feature set
Sprint 5 (Ltd + Polish) ───────→ Production ready
```

## No More Open Questions
All R&D complete. All questions answered. Ready to build.
