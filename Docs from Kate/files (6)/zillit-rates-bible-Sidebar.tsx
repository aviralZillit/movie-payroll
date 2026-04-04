'use client'

// ─────────────────────────────────────────────────────────────────────────────
// Zillit Global Rates Bible — Sidebar Component
// Territory list with search, region grouping, status dots, and stats footer.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useMemo } from 'react'
import { Territory, TerritoryRegion, getTerritoryStatus } from './types'
import { useRatesStore, useSidebarQuery, useSelectedId } from './useRatesStore'

// ── REGION ORDER ─────────────────────────────────────────────────────────────

const REGION_ORDER: TerritoryRegion[] = [
  'Europe & UK',
  'North America',
  'Europe',
  'Asia-Pacific',
  'Middle East & Africa',
  'Latin America',
]

// ── PROPS ─────────────────────────────────────────────────────────────────────

interface SidebarProps {
  bible: Territory[]
}

// ── COMPONENT ─────────────────────────────────────────────────────────────────

export function Sidebar({ bible }: SidebarProps) {
  const sidebarQuery   = useSidebarQuery()
  const selectedId     = useSelectedId()
  const { setSidebarQuery, selectTerritory } = useRatesStore()

  // ── Derived stats ──
  const stats = useMemo(() => {
    const confirmed = bible.reduce(
      (sum, t) => sum + t.agreements.filter(a => a.status === 'confirmed').length, 0
    )
    const pending = bible.reduce(
      (sum, t) => sum + t.agreements.filter(a => a.status === 'not_extracted').length, 0
    )
    return { total: bible.length, confirmed, pending }
  }, [bible])

  // ── Filtered + grouped territories ──
  const grouped = useMemo(() => {
    const q = sidebarQuery.toLowerCase().trim()

    const filtered = q
      ? bible.filter(t =>
          t.name.toLowerCase().includes(q) ||
          t.region.toLowerCase().includes(q) ||
          t.summary.toLowerCase().includes(q) ||
          t.agreements.some(a =>
            a.name.toLowerCase().includes(q) ||
            a.union.toLowerCase().includes(q)
          )
        )
      : bible

    const byRegion = new Map<TerritoryRegion, Territory[]>()
    filtered.forEach(t => {
      if (!byRegion.has(t.region)) byRegion.set(t.region, [])
      byRegion.get(t.region)!.push(t)
    })

    // Sort regions in preferred order
    return REGION_ORDER
      .filter(r => byRegion.has(r))
      .map(r => ({ region: r, territories: byRegion.get(r)! }))
  }, [bible, sidebarQuery])

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSidebarQuery(e.target.value)
  }, [setSidebarQuery])

  return (
    <aside className="w-60 flex-shrink-0 flex flex-col bg-bg-s border-r border-border overflow-hidden">

      {/* ── Search ──────────────────────────────────────────────────────────── */}
      <div className="px-2.5 py-2 border-b border-border">
        <div className="relative">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-3 text-sm pointer-events-none">
            ⌕
          </span>
          <input
            id="sb-search"
            type="text"
            value={sidebarQuery}
            onChange={handleSearch}
            placeholder="Search territories, unions…"
            autoComplete="off"
            className="w-full bg-bg-e border border-border-mid rounded-sm
                       pl-7 pr-8 py-1.5 text-sm text-text-1 placeholder:text-text-3
                       focus:outline-none focus:border-gold transition-colors"
          />
          {!sidebarQuery && (
            <span className="absolute right-2 top-1/2 -translate-y-1/2
                             font-mono text-2xs text-text-3 bg-bg-h border border-border
                             rounded px-1 py-px leading-4">
              /
            </span>
          )}
        </div>
      </div>

      {/* ── Territory list ────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto py-1">
        {grouped.length === 0 ? (
          <p className="text-center text-sm text-text-3 py-8">No territories match</p>
        ) : (
          grouped.map(({ region, territories }) => (
            <div key={region}>
              {/* Region heading */}
              <div className="flex items-center gap-1.5 px-2.5 pt-2 pb-1 mt-0.5">
                <span className="font-syne font-bold text-2xs tracking-wide-xl uppercase text-text-3">
                  {region}
                </span>
                <span className="font-mono text-2xs text-text-3 bg-bg-h rounded px-1">
                  {territories.length}
                </span>
              </div>

              {/* Territory items */}
              {territories.map(t => (
                <TerritoryItem
                  key={t.id}
                  territory={t}
                  isSelected={t.id === selectedId}
                  onSelect={() => selectTerritory(t.id)}
                />
              ))}
            </div>
          ))
        )}
      </div>

      {/* ── Status legend ────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2.5 px-2.5 py-1.5 border-t border-border">
        <span className="font-syne font-bold text-2xs tracking-wide uppercase text-text-3">
          Status
        </span>
        <span className="flex items-center gap-1 text-2xs text-text-3">
          <span className="w-1.5 h-1.5 rounded-full bg-success" />Full
        </span>
        <span className="flex items-center gap-1 text-2xs text-text-3">
          <span className="w-1.5 h-1.5 rounded-full bg-warning" />Partial
        </span>
        <span className="flex items-center gap-1 text-2xs text-text-3">
          <span className="w-1.5 h-1.5 rounded-full bg-orange" />Minimal
        </span>
      </div>

      {/* ── Stats footer ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-1 p-2 border-t border-border">
        <StatTile value={stats.total}     label="Territories" />
        <StatTile value={stats.confirmed} label="Confirmed"   valueColor="text-success" />
        <StatTile value={stats.pending}   label="Pending"     valueColor="text-warning" />
      </div>
    </aside>
  )
}

// ── TERRITORY ITEM ────────────────────────────────────────────────────────────

function TerritoryItem({
  territory: t,
  isSelected,
  onSelect,
}: {
  territory: Territory
  isSelected: boolean
  onSelect: () => void
}) {
  const conf  = t.agreements.filter(a => a.status === 'confirmed').length
  const total = t.agreements.length
  const status = getTerritoryStatus(t.agreements)

  const statusColor = {
    full:    'bg-success',
    partial: 'bg-warning',
    minimal: 'bg-orange',
  }[status]

  return (
    <button
      onClick={onSelect}
      className={[
        'w-full flex items-center gap-1.5 px-2.5 py-1.5 text-left transition-all',
        'border-l-2',
        isSelected
          ? 'bg-gold-subtle border-gold'
          : 'border-transparent hover:bg-bg-h',
      ].join(' ')}
    >
      {/* Flag */}
      <span className="text-base leading-none flex-shrink-0">{t.flag}</span>

      {/* Name + sub */}
      <div className="flex-1 min-w-0">
        <div className={[
          'font-syne font-bold text-xs truncate transition-colors',
          isSelected ? 'text-gold' : 'text-text-2 group-hover:text-text-1',
        ].join(' ')}>
          {t.name}
        </div>
        <div className="text-2xs text-text-3 truncate">
          {conf}/{total} confirmed
        </div>
      </div>

      {/* Status dot */}
      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${statusColor}`} />
    </button>
  )
}

// ── STAT TILE ─────────────────────────────────────────────────────────────────

function StatTile({
  value,
  label,
  valueColor = 'text-text-1',
}: {
  value: number
  label: string
  valueColor?: string
}) {
  return (
    <div className="bg-bg-e border border-border rounded-sm p-1.5 text-center">
      <div className={`font-mono text-base font-medium ${valueColor}`}>{value}</div>
      <div className="font-syne font-bold text-2xs uppercase tracking-wide text-text-3 mt-0.5">
        {label}
      </div>
    </div>
  )
}
