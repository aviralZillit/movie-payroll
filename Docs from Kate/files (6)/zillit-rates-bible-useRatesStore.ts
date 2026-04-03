// ─────────────────────────────────────────────────────────────────────────────
// Zillit Global Rates Bible — Zustand State Store
// Manages all UI state for the rates bible: selection, tabs, filters, search.
// ─────────────────────────────────────────────────────────────────────────────

import { create } from 'zustand'
import { ActiveTab, AiMessage, RatesBibleState } from './types'

// ── STORE SHAPE ──────────────────────────────────────────────────────────────

interface RatesBibleStore extends RatesBibleState {
  // Territory selection
  selectTerritory: (id: string, tab?: ActiveTab) => void
  clearSelection: () => void

  // Tab navigation
  setTab: (tab: ActiveTab) => void

  // Union picker filter
  setAgrFilter: (agrId: string) => void

  // Content search (within a territory's rate rows)
  setContentQuery: (q: string) => void
  clearContentQuery: () => void

  // Sidebar search (filters territory list)
  setSidebarQuery: (q: string) => void

  // AI panel
  toggleAI: () => void
  openAI: () => void
  closeAI: () => void

  // AI conversation
  aiHistory: AiMessage[]
  addAiMessage: (msg: AiMessage) => void
  trimAiHistory: () => void
}

// ── STORE ────────────────────────────────────────────────────────────────────

export const useRatesStore = create<RatesBibleStore>((set) => ({
  // ── Initial state ──
  selectedId:    null,
  activeTab:     'rates',
  agrFilter:     'all',
  contentQuery:  '',
  sidebarQuery:  '',
  aiOpen:        false,
  aiHistory:     [],

  // ── Territory selection ──
  selectTerritory: (id, tab = 'rates') =>
    set({
      selectedId:   id,
      activeTab:    tab,
      agrFilter:    'all',
      contentQuery: '',
    }),

  clearSelection: () =>
    set({
      selectedId:   null,
      activeTab:    'rates',
      agrFilter:    'all',
      contentQuery: '',
    }),

  // ── Tab navigation ──
  setTab: (tab) => set({ activeTab: tab, agrFilter: 'all', contentQuery: '' }),

  // ── Union picker ──
  setAgrFilter: (agrId) => set({ agrFilter: agrId }),

  // ── Content search ──
  setContentQuery:   (q) => set({ contentQuery: q }),
  clearContentQuery: ()  => set({ contentQuery: '' }),

  // ── Sidebar search ──
  setSidebarQuery: (q) => set({ sidebarQuery: q }),

  // ── AI panel ──
  toggleAI: () => set((s) => ({ aiOpen: !s.aiOpen })),
  openAI:   () => set({ aiOpen: true }),
  closeAI:  () => set({ aiOpen: false }),

  // ── AI conversation ──
  addAiMessage: (msg) =>
    set((s) => ({ aiHistory: [...s.aiHistory, msg] })),

  // Trim to last 12 messages to keep context window manageable
  trimAiHistory: () =>
    set((s) => ({
      aiHistory: s.aiHistory.length > 12
        ? s.aiHistory.slice(-12)
        : s.aiHistory,
    })),
}))

// ── SELECTORS ────────────────────────────────────────────────────────────────
// Use these rather than full store subscriptions to minimise re-renders.

export const useSelectedId    = () => useRatesStore((s) => s.selectedId)
export const useActiveTab     = () => useRatesStore((s) => s.activeTab)
export const useAgrFilter     = () => useRatesStore((s) => s.agrFilter)
export const useContentQuery  = () => useRatesStore((s) => s.contentQuery)
export const useSidebarQuery  = () => useRatesStore((s) => s.sidebarQuery)
export const useAiOpen        = () => useRatesStore((s) => s.aiOpen)
export const useAiHistory     = () => useRatesStore((s) => s.aiHistory)
