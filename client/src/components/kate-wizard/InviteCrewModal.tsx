import { useState } from 'react';
import { inviteCrewUser } from '../../api/kateDealMemoApi';

export default function InviteCrewModal({
  open,
  onClose,
  productionId,
  onInvited,
}: {
  open: boolean;
  onClose: () => void;
  productionId?: string;
  /** Called on success with { userId, email, name, tempPassword? } */
  onInvited: (result: { userId: string; email: string; name: string; tempPassword?: string }) => void;
}) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  if (!open) return null;

  async function submit() {
    if (!email.trim() || !name.trim() || busy) return;
    setBusy(true);
    setErr(null);
    try {
      const res = await inviteCrewUser({ email: email.trim(), name: name.trim(), productionId });
      onInvited({
        userId: res.user._id,
        email: res.user.email,
        name: res.user.name,
        tempPassword: res.tempPassword,
      });
      setEmail('');
      setName('');
    } catch (e: any) {
      setErr(e?.response?.data?.error || e?.message || 'Failed to invite.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-bg-surface border border-border rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-[14px] font-display font-bold text-text-1">Invite Crew Member</h3>
          <p className="mt-1 text-[11px] text-text-4">
            Creates a login account. Share the temp password out-of-band — they can change it after first login.
          </p>
        </div>
        <div className="px-5 py-4 space-y-3">
          <div>
            <label className="text-[10px] text-text-4 uppercase tracking-wide font-display font-bold">Full name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full bg-bg-elevated border border-border rounded-lg px-3 py-2 text-[13px] text-text-1 focus:outline-none focus:border-gold"
              placeholder="e.g. Marcus Reid"
            />
          </div>
          <div>
            <label className="text-[10px] text-text-4 uppercase tracking-wide font-display font-bold">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full bg-bg-elevated border border-border rounded-lg px-3 py-2 text-[13px] text-text-1 focus:outline-none focus:border-gold"
              placeholder="marcus@example.com"
            />
          </div>
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
            disabled={!email.trim() || !name.trim() || busy}
            className={`px-4 py-2 text-[12px] font-display font-bold rounded-lg transition-colors ${
              email.trim() && name.trim() && !busy
                ? 'bg-gold text-bg hover:bg-gold/90'
                : 'bg-bg-elevated text-text-4 border border-border cursor-not-allowed'
            }`}
          >
            {busy ? 'Creating…' : 'Invite & Create Account'}
          </button>
        </div>
      </div>
    </div>
  );
}
