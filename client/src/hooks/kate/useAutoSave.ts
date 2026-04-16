import { useEffect, useRef } from 'react';
import { put } from '../../api/kateClient';
import { useDealMemoStore } from '../../store/kate/useDealMemoStore';
import type { DealMemoData } from '../types/index';

const AUTO_SAVE_DELAY = 30_000; // 30 seconds

/**
 * Debounced auto-save hook.
 * Watches the deal memo store and PUTs to /api/deal-memos/:id every 30s
 * after the last change, but only if a memo ID exists.
 */
export function useAutoSave() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef<string>('');

  useEffect(() => {
    const unsubscribe = useDealMemoStore.subscribe((state) => {
      const { currentMemoId, update: _u, goStep: _g, reset: _r, setCurrentMemoId: _s, ...data } = state;

      if (!currentMemoId) return;

      const serialized = JSON.stringify(data);
      if (serialized === lastSavedRef.current) return;

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(async () => {
        try {
          await put<DealMemoData>(`/deal-memos/${currentMemoId}`, data);
          lastSavedRef.current = serialized;
        } catch (err) {
          console.error('[AutoSave] Failed to save deal memo:', err);
        }
      }, AUTO_SAVE_DELAY);
    });

    return () => {
      unsubscribe();
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);
}
