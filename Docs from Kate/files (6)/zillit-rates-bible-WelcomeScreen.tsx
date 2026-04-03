'use client'

// ─────────────────────────────────────────────────────────────────────────────
// Zillit Global Rates Bible — Welcome Screen Component
// Landing screen shown when no territory is selected.
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo } from 'react'
import { Territory, TerritoryRegion } from './types'
import { useRatesStore } from './useRatesStore'

// ── PINNED TERRITORIES ───────────────────────────────────────────────────────
// Most commonly used — shown as quick-access cards at the top.
const PINNED_IDS = ['uk', 'us', 'ca', 'de', 'fr', 'au', 'ie', 'nz']

// ── HOW-TO CARDS ─────────────────────────────────────────────────────────────
const HOW_TO = [
  {
    icon: '📋',
    title: 'Rates tab',
    desc: 'All budget tiers per union — Film MMP, TV Bands 1-4, sub-budget. Filter by union using the pill bar, or search within a territory.',
    color: 'bg-teal/10',
  },
  {
    icon: '⚖️',
    title: 'Rules tab',
    desc: 'Every overtime trigger, meal penalty, turnaround provision, and statutory requirement. ⚠ rows flag the most common sources of unbudgeted cost.',
    color: 'bg-orange/10',
  },
  {
    icon: '🔍',
    title: 'Search',
    desc: 'Press / to focus the sidebar search and filter territories. Inside a territory, the search bar filters individual rate rows in real time.',
    color: 'bg-info/10',
  },
  {
    icon: '✦',
    title: 'Ask AI',
    desc: 'The Rates Assistant (top right) has all rate data loaded. Ask it deal memo questions, OT calculations, or compare rates across territories.',
    color: 'bg-gold-glow',
  },
]

// ── PROPS ─────────────────────────────────────────────────────────────────────

interface WelcomeScreenProps {
  bible: Territory[]
}

// ── COMPONENT ─────────────────────────────────────────────────────────────────

export function WelcomeScreen({ bible }: WelcomeScreenProps) {
  const { selectTerritory } = useRatesStore()

  const stats = useMemo(() => {
    const confirmed = bible.reduce(
      (s, t) => s + t.agreements.filter(a => a.status === 'confirmed').length, 0
    )
    const unions = bible.reduce((s, t) => s + t.agreements.length, 0)
    return { territories: bible.length, confirmed, unions }
  }, [bible])

  const pins = useMemo(() =>
    PINNED_IDS.map(id => bible.find(t => t.id === id)).filter(Boolean) as Territory[],
    [bible]
  )

  const byRegion = useMemo(() => {
    const map = new Map<TerritoryRegion, Territory[]>()
    bible.forEach(t => {
      if (!map.has(t.region)) map.set(t.region, [])
      map.get(t.region)!.push(t)
    })
    return map
  }, [bible])

  return (
    <div className="flex-1 overflow-y-auto">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="px-7 pt-7 pb-5 border-b border-border">
        <div className="flex items-start gap-3.5 mb-4">
          {/* Logo mark */}
          <div className="w-10 h-10 flex-shrink-0 rounded-md bg-gold-glow border border-gold/20
                          flex items-center justify-center text-xl">
            🌍
          </div>
          <div>
            <h1 className="font-syne font-black text-2xl tracking-tight mb-1">
              Global Production Rates Bible
            </h1>
            <p className="text-sm text-text-2 leading-relaxed max-w-xl">
              Source-verified union rates, working rules, and incentives for {stats.territories} territories.
              Built for deal memos, timecard queries, and production accounting.
              Select any territory from the sidebar, or use the quick-access cards below.
            </p>
          </div>
        </div>

        {/* Stat pills */}
        <div className="flex gap-2 flex-wrap">
          {[
            { value: stats.territories, label: 'Territories' },
            { value: stats.confirmed,   label: 'Confirmed agreements' },
            { value: 19,                label: 'UK BECTU branches' },
            { value: stats.unions,      label: 'Union / CBA sources' },
          ].map(s => (
            <div key={s.label}
              className="flex items-center gap-2 bg-bg-e border border-border rounded-sm px-3 py-1.5">
              <span className="font-mono text-lg font-medium text-gold">{s.value}</span>
              <span className="font-syne font-bold text-2xs uppercase tracking-wide text-text-3">
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="px-7 py-5 flex flex-col gap-6">

        {/* ── Quick access pins ────────────────────────────────────────────── */}
        <section>
          <SectionTitle>Quick access — most-used territories</SectionTitle>
          <div className="grid grid-cols-3 gap-1.5">
            {pins.map(t => {
              const conf = t.agreements.filter(a => a.status === 'confirmed').length
              return (
                <button
                  key={t.id}
                  onClick={() => selectTerritory(t.id)}
                  className="flex items-center gap-2 p-2.5 bg-bg-s border border-border rounded-md
                             text-left hover:border-border-mid hover:bg-bg-e transition-all"
                >
                  <span className="text-xl leading-none">{t.flag}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-syne font-bold text-xs text-text-1 truncate">{t.name}</div>
                    <div className="text-2xs text-text-3">{t.agreements.length} agreements</div>
                  </div>
                  <span className="font-mono text-xs text-success flex-shrink-0">{conf}✓</span>
                </button>
              )
            })}
          </div>
        </section>

        {/* ── How to use ───────────────────────────────────────────────────── */}
        <section>
          <SectionTitle>How to use this tool</SectionTitle>
          <div className="grid grid-cols-2 gap-2">
            {HOW_TO.map(card => (
              <div key={card.title}
                className="flex gap-2.5 p-3 bg-bg-e border border-border rounded-md">
                <div className={`w-7 h-7 rounded-md flex items-center justify-center text-sm flex-shrink-0 ${card.color}`}>
                  {card.icon}
                </div>
                <div>
                  <div className="font-syne font-bold text-xs text-text-1 mb-0.5">{card.title}</div>
                  <div className="text-sm text-text-2 leading-relaxed">{card.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── All territories ──────────────────────────────────────────────── */}
        <section>
          <SectionTitle>All territories by region</SectionTitle>
          <div className="grid grid-cols-4 gap-1.5">
            {Array.from(byRegion.entries()).map(([region, territories]) => {
              const rc = territories.reduce(
                (s, t) => s + t.agreements.filter(a => a.status === 'confirmed').length, 0
              )
              return (
                <button
                  key={region}
                  onClick={() => selectTerritory(territories[0].id)}
                  className="p-2.5 bg-bg-e border border-border rounded-md text-left
                             hover:border-border-mid hover:bg-bg-h transition-all"
                >
                  <div className="font-syne font-bold text-xs text-text-2 mb-1">{region}</div>
                  <div className="text-2xs text-text-3 mb-1.5">
                    {territories.length} territories · {rc} confirmed
                  </div>
                  <div className="flex gap-0.5 flex-wrap text-sm">
                    {territories.map(t => (
                      <span key={t.id} title={t.name}>{t.flag}</span>
                    ))}
                  </div>
                </button>
              )
            })}
          </div>
        </section>

      </div>
    </div>
  )
}

// ── SECTION TITLE ─────────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5 mb-2">
      <span className="font-syne font-bold text-2xs uppercase tracking-wide-xl text-text-3 flex-shrink-0">
        {children}
      </span>
      <div className="flex-1 h-px bg-border" />
    </div>
  )
}
