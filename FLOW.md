# Production Payroll — Complete Application Flow

**Live URL**: https://movie-payroll.onrender.com

---

## System Architecture

```
+------------------+     +------------------+     +------------------+
|                  |     |                  |     |                  |
|   React Frontend | --> |  Express API     | --> |    MongoDB       |
|   (Vite + shadcn)|     |  (Node.js)       |     |    (Remote)      |
|                  |     |                  |     |                  |
+------------------+     +------------------+     +------------------+
        |                        |
        |   JWT Auth             |   Union Rate Engine
        |   Role-Based Access    |   OT Calculator
        |                        |   Payroll Engine
        |                        |   Fringe Calculator
```

---

## Core Pipeline

```
  PRODUCTION          DEAL MEMO             TIMECARD              PAYROLL
  SETUP               (Contract)            (Weekly Hours)        (Pay Run)

 +----------+      +---------------+     +----------------+    +----------------+
 | Admin    |      | Select union  |     | Crew enters    |    | Admin pulls    |
 | creates  | ---> | dept, role,   | --> | daily call,    | -> | all approved   |
 | production|     | budget tier   |     | wrap, lunch    |    | timecards      |
 | + adds   |      |               |     | times          |    |                |
 | crew     |      | Rates auto-   |     |                |    | System calcs:  |
 +----------+      | populate from |     | System auto-   |    | gross, OT,     |
                   | union rate    |     | calculates:    |    | penalties,     |
                   | engine        |     | - straight hrs |    | fringes, tax   |
                   |               |     | - OT 1.5x/2x  |    | = net pay      |
                   | Producer can  |     | - meal penalty |    |                |
                   | edit above    |     | - turnaround   |    | Export CSV /   |
                   | minimum only  |     | - 6th/7th day  |    | payslip PDF    |
                   +---------------+     +-------+--------+    +----------------+
                                                 |
                                         +-------v--------+
                                         |   APPROVAL     |
                                         |                |
                                         | 1. Dept Head   |
                                         | 2. Payroll     |
                                         |    Admin       |
                                         +----------------+
```

---

## Demo Accounts

Password for all: `Demo123!`

### Admin & Management
| Email | Name | Role | Access |
|-------|------|------|--------|
| admin@prodpayroll.com | James Richardson | Super Admin | Full access |
| sarah@prodpayroll.com | Sarah Mitchell | Payroll Admin | Payroll, deals, timecards, admin rates |
| david@prodpayroll.com | David Chen | Prod. Accountant | Productions, deals, timecards, payroll |

### Department Heads
| Email | Name | Role | Access |
|-------|------|------|--------|
| emma@prodpayroll.com | Emma Thompson | HOD Camera | Productions, deals, dept timecards |
| michael@prodpayroll.com | Michael Brooks | HOD Sound | Same |
| rachel@prodpayroll.com | Rachel Kumar | HOD Art | Same |

### Crew Members
| Email | Name | Role | Union |
|-------|------|------|-------|
| tom@prodpayroll.com | Tom Harris | DOP | BECTU |
| lisa@prodpayroll.com | Lisa Patel | 1st AC | BECTU |
| jake@prodpayroll.com | Jake Morrison | Gaffer | BECTU |
| nina@prodpayroll.com | Nina Costa | Boom Operator | BECTU |
| kate@prodpayroll.com | Kate Ashford | Lead Actor | Equity |
| sam@prodpayroll.com | Sam O'Brien | Spark | BECTU |
| ben@prodpayroll.com | Ben Fletcher | Editor | BECTU |
| zara@prodpayroll.com | Zara Phillips | Runner | BECTU |

Crew see: Dashboard, My Deal Memos, My Timecards, Rate Cards

---

## Pre-loaded Demo Data

| Data | Count | Details |
|------|-------|---------|
| Productions | 3 | The Last Horizon (£35m), Nightfall Chronicles (£5m TV), Urban Echo (£8m) |
| Deal Memos | 9 | Active contracts across all 3 productions |
| Timecards | 6 | Week of 24-30 Mar 2025 with real hours and OT |
| Payroll Runs | 2 | 1 calculated (£15,715 gross), 1 paid |
| Rate Cards | 62 | Official BECTU, Equity, FAA, WGGB rates |
| UK Unions | 6 | BECTU, Equity, FAA, Directors UK, WGGB, MU |

---

## Flow 1: Create a Production

```
Admin logs in
    |
    v
Productions page --> [+ New Production]
    |
    v
Fill form:
  - Name: "The Last Horizon"
  - Type: Feature Film / TV Drama / Commercial / etc.
  - Budget: £35,000,000
  - Country: UK
  - Start Date: 2024-09-01
  - Company: Echo Films Ltd
    |
    v
Add crew members to production
    |
    v
Production created (status: Pre-Production)
```

