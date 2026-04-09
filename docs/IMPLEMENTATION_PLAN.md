# Implementation Plan — Remaining Work

## What We Know (can build now)

### A. Wire New Calculator into Payroll Engine
**Status:** timecardCalculator.js exists but payrollEngine.js still uses old overtimeCalculator.js
**Action:**
- Replace old calculator calls in payrollEngine.js with new calculateDay/calculateWeek
- All rates read from deal memo — no hardcoding
- BTA, pre-call/wrap OT split, meal delay escalation, night premium flat all flow through
- Test: same timecard data produces correct pay with new calculator

### B. Meal Break Inputs in Timecard UI
**Status:** Model has lunchStart/lunchEnd/secondMealStart/secondMealEnd. UI doesn't show them.
**Action:**
- Add meal break fields to expanded day detail (Times card)
- M1 Out / M1 In + M2 Out / M2 In (4 fields)
- Meal penalty auto-calculates when M1 Out - Crew Call > meal window (from deal memo)
- Show meal delay alert notice in expanded view
- CWD days exempt from meal delay penalty

### C. GPS Punch In/Out
**Status:** Toggle exists in preferences, no backend
**Action:**
- New model: `PunchLog` — { crewId, productionId, type: 'in'|'out', timestamp, location: { lat, lng }, accuracy }
- New endpoints: `POST /api/punch/in`, `POST /api/punch/out`, `GET /api/punch/today`
- Mobile-friendly punch page: big "Punch In" / "Punch Out" button with current time display
- When GPS auto-fill is ON, timecard auto-populates crewCall from first punch-in, release from last punch-out
- Source badge shows "GPS" on auto-filled fields
- Location captured but not enforced (no geofencing for now)

### D. Night Shoot / Split Day Handling
**Status:** Need R&D per union
**Action (universal approach):**
- If release time < crew call time → overnight detected
- Add 1440 minutes to release for calculation (already in timecardCalculator)
- The day "belongs to" the date of crew call (not the date of release)
- For consecutive day counting: a night shoot on Friday (call 18:00, release Sat 04:00) counts as Friday's work day
- Turnaround: Friday release 04:00 → Saturday call 07:00 = 3 hours turnaround → BTA triggered

### E. Assignment Delegation
**Status:** Kate's spec shows it, not built
**Action:**
- New fields on Timecard: `assignedTo: ObjectId`, `assignmentScope: 'all_weeks'|'this_week'|'custom'`
- Assignee can edit: times, day types, notes, allowances
- Assignee CANNOT see: rates, pay amounts, OT pay, gross, deal memo rates
- Assignee CANNOT: submit or approve — only the crew member can submit
- API: strip all pay fields from response when `req.user._id !== timecard.ownerId`
- UI: AssignmentModal — select crew member + scope dropdown

### F. Travel Day Rate from Deal Memo
**Status:** Confirmed — travel rate comes from deal memo separateRates.travelRate
**Action:**
- When dayType === 'TRVL' or 'Travel':
  - Basic pay = dealMemo.travelRate (if separate rates enabled) or dealMemo.dailyRate * 0.5 (half day default)
  - No OT on travel days
  - No meal penalty on travel days
  - Allowances still apply (per diem especially)

### G. Backend Endpoints for New Pages
**Status:** 3 frontend pages with no backend

**PayrollGrid endpoint:**
- `GET /api/payroll/production/:productionId/grid?week=:weekId&view=weekly|daily|wtd`
- Fetches all timecards for production + week, joins with deal memos
- Returns: crew list with per-person pay breakdown, department grouping, flags
- Rate privacy: only production_accountant / payroll_admin can see all rates

**Completer endpoint:**
- `GET /api/timecards/completer/:deptId?week=:weekId`
- Fetches all timecards for dept crew for the week
- Rate privacy: strip rate/pay from non-self entries server-side
- Returns: crew list with time data, hours breakdown (no pay for others)

**CrewPayHistory endpoint:**
- `GET /api/portal/:crewId/production/:productionId`
- Fetches: crew info, production phases, all weeks with pay breakdown
- Payment status per week (paid/approved/submitted/draft)
- Only accessible by the crew member themselves or admins

### H. Dispute Ticket CRUD
**Status:** Model exists, no controller/routes
**Action:**
- Controller: create, getAll, getById, update, addComment
- Routes: `POST /api/disputes`, `GET /api/disputes?crewId=&productionId=`, `PATCH /api/disputes/:id`
- UI: DisputeModal in CrewPayHistory — select week, type (dropdown), description
- Notification: email/toast when dispute is created, resolved

