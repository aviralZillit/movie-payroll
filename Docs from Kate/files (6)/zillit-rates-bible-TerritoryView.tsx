'use client'

// ─────────────────────────────────────────────────────────────────────────────
// Zillit Global Rates Bible — Territory View Components
// Includes: TerritoryView, UnionPicker, ContentSearch,
//           AgreementCard, RulesTab, IncentivesTab
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo, useCallback } from 'react'
import {
  Territory, Agreement, RuleGroup, Incentive, RateRow,
  ActiveTab, filterAgreements,
} from './types'
import {
  useRatesStore, useActiveTab, useAgrFilter, useContentQuery,
} from './useRatesStore'

// ─────────────────────────────────────────────────────────────────────────────
// TERRITORY VIEW
// ─────────────────────────────────────────────────────────────────────────────

interface TerritoryViewProps {
  territory: Territory
}

export function TerritoryView({ territory: t }: TerritoryViewProps) {
  const activeTab = useActiveTab()
  const { clearSelection, setTab } = useRatesStore()

  const conf  = t.agreements.filter(a => a.status === 'confirmed').length
  const pend  = t.agreements.filter(a => a.status === 'not_extracted').length
  const hasRules = t.rules.length > 0
  const hasInc   = t.incentives.length > 0

  return (
    <div className="flex-1 flex flex-col overflow-hidden animate-fade-in">

      {/* ── Territory header ────────────────────────────────────────────── */}
      <div className="flex items-center gap-2.5 px-4 py-2.5 bg-bg-s border-b border-border flex-shrink-0">
        <span className="text-2xl leading-none flex-shrink-0">{t.flag}</span>
        <div className="flex-1 min-w-0">
          <div className="text-2xs text-text-3 mb-0.5 font-syne">
            <button
              onClick={clearSelection}
              className="hover:text-gold transition-colors cursor-pointer"
            >
              Home
            </button>
            {' / '}{t.region}
          </div>
          <h2 className="font-syne font-black text-xl tracking-tight leading-tight">{t.name}</h2>
          <p className="text-sm text-text-2">{t.currency} · {t.tz}</p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {conf > 0 && <Badge variant="green">{conf} confirmed</Badge>}
          {pend > 0 && <Badge variant="yellow">{pend} pending</Badge>}
        </div>
      </div>

      {/* ── Tab bar ─────────────────────────────────────────────────────── */}
      <div className="flex bg-bg-s border-b border-border px-3.5 flex-shrink-0 gap-0.5">
        <Tab id="rates"     active={activeTab} label="📋  Rates"      count={conf} onSelect={setTab} />
        {hasRules && <Tab id="rules"     active={activeTab} label="⚖️  Rules"      onSelect={setTab} />}
        {hasInc   && <Tab id="incentives" active={activeTab} label="💰  Incentives" onSelect={setTab} />}
      </div>

      {/* ── Union picker + search (rates tab only) ──────────────────────── */}
      {activeTab === 'rates' && (
        <>
          <UnionPicker agreements={t.agreements} />
          <ContentSearch />
        </>
      )}

      {/* ── Scrollable content ──────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-3.5 pb-6">
        {/* Summary banner */}
        {t.summary && (
          <div className="flex gap-2 p-2.5 bg-info/8 border-l-2 border-info rounded-sm mb-3 text-sm text-text-2 leading-relaxed">
            <span className="text-base flex-shrink-0">ℹ</span>
            <p>{t.summary}</p>
          </div>
        )}

        {/* Tab content */}
        {activeTab === 'rates'      && <RatesTab agreements={t.agreements} />}
        {activeTab === 'rules'      && <RulesTab rules={t.rules} />}
        {activeTab === 'incentives' && <IncentivesTab incentives={t.incentives} />}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// UNION PICKER (pill filter)
// ─────────────────────────────────────────────────────────────────────────────

function UnionPicker({ agreements }: { agreements: Agreement[] }) {
  const agrFilter = useAgrFilter()
  const { setAgrFilter } = useRatesStore()

  const pills = useMemo(() =>
    agreements.map(a => {
      let label = a.name
        .replace(/PACT\/BECTU /g, '').replace(/^BECTU /g, '').replace(/^IATSE /g, '')
        .replace(/ 2024-2028$/, '').replace(/ 2025-2026$/, '').replace(/ 2023-2024$/, '')
        .replace(/ Rate Card.*/, '').replace(/ Agreement.*/, '').replace(/ \(.*?\)/, '')
      if (label.length > 34) label = label.slice(0, 32) + '…'
      const isPending = a.status === 'not_extracted' || a.status === 'broken'
      return { id: a.id, label, isPending }
    }),
    [agreements]
  )

  return (
    <div className="flex-shrink-0 border-b border-border bg-bg-e">
      <div className="flex items-center gap-1.5 px-3.5 pt-1.5">
        <span className="font-syne font-bold text-2xs uppercase tracking-wide-md text-text-3">
          Filter by union
        </span>
        <span className="text-2xs text-text-3">— click a pill to focus on one agreement</span>
      </div>
      <div className="flex items-center gap-1.5 px-3.5 py-1.5 overflow-x-auto">
        {/* All pill */}
        <Pill
          label="All agreements"
          active={agrFilter === 'all'}
          onClick={() => setAgrFilter('all')}
        />
        {pills.map(p => (
          <Pill
            key={p.id}
            label={p.label + (p.isPending ? ' ○' : '')}
            active={agrFilter === p.id}
            onClick={() => setAgrFilter(p.id)}
          />
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// CONTENT SEARCH
// ─────────────────────────────────────────────────────────────────────────────

function ContentSearch() {
  const contentQuery = useContentQuery()
  const { setContentQuery } = useRatesStore()

  return (
    <div className="flex-shrink-0 flex items-center gap-2 px-3.5 py-1.5 bg-bg-s border-b border-border">
      <input
        type="text"
        value={contentQuery}
        onChange={e => setContentQuery(e.target.value)}
        placeholder="Search grades, roles, rates within this territory…"
        className="flex-1 bg-bg-e border border-border-mid rounded-sm
                   px-3 py-1.5 text-sm text-text-1 placeholder:text-text-3
                   focus:outline-none focus:border-gold transition-colors"
        style={{ paddingLeft: '2rem', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='%23464d68' stroke-width='2.5'%3E%3Ccircle cx='11' cy='11' r='8'/%3E%3Cpath d='m21 21-4.35-4.35'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: '8px center' }}
      />
      {/* Result count is handled in RatesTab via visible card count */}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// RATES TAB
// ─────────────────────────────────────────────────────────────────────────────

function RatesTab({ agreements }: { agreements: Agreement[] }) {
  const agrFilter    = useAgrFilter()
  const contentQuery = useContentQuery()

  const visible = useMemo(
    () => filterAgreements(agreements, agrFilter),
    [agreements, agrFilter]
  )

  return (
    <div className="flex flex-col gap-2.5">
      {visible.map(a => (
        <AgreementCard key={a.id} agreement={a} searchQuery={contentQuery} />
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// AGREEMENT CARD
// ─────────────────────────────────────────────────────────────────────────────

function AgreementCard({
  agreement: a,
  searchQuery,
}: {
  agreement: Agreement
  searchQuery: string
}) {
  const isPending = a.status === 'not_extracted' || a.status === 'broken'

  // Filter rows by search query
  const visibleRows = useMemo(() => {
    if (!searchQuery.trim()) return a.rows
    const q = searchQuery.toLowerCase()
    return a.rows.filter(
      r => r.isHd ||
           r.g?.toLowerCase().includes(q) ||
           r.r1?.toLowerCase().includes(q) ||
           r.r2?.toLowerCase().includes(q)
    )
  }, [a.rows, searchQuery])

  // If searching and no rows match (and not pending), hide the card
  if (searchQuery && !isPending && visibleRows.filter(r => !r.isHd).length === 0) {
    return null
  }

  const eff = a.eff + (a.effectiveTo ? ` – ${a.effectiveTo}` : '')

  return (
    <div className={[
      'bg-bg-s border rounded-md overflow-hidden transition-opacity',
      isPending ? 'border-dashed border-border opacity-70 hover:opacity-100' : 'border-border',
    ].join(' ')}>

      {/* Header */}
      <div className="flex items-start gap-2 p-3 bg-bg-e border-b border-border">
        <div className="flex-1 min-w-0">
          <h3 className="font-syne font-black text-sm leading-snug">{a.name}</h3>
          {(a.union || eff) && (
            <p className="text-xs text-text-2 mt-0.5">
              {[a.union, eff].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>
        <div className="flex gap-1 flex-shrink-0 flex-wrap justify-end">
          <Badge variant={a.access === 'public' ? 'teal' : 'grey'}>
            {a.access === 'public' ? '🌐 Public' : '🔒 Member'}
          </Badge>
          <Badge variant={a.status === 'confirmed' ? 'green' : a.status === 'broken' ? 'red' : 'yellow'}>
            {a.status === 'confirmed' ? '✓ Confirmed'
              : a.status === 'broken' ? '✗ Unavailable'
              : '○ Pending'}
          </Badge>
        </div>
      </div>

      {/* Body */}
      <div className="p-3">
        {/* Rate table */}
        {visibleRows.length > 0 && (
          <table className="w-full text-sm bg-bg-e border border-border rounded-md overflow-hidden mb-2">
            <thead>
              <tr className="bg-bg-h">
                <th className="font-syne font-bold text-2xs uppercase tracking-wide-md text-text-3 px-2.5 py-1.5 text-left w-5/12">
                  Grade / Item
                </th>
                <th className="font-syne font-bold text-2xs uppercase tracking-wide-md text-text-3 px-2.5 py-1.5 text-left w-4/12">
                  Rate / Week
                </th>
                <th className="font-syne font-bold text-2xs uppercase tracking-wide-md text-text-3 px-2.5 py-1.5 text-left w-3/12">
                  Rate / Day or Note
                </th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row, i) => (
                <RateTableRow key={i} row={row} />
              ))}
            </tbody>
          </table>
        )}

        {/* Pending placeholder */}
        {isPending && (
          <div className="flex gap-2 p-2.5 bg-teal/8 border-l-2 border-teal rounded-sm text-sm text-text-2">
            <span>📄</span>
            <span>Rate data pending extraction — see source or PDF link to access directly.</span>
          </div>
        )}

        {/* Holiday note */}
        {a.holNote && (
          <div className="mt-2 pl-3 border-l-2 border-orange bg-orange/5 py-1.5 pr-2 rounded-r-sm text-sm text-text-2 leading-relaxed">
            {a.holNote}
          </div>
        )}

        {/* General note */}
        {a.note && (
          <div className="mt-2 pl-3 border-l-2 border-border-mid bg-bg-h py-1.5 pr-2 rounded-r-sm text-sm text-text-2 leading-relaxed">
            {a.note}
          </div>
        )}

        {/* Source link */}
        <div className="mt-2 pt-2 border-t border-border/60 flex items-center gap-1.5 text-xs text-text-3">
          <span className="font-semibold">Source</span>
          <a href={a.source} target="_blank" rel="noopener noreferrer"
             className="font-mono text-teal opacity-80 hover:opacity-100 hover:underline break-all">
            {a.source.replace(/^https?:\/\//, '')}
          </a>
          {a.pdf && a.status === 'confirmed' && (
            <a href={a.pdf} target="_blank" rel="noopener noreferrer"
               className="ml-1.5 font-mono text-gold opacity-80 hover:opacity-100 hover:underline">
              ↗ PDF
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

// ── RATE TABLE ROW ────────────────────────────────────────────────────────────

function RateTableRow({ row: r }: { row: RateRow }) {
  if (r.isHd) {
    return (
      <tr>
        <td colSpan={3}
          className="font-syne font-bold text-2xs uppercase tracking-wide-md text-gold
                     bg-bg-h/80 px-2.5 py-1.5 border-y border-gold/10">
          {r.hd}
        </td>
      </tr>
    )
  }
  return (
    <tr className="border-b border-border/40 hover:bg-white/[0.013] last:border-0">
      <td className="px-2.5 py-1.5 font-medium text-text-2 text-sm">{r.g}</td>
      <td className={[
        'px-2.5 py-1.5 font-mono text-sm',
        r.ind ? 'text-purple' : r.neg ? 'text-teal' : 'text-text-1',
      ].join(' ')}>
        {r.r1 || '—'}
      </td>
      <td className="px-2.5 py-1.5 text-xs text-text-3">{r.r2}</td>
    </tr>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// RULES TAB
// ─────────────────────────────────────────────────────────────────────────────

export function RulesTab({ rules }: { rules: RuleGroup[] }) {
  if (!rules.length) {
    return <EmptyState icon="⚖️" title="No rules data" sub="Working rules not yet added for this territory." />
  }

  return (
    <>
      {/* Banner */}
      <div className="flex gap-2 p-2.5 bg-info/8 border-l-2 border-info rounded-sm mb-3 text-sm text-text-2 leading-relaxed">
        <span>⚖️</span>
        <span><strong className="text-text-1">Union Working Rules</strong> — items marked <span className="text-orange">⚠</span> are the most common sources of unbudgeted costs and compliance issues.</span>
      </div>

      <div className="flex flex-col gap-2.5">
        {rules.map((group, i) => (
          <div key={i} className="bg-bg-s border border-border rounded-md overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 bg-bg-e border-b border-border">
              <h3 className="font-syne font-black text-sm">{group.union}</h3>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-bg-h">
                  <th className="font-syne font-bold text-2xs uppercase tracking-wide-md text-text-3 px-2.5 py-1.5 text-left w-48">
                    Rule
                  </th>
                  <th className="font-syne font-bold text-2xs uppercase tracking-wide-md text-text-3 px-2.5 py-1.5 text-left">
                    Requirement
                  </th>
                </tr>
              </thead>
              <tbody>
                {group.items.map((item, j) => (
                  <tr key={j}
                    className={[
                      'border-b border-border/35 last:border-0',
                      item.warn ? 'bg-orange/[0.03]' : '',
                    ].join(' ')}>
                    <td className={[
                      'px-2.5 py-1.5 font-semibold text-sm align-top',
                      item.warn ? 'text-orange' : 'text-text-2',
                    ].join(' ')}>
                      {item.k}
                    </td>
                    <td className="px-2.5 py-1.5 text-sm text-text-1 leading-relaxed align-top">
                      {item.v}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// INCENTIVES TAB
// ─────────────────────────────────────────────────────────────────────────────

export function IncentivesTab({ incentives }: { incentives: Incentive[] }) {
  if (!incentives.length) {
    return <EmptyState icon="💰" title="No incentive data" sub="Incentive data not yet added for this territory." />
  }

  return (
    <div className="flex flex-col gap-2.5">
      {incentives.map((inc, i) => (
        <div key={i} className="bg-bg-s border border-border rounded-md overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2.5
                          bg-gradient-to-r from-gold-glow to-transparent border-b border-border">
            <span className="font-syne font-black text-sm">{inc.name}</span>
            <span className="font-mono text-base font-medium text-gold">{inc.rate}</span>
          </div>
          <div className="px-3 py-2">
            {inc.items.map((row, j) => (
              <div key={j}
                className="flex gap-2.5 py-1 border-b border-border/35 last:border-0 text-sm">
                <span className="w-32 flex-shrink-0 font-semibold text-text-2 text-xs">{row.k}</span>
                <span className="flex-1 text-text-1 leading-relaxed">{row.v}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SHARED UI PRIMITIVES
// ─────────────────────────────────────────────────────────────────────────────

type BadgeVariant = 'green' | 'yellow' | 'red' | 'teal' | 'grey' | 'gold' | 'orange'

function Badge({ variant, children }: { variant: BadgeVariant; children: React.ReactNode }) {
  const classes: Record<BadgeVariant, string> = {
    green:  'bg-success/10 text-success border-success/20',
    yellow: 'bg-warning/10 text-warning border-warning/20',
    red:    'bg-error/10 text-error border-error/20',
    teal:   'bg-teal/10 text-teal border-teal/20',
    grey:   'bg-bg-h text-text-3 border-border',
    gold:   'bg-gold-glow text-gold border-gold/20',
    orange: 'bg-orange/10 text-orange border-orange/20',
  }
  return (
    <span className={[
      'inline-flex items-center px-1.5 py-0.5 rounded-full font-syne font-bold text-2xs border',
      classes[variant],
    ].join(' ')}>
      {children}
    </span>
  )
}

function Tab({
  id, active, label, count, onSelect,
}: {
  id: ActiveTab
  active: ActiveTab
  label: string
  count?: number
  onSelect: (tab: ActiveTab) => void
}) {
  return (
    <button
      onClick={() => onSelect(id)}
      className={[
        'flex items-center gap-1.5 px-3 py-2.5 font-syne font-bold text-xs',
        'border-b-2 whitespace-nowrap transition-all',
        active === id
          ? 'text-gold border-gold'
          : 'text-text-3 border-transparent hover:text-text-2',
      ].join(' ')}
    >
      {label}
      {count != null && (
        <span className="font-syne font-bold text-2xs px-1.5 py-px rounded-full bg-teal/10 text-teal">
          {count}
        </span>
      )}
    </button>
  )
}

function Pill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={[
        'flex-shrink-0 px-2.5 py-1 rounded-full font-syne font-bold text-xs',
        'border whitespace-nowrap transition-all',
        active
          ? 'bg-gold-glow text-gold border-gold/35'
          : 'bg-bg-h text-text-3 border-border hover:text-text-1 hover:border-border-mid',
      ].join(' ')}
    >
      {label}
    </button>
  )
}

function EmptyState({ icon, title, sub }: { icon: string; title: string; sub: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center text-text-3">
      <div className="text-3xl mb-2.5 opacity-40">{icon}</div>
      <div className="font-syne font-bold text-sm text-text-2 mb-1">{title}</div>
      <div className="text-sm leading-relaxed max-w-xs">{sub}</div>
    </div>
  )
}