---

## Flow 2: Create a Deal Memo (7-Step Wizard)

```
Deal Memos page --> [+ New Deal Memo]
    |
    v
+-------------------------------------------+
| STEP 1: Select Production                 |
|   [The Last Horizon     v]                |
+-------------------------------------------+
    |
    v
+-------------------------------------------+
| STEP 2: Union / Department / Role         |
|   Union:       [BECTU              v]     |
|   Department:  [Camera             v]     |
|   Designation: [Director of Photo. v]     |
|   Budget Tier: [MMP (£30m+)       v]     |
+-------------------------------------------+
    |
    v  (rates auto-populate from union rate card)
+-------------------------------------------+
| STEP 3: Rates                             |
|                                           |
|   Weekly Rate:  [£5,500.00] (i) source    |
|   Daily Rate:   [£1,100.00] (i) source    |
|   Hourly Rate:  [£100.00  ] (i) source    |
|                                           |
|   (i) = info icon showing official        |
|         source URL from BECTU             |
|                                           |
|   Green border = at/above union minimum   |
|   Yellow warning = below minimum          |
+-------------------------------------------+
    |
    v
+-------------------------------------------+
| STEP 4: Fringes                           |
|                                           |
|   Holiday Pay:    [12.07] %               |
|   Employer NI:    [15.00] %               |
|   Pension:        [ 3.00] %               |
|   Apprenticeship: [ 0.00] %               |
+-------------------------------------------+
    |
    v
+-------------------------------------------+
| STEP 5: Overtime & Penalty Rules          |
|                                           |
|   Standard Work Day:   [11] hrs           |
|   Lunch Break:         [ 1] hrs           |
|   6th Day Multiplier:  [1.5]x            |
|   7th Day Multiplier:  [2.0]x            |
|   Night Premium:       [50] %             |
|   Night Start Time:    [23:00]            |
|   Meal Penalty After:  [ 6] hrs           |
|   Meal Penalty Incr:   [15] min           |
|   Min Turnaround:      [11] hrs           |
+-------------------------------------------+
    |
    v
+-------------------------------------------+
| STEP 6: Allowances                        |
|                                           |
|   Kit:      [£150.00] /week              |
|   Travel:   [£ 45.00] /week              |
|   Per Diem: [£ 30.00] /day               |
|   Phone:    [£ 10.00] /week              |
|   Computer: [£ 25.00] /week              |
|   Car:      [£150.00] /week              |
+-------------------------------------------+
    |
    v
+-------------------------------------------+
| STEP 7: Review & Submit                   |
|                                           |
|   Full summary of all entered data        |
|   [Submit Deal Memo]                      |
+-------------------------------------------+
    |
    v
Deal Memo created (status: Draft)
```

### Deal Memo Lifecycle

```
Draft --> Sent --> Negotiating --> Signed --> Active --> Completed
                       |
                       v
                   Cancelled
```

---

## Flow 3: Crew Fills Weekly Timecard

```
Crew member logs in (e.g. tom@prodpayroll.com)
    |
    v
Timecards page --> [+ New Timecard] or open existing
    |
    v
+--------+----------+-------+-------+------+-------+--------+------+------+
| DAY    | CALL     | LUNCH | LUNCH | WRAP | TOTAL | STRT   | OT   | OT   |
|        | TIME     | START | END   | TIME |       |        | 1.5x | 2x   |
+--------+----------+-------+-------+------+-------+--------+------+------+
| Mon    | 07:00    | 13:00 | 14:00 | 19:00| 11.0  | 11.0   | -    | -    |
| Tue    | 07:00    | 13:00 | 14:00 | 19:00| 11.0  | 11.0   | -    | -    |
| Wed    | 07:00    | 13:00 | 14:00 | 19:30| 11.5  | 11.0   | 0.5  | -    |
| Thu    | 07:00    | 13:00 | 14:00 | 19:00| 11.0  | 11.0   | -    | -    |
| Fri    | 07:00    | 13:00 | 14:00 | 19:00| 11.0  | 11.0   | -    | -    |
| Sat    | (rest)   |       |       |      | -     | -      | -    | -    |
| Sun    | (rest)   |       |       |      | -     | -      | -    | -    |
+--------+----------+-------+-------+------+-------+--------+------+------+
| TOTALS |          |       |       |      | 55.5  | 55.0   | 0.5  | 0    |
+--------+----------+-------+-------+------+-------+--------+------+------+

Flags per day: [Travel] [Rest] [Holiday]

Auto-detected: 6th consecutive day, 7th consecutive day
Auto-calculated: Meal penalties, Turnaround violations
```

### What the system auto-calculates

