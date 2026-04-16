import { STATUS_LABELS, STATUS_COLORS } from '../../api/kateDealMemoApi';
import type { DealMemoStatus } from '../../api/kateDealMemoApi';

export default function StatusBadge({ status, className = '' }: { status: DealMemoStatus; className?: string }) {
  const c = STATUS_COLORS[status] ?? STATUS_COLORS.draft;
  const label = STATUS_LABELS[status] ?? status;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[10px] font-display font-bold uppercase tracking-wider ${c.fg} ${c.bg} ${c.border} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${c.fg.replace('text-', 'bg-')}`} />
      {label}
    </span>
  );
}
