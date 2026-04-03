'use client'

// ─────────────────────────────────────────────────────────────────────────────
// Zillit Global Rates Bible — Root Component
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect } from 'react'
import { BIBLE } from '@/data/ratesData'
import { useRatesStore, useSelectedId, useAiOpen } from './useRatesStore'
import { Sidebar }          from './Sidebar'
import { WelcomeScreen }    from './WelcomeScreen'
import { TerritoryView }    from './TerritoryView'
import { AIAssistantPanel } from './AIAssistantPanel'

// ── GOOGLE FONTS ─────────────────────────────────────────────────────────────
// In Next.js 14 App Router, load these in your root layout.tsx instead:
//
//   import { Syne, DM_Sans, DM_Mono } from 'next/font/google'
//   const syne   = Syne({ subsets: ['latin'], weight: ['400','600','700','800'] })
//   const dmSans = DM_Sans({ subsets: ['latin'], weight: ['300','400','500','600'] })
//   const dmMono = DM_Mono({ subsets: ['latin'], weight: ['400','500'] })

export function GlobalRatesBible() {
  const selectedId = useSelectedId()
  const aiOpen     = useAiOpen()
  const { toggleAI, clearSelection } = useRatesStore()

  // ── Keyboard shortcuts ─────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // / → focus sidebar search
      if (e.key === '/' && e.target instanceof HTMLElement &&
          !['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
        e.preventDefault()
        document.getElementById('sb-search')?.focus()
      }
      // Esc → blur active input or go home
      if (e.key === 'Escape') {
        const active = document.activeElement as HTMLElement
        if (['INPUT', 'TEXTAREA'].includes(active?.tagName)) {
          active.blur()
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-bg text-text-1 font-dm text-md">

      {/* ── TOP BAR ────────────────────────────────────────────────────────── */}
      <header className="h-12 flex-shrink-0 flex items-center gap-2.5 px-3.5 bg-bg-s border-b border-border">
        <span className="font-syne font-black text-lg text-gold tracking-tight">
          Zillit
        </span>
        <div className="w-px h-5 bg-border" />
        <span className="font-syne font-bold text-md text-text-1">
          Global Production Rates Bible
        </span>
        <span className="text-sm text-text-3 hidden sm:block" id="header-stats">
          {/* Populated via TerritoryCount component or useEffect */}
        </span>

        <div className="ml-auto flex items-center gap-1.5">
          {/* Back to home — only visible when a territory is selected */}
          {selectedId && (
            <button
              onClick={clearSelection}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-syne font-bold
                         text-text-3 border border-transparent rounded-sm
                         hover:text-text-2 hover:border-border transition-all"
            >
              ← Home
            </button>
          )}
          {/* AI toggle */}
          <button
            onClick={toggleAI}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-syne font-bold
                       bg-gold-glow text-gold border border-gold/25 rounded-sm
                       hover:bg-gold/15 transition-all"
          >
            ✦ {aiOpen ? 'Close AI' : 'Ask AI'}
          </button>
        </div>
      </header>

      {/* ── SHELL ──────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">

        {/* Sidebar — always visible */}
        <Sidebar bible={BIBLE} />

        {/* Main content area */}
        <main className="flex-1 flex overflow-hidden">
          <div className="flex-1 flex flex-col overflow-hidden">
            {selectedId
              ? <TerritoryView territory={BIBLE.find(t => t.id === selectedId)!} />
              : <WelcomeScreen bible={BIBLE} />
            }
          </div>

          {/* AI panel — slides in from the right */}
          <AIAssistantPanel />
        </main>
      </div>
    </div>
  )
}