```
Straight Time = min(total worked, standard day hrs)
OT 1.5x      = hours beyond standard day, before 23:00
OT 2x        = hours after 23:00, or camera dept OT, or 7th day
Meal Penalty  = if lunch > 6hrs after call (15-min increments at OT rate)
Turnaround    = if < 11hrs rest from previous day wrap
6th Day       = auto-detected, premium at 1.5x
7th Day       = auto-detected, premium at 2.0x
```

---

## Flow 4: Approval Chain

```
Crew submits timecard
    |
    v
+------------------+     +------------------+     +------------------+
| SUBMITTED        | --> | DEPT APPROVED    | --> | PAYROLL APPROVED |
|                  |     |                  |     |                  |
| Dept Head        |     | Payroll Admin    |     | Ready for        |
| reviews hours,   |     | final check      |     | payroll run      |
| OT, penalties    |     |                  |     |                  |
+------------------+     +------------------+     +------------------+
    |                         |
    v                         v
+------------------+     +------------------+
| REJECTED         |     | REJECTED         |
| (with reason)    |     | (with reason)    |
| --> back to crew |     | --> back to crew |
+------------------+     +------------------+
```

---

## Flow 5: Run Payroll

```
Payroll Admin logs in
    |
    v
Payroll page --> [+ Create Run]
    |
    v
Select: Production + Week Period
    |
    v
[Calculate] --> System processes all approved timecards
    |
    v
For EACH person, calculates:
```

### Payroll Calculation Breakdown

```
+-----------------------------+------------------------------------------+
| EARNINGS                    |                                          |
+-----------------------------+------------------------------------------+
| Base Pay                    | Straight hrs x hourly rate               |
| OT 1.5x Pay                | OT 1.5x hrs x (hourly x 1.5)            |
| OT 2x Pay                  | OT 2x hrs x (hourly x 2.0)              |
| Meal Penalty Pay            | Count x penalty rate (15-min increments) |
| Turnaround Penalty          | Shortfall hrs x 1.5x rate               |
| 6th Day Premium             | Full day at 1.5x                        |
| 7th Day Premium             | Full day at 2.0x                        |
| Night Premium               | Night hrs x 50% of daily rate            |
| Kit Allowance               | Per deal memo                            |
| Travel Allowance            | Per deal memo                            |
| Per Diem                    | Per deal memo                            |
| Phone / Computer / Car      | Per deal memo                            |
+-----------------------------+------------------------------------------+
| = GROSS PAY                 | Sum of all above                         |
+-----------------------------+------------------------------------------+

+-----------------------------+------------------------------------------+
| EMPLOYER FRINGES            | (cost to production, on top of gross)    |
+-----------------------------+------------------------------------------+
| Holiday Pay                 | 12.07% of gross (if not inclusive)        |
| Employer NI                 | 15% of gross above £96.15/wk threshold   |
| Employer Pension            | 3% of gross                              |
+-----------------------------+------------------------------------------+
| = TOTAL FRINGES             | Sum of above                             |
+-----------------------------+------------------------------------------+

+-----------------------------+------------------------------------------+
| EMPLOYEE DEDUCTIONS         | (taken from gross)                       |
+-----------------------------+------------------------------------------+
| Employee NI                 | 8% (£242-967/wk), 2% above £967/wk      |
| Income Tax (PAYE)           | 20% / 40% / 45% by band                 |
| Employee Pension            | 5% of gross                              |
+-----------------------------+------------------------------------------+
| = TOTAL DEDUCTIONS          | Sum of above                             |
+-----------------------------+------------------------------------------+

| NET PAY                     | Gross - Deductions                       |
| TOTAL COST TO PRODUCTION    | Gross + Employer Fringes                 |
```

```
Review all line items --> [Approve] --> [Export CSV] --> [Mark as Paid]
```

---

## Flow 6: Browse Rate Cards

```
Rate Cards page
    |
    v
Select cascading filters:

  Country        Union              Department         Designation          Budget Tier
  +---------+   +----------------+  +-------------+   +-----------------+  +-------------+
  | UK      |-->| BECTU          |->| Camera      |-->| Dir. of Photo.  |->| MMP (£30m+) |
  +---------+   | Equity         |  | Sound       |   | Camera Operator |  | Film £15-30m|
                | FAA            |  | Lighting    |   | 1st AC          |  | TV Band 3   |
                | Directors UK   |  | Art Dept    |   | Gaffer          |  | TV Band 2   |
                | WGGB           |  | Costume     |   | etc.            |  | etc.        |
                | Musicians Union|  | etc. (20+)  |   |                 |  |             |
                +----------------+  +-------------+   +-----------------+  +-------------+
    |
    v
+------------------------------------------------------------------+
|                        RATE CARD                                  |
|                                                                  |
|  WEEKLY       DAILY        HOURLY                                |
|  £5,500.00    £1,100.00    £100.00                               |
|                                                                  |
|  OT 1.5x     OT 2x        6TH DAY    7TH DAY    NIGHT PREM     |
|  £150.00     £200.00      £1,650.00  £2,200.00   50%            |
|                                                                  |
|  Holiday Pay: Exclusive (add 12.07%)                             |
|  Source: BECTU Camera Branch Rate Card 2024-2025                 |
|  (i) = each rate links to official source URL                    |
+------------------------------------------------------------------+
|                     OVERTIME RULES                                |
|                                                                  |
|  Standard OT (1.5x after 11hrs)     weekday                     |
|  Camera OT (2x after 11hrs)         weekday (camera dept)       |
|  Night OT (2x after 23:00)          all                         |
|  6th Day (1.5x, min 6hrs)           6th consecutive day         |
|  7th Day (2x, min 6hrs)             7th consecutive day         |
+------------------------------------------------------------------+
```

