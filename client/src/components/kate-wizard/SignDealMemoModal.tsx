import { useState } from 'react';

export default function SignDealMemoModal({
  open,
  onClose,
  onConfirm,
  crewName,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (typedName: string) => Promise<void>;
  crewName: string;
}) {
  const [typedName, setTypedName] = useState(crewName ?? '');
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  if (!open) return null;

  async function submit() {
    if (!typedName.trim() || !agreed || busy) return;
    setBusy(true);
    setErr(null);
    try {
      await onConfirm(typedName.trim());
      onClose();
    } catch (e: any) {
      setErr(e?.response?.data?.error || e?.message || 'Failed to sign.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-bg-surface border border-border rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-[14px] font-display font-bold text-text-1">Sign Deal Memo</h3>
        </div>
        <div className="px-5 py-4 space-y-3">
          <p className="text-[12px] text-text-2 leading-relaxed">
            By signing, you agree to the terms of this deal memo as presented. This signature is legally binding.
          </p>

          <div>
            <label className="text-[10px] text-text-4 uppercase tracking-wide font-display font-bold">
              Typed full name
            </label>
            <input
              type="text"
              value={typedName}
              onChange={(e) => setTypedName(e.target.value)}
              className="mt-1 w-full bg-bg-elevated border border-border rounded-lg px-3 py-2 text-[13px] text-text-1 focus:outline-none focus:border-gold"
              placeholder="Full legal name"
            />
          </div>

          <label className="flex items-start gap-2 text-[12px] text-text-2 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 accent-gold"
            />
            <span>
              I understand that typing my name above and clicking Sign constitutes a legally binding
              electronic signature and I agree to all the terms of this deal memo.
            </span>
          </label>

          {err && (
            <div className="text-[11px] text-red-400 bg-red-400/10 border border-red-400/30 rounded px-2 py-1">
              {err}
            </div>
          )}
        </div>
        <div className="px-5 py-3 border-t border-border flex items-center gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="px-4 py-2 text-[12px] font-display font-bold text-text-3 border border-border rounded-lg hover:bg-bg-hover transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!typedName.trim() || !agreed || busy}
            className={`px-4 py-2 text-[12px] font-display font-bold rounded-lg transition-colors ${
              typedName.trim() && agreed && !busy
                ? 'bg-gold text-bg hover:bg-gold/90'
                : 'bg-bg-elevated text-text-4 border border-border cursor-not-allowed'
            }`}
          >
            {busy ? 'Signing…' : 'Sign Deal Memo'}
          </button>
        </div>
      </div>
    </div>
  );
}
