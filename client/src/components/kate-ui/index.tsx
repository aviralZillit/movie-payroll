// ============================================================
// ZILLIT CODA — DEAL MEMO WIZARD
// Shared UI Components — Premium Edition
// ============================================================

import { useState, useEffect, useRef, type ReactNode } from 'react';
import { useDealMemoStore } from '../../store/kate/useDealMemoStore';

// ── CARD ──────────────────────────────────────────────────────

type CardAccent = 'gold' | 'teal' | 'blue' | 'orange' | 'red' | 'green' | 'purple' | 'none';

const ACCENT_CLASSES: Record<CardAccent, string> = {
  gold:   'border-l-[3px] border-l-gold/50',
  teal:   'border-l-[3px] border-l-teal-400/50',
  blue:   'border-l-[3px] border-l-blue-400/50',
  orange: 'border-l-[3px] border-l-orange-400/50',
  red:    'border-l-[3px] border-l-red-400/50',
  green:  'border-l-[3px] border-l-green-400/50',
  purple: 'border-l-[3px] border-l-purple-400/50',
  none:   '',
};

interface CardProps { children: ReactNode; accent?: CardAccent; className?: string; }

export function Card({ children, accent = 'none', className = '' }: CardProps) {
  return (
    <div className={`relative bg-bg-surface border border-border rounded-lg overflow-hidden card-hover card-enter ${ACCENT_CLASSES[accent]} ${className}`}
      style={{ borderTopColor: 'rgba(255,255,255,0.06)' }}
    >
      {/* Subtle top highlight for depth illusion */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`flex items-center px-4 py-3 border-b border-border text-[13px] ${className}`}>
      {children}
    </div>
  );
}

export function CardBody({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`p-4 ${className}`}>
      {children}
    </div>
  );
}

// ── ALERT ────────────────────────────────────────────────────

type AlertVariant = 'blue' | 'gold' | 'orange' | 'red' | 'green' | 'teal' | 'purple';

const ALERT_CLASSES: Record<AlertVariant, string> = {
  blue:   'bg-blue/10 border-blue-400/20 text-blue-300',
  gold:   'bg-gold/10 border-gold/20 text-gold',
  orange: 'bg-orange/10 border-orange-400/20 text-orange-300',
  red:    'bg-red/10 border-red-400/20 text-red-300',
  green:  'bg-green/10 border-green-400/20 text-green-300',
  teal:   'bg-teal/10 border-teal-400/20 text-teal-300',
  purple: 'bg-purple/10 border-purple-400/20 text-purple-300',
};

const ALERT_ACCENT_COLORS: Record<AlertVariant, string> = {
  blue:   '#60a5fa',
  gold:   '#e8b84b',
  orange: '#fb923c',
  red:    '#f87171',
  green:  '#4ade80',
  teal:   '#2dd4bf',
  purple: '#c084fc',
};

const ALERT_ICONS: Record<AlertVariant, string> = {
  blue: '\u2139', gold: '\u2139', orange: '\u26A0', red: '\u26A0', green: '\u2713', teal: '\u2139', purple: '\u2139',
};

interface AlertProps { variant?: AlertVariant; children: ReactNode; className?: string; }