---

## Flow 7: Export & Import

```
+-------------------+---------------------------+------------------------+
| Data              | Export                    | Import                 |
+-------------------+---------------------------+------------------------+
| Rate Cards        | CSV / JSON (all users)    | CSV / JSON (admin)     |
| Deal Memos        | CSV / JSON (admin/acct)   | -                      |
| Timecards         | CSV / JSON (admin/HOD)    | CSV / JSON (admin)     |
| Payroll Run       | CSV / JSON (admin/payroll)| -                      |
+-------------------+---------------------------+------------------------+

Import flow:
  1. Download CSV template (empty with correct headers)
  2. Fill in data in spreadsheet
  3. Upload CSV/JSON file
  4. Preview first 5 rows
  5. Click Import
  6. See results: created / updated / errors
```

---

## UK Unions Supported

```
+---------------+----------------------------------+---------------------------+
| Union         | Covers                           | Key Rules                 |
+---------------+----------------------------------+---------------------------+
| BECTU         | All crew: camera, sound, grip,   | 11+1 hr day (film)        |
|               | lighting, art, costume, makeup,  | 10+1 hr day (TV)          |
|               | props, construction, locations,  | OT 1.5x, 2x after 23:00  |
|               | post, ADs, production, SFX,      | Camera OT always 2x       |
|               | runners (20 departments)         | 11hr turnaround           |
+---------------+----------------------------------+---------------------------+
| Equity        | Actors, performers, stunt,       | 10hr day                  |
|               | dancers, voice artists           | OT max £94/hr             |
|               |                                  | Night +50%                |
|               |                                  | 12hr turnaround           |
|               |                                  | Budget uplift: +280%/+75% |
+---------------+----------------------------------+---------------------------+
| FAA           | Background artists               | Day £111.21               |
|               | (London 40-mile radius)          | Night £166.82             |
|               |                                  | OT £11.69/30min           |
+---------------+----------------------------------+---------------------------+
| Directors UK  | Film & TV directors              | Prep + shoot + post       |
+---------------+----------------------------------+---------------------------+
| WGGB          | Screenwriters                    | Flat fees by budget:      |
|               |                                  | £42,120 / £25,650 /       |
|               |                                  | £18,900                   |
+---------------+----------------------------------+---------------------------+
| Musicians     | Session musicians,               | 3hr session rates         |
| Union         | composers                        |                           |
+---------------+----------------------------------+---------------------------+
```

---

## Role-Based Access Matrix

```
+-------------------+-------+-------+-------+-------+------+
| Feature           | Super | Pay   | Prod  | Dept  | Crew |
|                   | Admin | Admin | Acct  | Head  |      |
+-------------------+-------+-------+-------+-------+------+
| Dashboard         |   Y   |   Y   |   Y   |   Y   |  Y   |
| Productions       |   Y   |   Y   |   Y   |   Y   |  -   |
| Deal Memos        |   Y   |   Y   |   Y   |   Y   | Own  |
| Timecards         |   Y   |   Y   |   Y   | Dept  | Own  |
| Payroll           |   Y   |   Y   |   Y   |   -   |  -   |
| Rate Cards        |   Y   |   Y   |   Y   |   Y   |  Y   |
| Admin Rates       |   Y   |   Y   |   -   |   -   |  -   |
| Import Data       |   Y   |   Y   |   -   |   -   |  -   |
| Export Data       |   Y   |   Y   |   Y   |   Y   |  Y   |
| Settings          |   Y   |   Y   |   Y   |   Y   |  Y   |
+-------------------+-------+-------+-------+-------+------+
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + TailwindCSS + shadcn/ui + Framer Motion |
| Backend | Node.js + Express |
| Database | MongoDB (remote) |
| Auth | JWT with refresh tokens + RBAC |
| Hosting | Render (https://movie-payroll.onrender.com) |
| Rate Data | 62+ official UK union rate cards with source URLs |
| Calculations | decimal.js for financial precision |
