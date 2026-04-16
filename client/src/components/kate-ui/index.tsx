// ============================================================
// KATE UI → SHADCN BRIDGE
// Same API as Kate's custom components, renders using
// movie-payroll's shadcn/ui for native look & feel.
// All 10 step files import from this file — zero step changes needed.
// ============================================================

import { useState, type ReactNode } from 'react';
import {
  Card as SCard,
  CardHeader as SCardHeader,
  CardContent as SCardContent,
} from '@/components/ui/card';
import { Badge as SBadge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

// We need the store for per-field required toggle
let _useDealMemoStore: any = null;
try {
  // Dynamic import to avoid circular deps — will be undefined on first render, then hydrate
  import('../../store/kate/useDealMemoStore').then(m => { _useDealMemoStore = m.useDealMemoStore; });
} catch { /* ok */ }

// ── CARD ──────────────────────────────────────────────────────

type CardAccent = 'gold' | 'teal' | 'blue' | 'orange' | 'red' | 'green' | 'purple' | 'none';

const ACCENT_BORDER: Record<CardAccent, string> = {
  gold:   'border-l-4 border-l-amber-500',
  teal:   'border-l-4 border-l-teal-500',
  blue:   'border-l-4 border-l-blue-500',
  orange: 'border-l-4 border-l-orange-500',
  red:    'border-l-4 border-l-red-500',
  green:  'border-l-4 border-l-green-500',
  purple: 'border-l-4 border-l-purple-500',
  none:   '',
};

interface CardProps { children: ReactNode; accent?: CardAccent; className?: string; }

export function Card({ children, accent = 'none', className = '' }: CardProps) {
  return (
    <SCard className={cn(ACCENT_BORDER[accent], 'mb-4', className)}>
      {children}
    </SCard>
  );
}

export function CardHeader({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <SCardHeader className={cn('flex flex-row items-center gap-2 border-b pb-3', className)}>
      {children}
    </SCardHeader>
  );
}

export function CardBody({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <SCardContent className={cn('pt-4', className)}>{children}</SCardContent>;
}

// ── FIELD ─────────────────────────────────────────────────────

interface FieldProps {
  label: ReactNode;
  required?: boolean;
  hint?: string;
  children: ReactNode;
  crewCompleted?: boolean;
  hasError?: boolean;
  fieldId?: string;
  fieldKey?: string;
}

export function Field({ label, required, hint, children, crewCompleted, hasError, fieldId }: FieldProps) {
  return (
    <div className={cn(hasError ? 'ring-1 ring-destructive rounded-lg p-1' : '')} id={fieldId ? `field-${fieldId}` : undefined}>
      <Label className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5 flex-wrap">
        {label}
        {required && <span className="text-destructive text-xs font-bold">*</span>}
        {crewCompleted && (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold bg-orange-100 text-orange-700 border border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800">
            Crew to complete
          </span>
        )}
      </Label>
      {children}
      {hint && <p className="mt-1 text-[10px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

// ── SELECT ────────────────────────────────────────────────────

interface SelectProps {
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function Select({ value, onChange, options, placeholder, className = '', disabled }: SelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={cn(
        'h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1.5 text-sm transition-colors',
        'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

// ── TOGGLE ────────────────────────────────────────────────────

export function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return <Switch checked={on} onCheckedChange={onToggle} />;
}

// ── BADGE ─────────────────────────────────────────────────────

type BadgeVariant = 'default' | 'gold' | 'red' | 'green' | 'blue' | 'orange' | 'purple' | 'teal';

const BADGE_COLORS: Record<BadgeVariant, string> = {
  default: 'bg-secondary text-secondary-foreground',
  gold:    'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800',
  red:     'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
  green:   'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
  blue:    'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
  orange:  'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800',
  purple:  'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800',
  teal:    'bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-800',
};

export function Badge({ variant = 'default', children, className = '' }: { variant?: BadgeVariant; children: ReactNode; className?: string }) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-semibold',
      BADGE_COLORS[variant],
      className
    )}>
      {children}
    </span>
  );
}

// ── ALERT ─────────────────────────────────────────────────────

type AlertVariant = 'gold' | 'blue' | 'green' | 'red' | 'orange' | 'purple' | 'teal';

const ALERT_STYLES: Record<AlertVariant, { bg: string; border: string; text: string; icon: string }> = {
  gold:   { bg: 'bg-amber-50 dark:bg-amber-950/20',   border: 'border-amber-200 dark:border-amber-800', text: 'text-amber-800 dark:text-amber-200',   icon: '💡' },
  blue:   { bg: 'bg-blue-50 dark:bg-blue-950/20',     border: 'border-blue-200 dark:border-blue-800',   text: 'text-blue-800 dark:text-blue-200',     icon: 'ℹ️' },
  green:  { bg: 'bg-green-50 dark:bg-green-950/20',   border: 'border-green-200 dark:border-green-800', text: 'text-green-800 dark:text-green-200',   icon: '✓' },
  red:    { bg: 'bg-red-50 dark:bg-red-950/20',       border: 'border-red-200 dark:border-red-800',     text: 'text-red-800 dark:text-red-200',       icon: '⚠️' },
  orange: { bg: 'bg-orange-50 dark:bg-orange-950/20', border: 'border-orange-200 dark:border-orange-800', text: 'text-orange-800 dark:text-orange-200', icon: '⚡' },
  purple: { bg: 'bg-purple-50 dark:bg-purple-950/20', border: 'border-purple-200 dark:border-purple-800', text: 'text-purple-800 dark:text-purple-200', icon: '✦' },
  teal:   { bg: 'bg-teal-50 dark:bg-teal-950/20',     border: 'border-teal-200 dark:border-teal-800',   text: 'text-teal-800 dark:text-teal-200',     icon: 'ℹ️' },
};

export function Alert({ variant = 'blue', children, className = '' }: { variant?: AlertVariant; children: ReactNode; className?: string }) {
  const s = ALERT_STYLES[variant] ?? ALERT_STYLES.blue;
  return (
    <div className={cn('flex items-start gap-2 rounded-lg border px-4 py-3 text-sm', s.bg, s.border, s.text, className)}>
      <span className="flex-shrink-0 mt-0.5 text-base">{s.icon}</span>
      <div className="flex-1">{children}</div>
    </div>
  );
}

// ── CURRENCY INPUT ────────────────────────────────────────────

export function CurrencyInput({
  value, onChange, symbol = '£', placeholder, disabled, readOnly, hint,
}: {
  value: number; onChange: (val: number) => void; symbol?: string;
  placeholder?: string; disabled?: boolean; readOnly?: boolean; hint?: string;
}) {
  const [focused, setFocused] = useState(false);
  const display = focused ? String(value || '') : (value ? `${symbol}${value.toFixed(2)}` : '');

  return (
    <div>
      <Input
        type={focused ? 'number' : 'text'}
        value={display}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(parseFloat(e.target.value) || 0)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder || `${symbol}0.00`}
        disabled={disabled}
        readOnly={readOnly}
      />
      {hint && <p className="mt-1 text-[10px] text-muted-foreground">{hint}</p>}
    </div>
  );
}
