// ─────────────────────────────────────────────────────────────────────────────
// Zillit Global Production Rates Bible — TypeScript Type Definitions
// Stack: React 18 · TypeScript · Next.js 14 App Router · Tailwind CSS
// ─────────────────────────────────────────────────────────────────────────────

// ── RATE ROW ──────────────────────────────────────────────────────────────────

/** A single row in a rate table. Set isHd:true to render as a section divider. */
export interface RateRow {
  /** Section header text — renders as a gold divider row spanning all columns */
  hd?: string
  /** Whether this row is a section header (mutually exclusive with g/r1/r2) */
  isHd?: boolean
  /** Grade or item label — left column */
  g?: string
  /** Primary rate — centre column (DM Mono, formatted string e.g. "£3,565/wk") */
  r1?: string
  /** Secondary rate or note — right column */
  r2?: string
  /** Render r1 in purple — used for Ind. Neg. (individually negotiated) rates */
  ind?: boolean
  /** Render r1 in teal — used for Own Negotiation rates */
  neg?: boolean
}

// ── AGREEMENT ─────────────────────────────────────────────────────────────────

export type AgreementStatus =
  | 'confirmed'      // Rate data live-extracted from source PDF / URL
  | 'not_extracted'  // Agreement exists but rates not yet extracted
  | 'broken'         // Source URL returns error / PDF unavailable

export type AgreementAccess =
  | 'public'   // Rate card publicly available, no login required
  | 'member'   // Requires union membership / login to access source

export type AgreementType =
  | 'crew'
  | 'performers'
  | 'writers'
  | 'directors'
  | 'post'
  | 'production'

/**
 * A single collective agreement or rate card within a territory.
 * Multiple agreements can exist per territory (e.g. UK has 19+ BECTU branches).
 */
export interface Agreement {
  /** Unique ID — e.g. 'uk-cam', 'us-sag', 'ca-873' */
  id: string
  /** Full display name of the agreement */
  name: string
  /** Category of worker covered */
  type: AgreementType
  /** Union or body that negotiated/published this rate card */
  union: string
  /** Effective from date (display string e.g. '01/04/2025') */
  eff: string
  /** Effective to date if fixed term */
  effectiveTo?: string
  /** Whether rates have been extracted and verified */
  status: AgreementStatus
  /** Whether source is publicly accessible */
  access: AgreementAccess
  /** Source URL for the rate card or agreement page */
  source: string
  /** Direct PDF download URL (only on confirmed agreements) */
  pdf?: string
  /**
   * Holiday pay note.
   * IMPORTANT: Treatment varies significantly per branch:
   * - Camera / ADs: NOT included (add 12.07%)
   * - Most others: INCLUDED in published rate
   * - SFX: SEPARATE (12.1% on every contract)
   */
  holNote?: string
  /** General notes about this agreement (caveats, branch-specific rules, etc.) */
  note?: string
  /** Rate table rows — empty array = pending or unavailable */
  rows: RateRow[]
}

// ── RULE ITEM ─────────────────────────────────────────────────────────────────

/**
 * A single working rule provision.
 * Items with warn:true are rendered in orange — highest compliance risk.
 */
export interface RuleItem {
  /** Rule name / label (left column, 200px wide) */
  k: string
  /** Rule detail / value (right column) */
  v: string
  /**
   * Whether this is a common source of unbudgeted cost or compliance risk.
   * Renders in orange with a highlighted row background.
   */
  warn: boolean
}

/** A group of working rules under one union/agreement heading */
export interface RuleGroup {
  /** Union or agreement name for this group of rules */
  union: string
  /** Individual rule provisions */
  items: RuleItem[]
}

// ── INCENTIVE ─────────────────────────────────────────────────────────────────

export interface IncentiveItem {
  /** Label (e.g. 'Rate', 'Min spend', 'Contact') */
  k: string
  /** Value / description */
  v: string
}