export function Alert({ variant = 'blue', children, className = '' }: AlertProps) {
  return (
    <div
      className={`relative flex items-start gap-2.5 border rounded-lg px-3.5 py-3 text-[12px] overflow-hidden ${ALERT_CLASSES[variant]} ${className}`}
    >
      {/* Left accent bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[4px] rounded-l-lg"
        style={{ backgroundColor: ALERT_ACCENT_COLORS[variant] }}
      />
      <span className="flex-shrink-0 mt-0.5 ml-1">{ALERT_ICONS[variant]}</span>
      <div>{children}</div>
    </div>
  );
}

// ── BADGE ────────────────────────────────────────────────────

type BadgeVariant = 'blue' | 'gold' | 'orange' | 'red' | 'green' | 'teal' | 'purple' | 'default';

const BADGE_CLASSES: Record<BadgeVariant, string> = {
  blue:    'bg-blue/10 border-blue-400/20 text-blue-400',
  gold:    'bg-gold/10 border-gold/20 text-gold',
  orange:  'bg-orange/10 border-orange-400/20 text-orange-400',
  red:     'bg-red/10 border-red-400/20 text-red-400',
  green:   'bg-green/10 border-green-400/20 text-green-400',
  teal:    'bg-teal/10 border-teal-400/20 text-teal-400',
  purple:  'bg-purple/10 border-purple-400/20 text-purple-400',
  default: 'bg-bg-hover border-border text-text-3',
};

interface BadgeProps { variant?: BadgeVariant; children: ReactNode; className?: string; }

export function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[9px] font-display font-bold uppercase tracking-wide shadow-sm ${BADGE_CLASSES[variant]} ${className}`}
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.15), 0 0 1px rgba(255,255,255,0.05)' }}
    >
      {children}
    </span>
  );
}

// ── TOGGLE ───────────────────────────────────────────────────

interface ToggleProps { on: boolean; onToggle: () => void; disabled?: boolean; }

export function Toggle({ on, onToggle, disabled = false }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      disabled={disabled}
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 transition-all duration-250 ease-out focus:outline-none focus:ring-2 focus:ring-gold/40 focus:ring-offset-1 focus:ring-offset-bg ${
        on ? 'bg-gold border-gold' : 'bg-bg-elevated border-border'
      } ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-white transition-all duration-250 ease-out mt-0.5 ${
          on ? 'translate-x-[20px]' : 'translate-x-0.5'
        }`}
        style={{
          boxShadow: on
            ? '0 1px 4px rgba(0,0,0,0.3), 0 0 8px rgba(232,184,75,0.2)'
            : '0 1px 3px rgba(0,0,0,0.2)',
        }}
      />
    </button>
  );
}

// ── CURRENCY INPUT ────────────────────────────────────────────

interface CurrencyInputProps {
  value: number;
  symbol: string;
  onChange: (val: string) => void;
  hint?: string;
  placeholder?: string;
  className?: string;
  readOnly?: boolean;
}

export function CurrencyInput({
  value, symbol, onChange, hint, placeholder = '0.00', className = '', readOnly = false
}: CurrencyInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [rawText, setRawText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Format for display when NOT focused
  const formatted = value > 0 ? `${symbol}${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}` : '';

  // Sync raw text when value changes externally (and input is not focused)
  useEffect(() => {
    if (!isFocused) {
      setRawText(value > 0 ? value.toString() : '');
    }
  }, [value, isFocused]);

  const handleFocus = () => {
    setIsFocused(true);
    setRawText(value > 0 ? value.toString() : '');
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Commit the value on blur
    onChange(rawText);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Allow digits, dots, and empty string while typing
    if (/^[0-9]*\.?[0-9]*$/.test(val) || val === '') {
      setRawText(val);
      // Live update so bidirectional sync works immediately
      onChange(val);
    }
  };

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="text"
        value={isFocused ? rawText : formatted}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={`${symbol}${placeholder}`}
        readOnly={readOnly}
        className={`w-full bg-bg-elevated border border-border rounded-lg px-3 py-2 text-[13px] font-mono text-text-1 focus:outline-none transition-all duration-150 ${
          readOnly ? 'text-text-3 cursor-default' : ''
        }`}
        style={isFocused && !readOnly ? {
          borderColor: '#e8b84b',
          boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.2), 0 0 0 3px rgba(232,184,75,0.1)',
        } : undefined}
      />
      {hint && <div className="mt-1 text-[10px] text-text-4 leading-relaxed">{hint}</div>}
    </div>
  );
}

// ── FIELD ────────────────────────────────────────────────────

interface FieldProps {
  label: ReactNode;
  required?: boolean;
  hint?: string;
  children: ReactNode;
  crewCompleted?: boolean;
  hasError?: boolean;
  fieldId?: string;
  /** Stable key (e.g. "step1.productionEntity"). When set, a clickable REQ pill appears;
   *  state persists in dealMemo.fieldRequired. `required` prop acts as the Kate-baseline default. */
  fieldKey?: string;
}

/** Derive a stable string key from a JSX label node — strips JSX & non-alnum, returns lowercased camel-ish */
function deriveFieldKey(label: ReactNode): string | null {
  if (typeof label === 'string') return label.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  if (typeof label === 'number') return String(label);
  // For JSX labels, attempt to extract string children
  if (label && typeof label === 'object' && 'props' in (label as any)) {
    const children = (label as any).props?.children;
    if (Array.isArray(children)) {
      const joined = children.filter((c) => typeof c === 'string').join(' ').trim();
      if (joined) return joined.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    } else if (typeof children === 'string') {
      return children.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
  }
  return null;
}

export function Field({ label, required, hint, children, crewCompleted, hasError, fieldId, fieldKey }: FieldProps) {
  const fieldRequired = useDealMemoStore((s) => s.fieldRequired);
  const updateStore = useDealMemoStore((s) => s.update);

  // Resolve key: explicit prop wins, else derive from label
  const effectiveKey = fieldKey ?? deriveFieldKey(label);

  // Resolve effective required state: store override → falls back to Kate baseline (required prop)
  const override = effectiveKey ? fieldRequired?.[effectiveKey] : undefined;
  const isRequired = override !== undefined ? override : !!required;

  const toggle = () => {
    if (!effectiveKey) return;
    const next = { ...(fieldRequired ?? {}), [effectiveKey]: !isRequired };
    updateStore({ fieldRequired: next });
  };

  return (
    <div className={hasError ? 'field-error' : ''} id={fieldId ? `field-${fieldId}` : undefined}>
      <label className="flex items-center gap-1.5 text-[11px] text-text-3 mb-1.5 flex-wrap">
        {label}
        {isRequired && <span className="text-red-400 text-[11px] leading-none">*</span>}
        {effectiveKey && (
          <button
            type="button"
            onClick={toggle}
            title={isRequired ? 'Required — click to make optional' : 'Optional — click to make required'}
            className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[8px] font-display font-bold uppercase rounded tracking-wide border transition-colors ${
              isRequired
                ? 'bg-red-400/10 border-red-400/30 text-red-400 hover:bg-red-400/20'
                : 'bg-bg-elevated border-border text-text-4 hover:text-text-2 hover:border-border-light'
            }`}
          >
            <span className={`w-1 h-1 rounded-full ${isRequired ? 'bg-red-400' : 'bg-text-4'}`} />
            Req
          </button>
        )}
        {crewCompleted && (
          <span className="px-1.5 py-0.5 bg-orange-400/10 border border-orange-400/20 text-orange-400 text-[8px] font-display font-bold uppercase rounded tracking-wide">
            Crew to complete
          </span>
        )}
      </label>
      {children}
      {hint && <div className="mt-1 text-[10px] text-text-4">{hint}</div>}
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
      onChange={e => onChange(e.target.value)}
      disabled={disabled}
      className={`w-full bg-bg-elevated border border-border rounded-lg px-3 py-2 text-[12px] text-text-1 focus:outline-none transition-all duration-150 disabled:opacity-50 ${className}`}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}
