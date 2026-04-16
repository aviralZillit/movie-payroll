import { useState } from 'react';
import type { DealMemoComment } from '../../api/kateDealMemoApi';

export default function CommentsPanel({
  comments,
  onPost,
  onRequestChanges,
  canRequestChanges,
  disabled,
}: {
  comments: DealMemoComment[];
  onPost: (text: string) => Promise<void>;
  onRequestChanges?: (reason: string) => Promise<void>;
  canRequestChanges?: boolean;
  disabled?: boolean;
}) {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<'comment' | 'request_changes'>('comment');

  async function handleSend() {
    if (!text.trim() || busy) return;
    setBusy(true);
    try {
      if (mode === 'request_changes' && onRequestChanges) {
        await onRequestChanges(text.trim());
      } else {
        await onPost(text.trim());
      }
      setText('');
      setMode('comment');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-lg border border-border bg-bg-surface">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <h3 className="text-[12px] font-display font-bold text-text-1 uppercase tracking-wider">
          Comments & Negotiation
        </h3>
        <span className="text-[10px] text-text-4">{comments.length} messages</span>
      </div>

      {/* Thread */}
      <div className="max-h-[360px] overflow-y-auto divide-y divide-border">
        {comments.length === 0 ? (
          <div className="px-4 py-8 text-center text-[12px] text-text-4 italic">
            No comments yet. Start the conversation.
          </div>
        ) : (
          comments.map((c, i) => (
            <div key={c._id ?? i} className={`px-4 py-3 ${c.kind === 'system' ? 'bg-bg-elevated/30' : ''}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[11px] font-display font-bold ${
                  c.kind === 'request_changes' ? 'text-orange-400'
                  : c.kind === 'system' ? 'text-text-4'
                  : 'text-text-1'
                }`}>
                  {c.authorName || 'Unknown'}
                </span>
                <span className="text-[9px] uppercase tracking-wider text-text-4">{c.authorRole}</span>
                {c.kind === 'request_changes' && (
                  <span className="text-[9px] px-1.5 py-0.5 bg-orange-400/10 border border-orange-400/30 text-orange-400 uppercase rounded font-bold">
                    Request Changes
                  </span>
                )}
                {c.kind === 'system' && (
                  <span className="text-[9px] px-1.5 py-0.5 bg-bg-elevated border border-border text-text-4 uppercase rounded font-bold">
                    System
                  </span>
                )}
                <span className="ml-auto text-[10px] text-text-4 font-mono">
                  {new Date(c.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="text-[12px] text-text-2 leading-relaxed whitespace-pre-wrap">{c.text}</p>
            </div>
          ))
        )}
      </div>

      {/* Composer */}
      {!disabled && (
        <div className="px-4 py-3 border-t border-border space-y-2">
          {canRequestChanges && (
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setMode('comment')}
                className={`px-2 py-1 text-[10px] rounded font-display font-bold uppercase tracking-wider transition-colors ${
                  mode === 'comment' ? 'bg-gold text-bg' : 'text-text-3 hover:text-text-1'
                }`}
              >
                Comment
              </button>
              <button
                type="button"
                onClick={() => setMode('request_changes')}
                className={`px-2 py-1 text-[10px] rounded font-display font-bold uppercase tracking-wider transition-colors ${
                  mode === 'request_changes'
                    ? 'bg-orange-400 text-bg'
                    : 'text-text-3 hover:text-orange-400'
                }`}
              >
                Request Changes
              </button>
            </div>
          )}
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={2}
            placeholder={mode === 'request_changes' ? 'Describe the change you want…' : 'Add a comment…'}
            className="w-full bg-bg-elevated border border-border rounded-lg px-3 py-2 text-[12px] text-text-1 focus:outline-none focus:border-gold transition-colors resize-y"
          />
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSend}
              disabled={!text.trim() || busy}
              className={`px-3 py-1.5 text-[11px] font-display font-bold uppercase tracking-wider rounded-lg transition-colors ${
                text.trim() && !busy
                  ? mode === 'request_changes'
                    ? 'bg-orange-400 text-bg hover:bg-orange-400/90'
                    : 'bg-gold text-bg hover:bg-gold/90'
                  : 'bg-bg-elevated text-text-4 cursor-not-allowed border border-border'
              }`}
            >
              {busy ? 'Sending…' : mode === 'request_changes' ? 'Send Request' : 'Send'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