export interface Incentive {
  /** Incentive programme name (e.g. 'HETV Tax Credit') */
  name: string
  /** Headline rate (e.g. '34%') — displayed prominently in DM Mono gold */
  rate: string
  /** Key/value details */
  items: IncentiveItem[]
}

// ── TERRITORY ─────────────────────────────────────────────────────────────────

/**
 * A single territory (country or region) in the BIBLE.
 * Contains one or more agreements, optional working rules, and optional incentives.
 */
export interface Territory {
  /** ISO 2-char country code, lowercase — e.g. 'uk', 'us', 'ca' */
  id: string
  /** Emoji flag character(s) */
  flag: string
  /** Display name */
  name: string
  /** Region grouping for sidebar navigation */
  region: TerritoryRegion
  /** Currency code / symbol */
  currency: string
  /** Timezone string (e.g. 'GMT/BST') */
  tz: string
  /** One-paragraph summary of the territory's production environment */
  summary: string
  /** All union/CBA agreements in this territory */
  agreements: Agreement[]
  /**
   * Working rules — overtime triggers, meal penalties, turnaround provisions, etc.
   * Each RuleGroup is one union/agreement's rules.
   * Items with warn:true are the most common sources of unbudgeted cost.
   */
  rules: RuleGroup[]
  /** Production incentives, rebates, and tax credits */
  incentives: Incentive[]
}

export type TerritoryRegion =
  | 'Europe & UK'
  | 'North America'
  | 'Europe'
  | 'Asia-Pacific'
  | 'Middle East & Africa'
  | 'Latin America'

// ── UI STATE ──────────────────────────────────────────────────────────────────

export type ActiveTab = 'rates' | 'rules' | 'incentives'

export interface RatesBibleState {
  /** Currently selected territory ID, or null for welcome screen */
  selectedId: string | null
  /** Active tab within the territory view */
  activeTab: ActiveTab
  /** Currently selected union filter ('all' = show all agreements) */
  agrFilter: string
  /** Content search query (searches rate rows within current territory) */
  contentQuery: string
  /** Sidebar search query (filters territory list) */
  sidebarQuery: string
  /** Whether the AI assistant panel is open */
  aiOpen: boolean
}

// ── AI ASSISTANT ──────────────────────────────────────────────────────────────

export interface AiMessage {
  role: 'user' | 'assistant'
  content: string
}

// ── COMPUTED / UTILITY ────────────────────────────────────────────────────────

/** Derived from Territory.agreements — for display in sidebar */
export interface TerritoryMeta {
  id: string
  flag: string
  name: string
  region: TerritoryRegion
  currency: string
  totalAgreements: number
  confirmedCount: number
  pendingCount: number
  /** 'full' | 'partial' | 'minimal' — drives status dot colour */
  status: 'full' | 'partial' | 'minimal'
}

/** Filter helper — returns agreements matching the current pill selection */
export function filterAgreements(
  agreements: Agreement[],
  agrFilter: string
): Agreement[] {
  if (agrFilter === 'all') return agreements
  return agreements.filter((a) => a.id === agrFilter)
}

/** Filter helper — returns rate rows matching the content search query */
export function filterRows(rows: RateRow[], query: string): RateRow[] {
  if (!query.trim()) return rows
  const q = query.toLowerCase()
  return rows.filter(
    (r) =>
      r.isHd ||
      r.g?.toLowerCase().includes(q) ||
      r.r1?.toLowerCase().includes(q) ||
      r.r2?.toLowerCase().includes(q)
  )
}

/** Status helper — derive sidebar dot status from an agreement list */
export function getTerritoryStatus(
  agreements: Agreement[]
): TerritoryMeta['status'] {
  const confirmed = agreements.filter((a) => a.status === 'confirmed').length
  if (confirmed === agreements.length) return 'full'
  if (confirmed > 0) return 'partial'
  return 'minimal'
}