### I. Payment File Export
**Status:** Generator service exists, no endpoint
**Action:**
- `POST /api/payroll/:id/export-payment` — generates payment file based on production territory
- UK → BACS Standard 18
- US → NACHA/ACH
- AU → ABA Direct Entry
- EU → SEPA XML
- Returns file as download
- Pre-submission checklist validation (all amounts verified, all bank details present)

### J. Sidebar Navigation Updates
**Status:** 3 pages not accessible from nav
**Action:**
- Add "Payroll Grid" under Payroll section (links to production selector → grid)
- Add "Completer" under Timecards section (visible to dept_head/completer roles only)
- Remove "Crew Portal" — replaced by CrewPayHistory (accessible from deal memo detail)
- CrewPayHistory accessible from: deal memo detail page, timecard detail, and direct URL

### K. Amend Modal for Locked Fields
**Status:** Not built
**Action:**
- When crew clicks Unit Call or Unit Wrap (locked fields) → AmendModal opens
- Fields: New time (HH:MM), Original (read-only), Reason (required textarea)
- On save: updates the field, logs amendment in auditLog[], changes source to 'amend'
- Toast: "Amendment saved. Your producer will see this change."
- Backend: `POST /api/timecards/:id/amend` — { dayIndex, field, newValue, reason }

### L. Allowance Modal
**Status:** Not built
**Action:**
- 4 allowance types: Per Diem 🍽️, Mileage 🚗, Meal Buyout 🧾, Kit Rental 🎒
- Lock notice: "OT is system-calculated, cannot be added here"
- Dynamic fields per type:
  - Per Diem: day select, rate (from deal memo), days count, total, notes
  - Mileage: day select, miles, rate per mile (£0.45 HMRC), return trip toggle, total, notes
  - Meal Buyout: day select, amount, notes
  - Kit Rental: day select, amount per day, days, description, total
- Saves to timecard.entries[dayIndex].allowances[] or weekly allowances
- Button: "Cancel" + "Add to Timecard"

### M. Source Badges on Time Fields
**Status:** Component exists, not displayed
**Action:**
- Each time input shows a small source badge next to it
- GPS (green), CS (blue), BP (teal), Manual (yellow), Override (orange), Locked (red)
- Default source = 'manual'
- When GPS auto-fill runs, source = 'gps'
- When production/AD sets Unit Call/Wrap, source = 'call_sheet' or 'locked'
- When crew amends, source = 'amend'

### N. Audit Log Viewer
**Status:** Schema exists on timecard model, no UI
**Action:**
- In expanded day detail, show "Activity Log" section
- Chronological entries: timestamp, author (GPS/AD/Call Sheet/You), description
- Amendments highlighted in yellow with reason
- Stored in timecard.auditLog[] array

### O. Day-Level Approval
**Status:** Fields exist in model, no UI
**Action:**
- Each day row has an "Approve" button (visible to dept_head/admin)
- Click → marks dayApproved = true, dayApprovedBy, dayApprovedAt
- Visual: green checkmark on approved days, grey circle on pending
- All days must be approved before weekly submission

---

## What We Need to Ask Kate (waiting for answers)
1. Meal break input mechanism for UK timecards
2. Second meal break handling in UK
3. Partial days and minimum call rule (UK/BECTU)
4. Turnaround across week boundaries (when payroll already processed)
5. Payslip generation (our template vs bureau-generated)
6. Ltd company timecard flow (invoice vs simplified timecard)
7. Receipt/evidence upload for allowances
8. Contracted hours — fixed per engagement or variable per day type?

---

## What Needs R&D
1. Night shoot handling per union (UK vs US vs AU etc.)
2. Minimum call rules per union
3. Production calendar → timecard day type auto-fill integration
4. Week-over-week consecutive day detection

---

## Execution Priority

### Sprint 1: Calculator + Meal Breaks (payroll accuracy)
- A. Wire timecardCalculator into payrollEngine
- B. Add meal break inputs to timecard UI
- D. Night shoot handling

### Sprint 2: Backend Endpoints (make pages work)
- G. PayrollGrid, Completer, CrewPayHistory endpoints
- J. Sidebar navigation
- I. Payment file export endpoint

### Sprint 3: Timecard Features (Kate's spec)
- K. Amend modal
- L. Allowance modal
- M. Source badges
- N. Audit log viewer
- O. Day-level approval

### Sprint 4: Workflows
- C. GPS punch in/out
- E. Assignment delegation
- H. Dispute ticket CRUD
- F. Travel day rate handling

### Sprint 5: Deal Memo Completeness
- Add remaining 15+ fields to deal memo UI
- BTA, golden time, OT tiers, meal escalation, etc.
