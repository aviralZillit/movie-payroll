import { useState, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

/**
 * HH:MM time input — auto-formats as you type.
 * Type "06" → becomes "06:" automatically. Type "0630" → becomes "06:30" and auto-advances.
 * Only digits allowed. Colon auto-inserted. Invalid times rejected on blur.
 */
export default function TimeInput({
  value = "",
  onChange,
  placeholder = "HH:MM",
  disabled = false,
  invalid = false,
  className,
  ...props
}) {
  const [localValue, setLocalValue] = useState(value);
  const [focused, setFocused] = useState(false);
  const committedRef = useRef(null); // tracks the value we committed via onChange
  const inputRef = useRef(null);

  // Wrap onChange to track what we committed
  const commitChange = useCallback((val) => {
    committedRef.current = val;
    onChange?.(val);
  }, [onChange]);

  // Sync external value changes — but don't overwrite a value we just committed
  // until the parent actually confirms it (prop changes to match our commit)
  if (!focused && value !== localValue) {
    if (committedRef.current === null || value === committedRef.current) {
      setLocalValue(value);
      committedRef.current = null;
    }
  }
  // Clear committed ref once parent catches up
  if (value === committedRef.current) {
    committedRef.current = null;
  }

  const formatTime = (h, m) =>
    `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;

  const parseTime = useCallback((str) => {
    if (!str) return null;
    const digits = str.replace(/[^0-9]/g, "");
    let hours, minutes;

    if (digits.length === 3) {
      hours = parseInt(digits.slice(0, 1), 10);
      minutes = parseInt(digits.slice(1), 10);
    } else if (digits.length >= 4) {
      hours = parseInt(digits.slice(0, 2), 10);
      minutes = parseInt(digits.slice(2, 4), 10);
    } else if (str.includes(":")) {
      const [h, m] = str.split(":");
      hours = parseInt(h, 10);
      minutes = parseInt(m || "0", 10);
    } else {
      return null;
    }

    if (isNaN(hours) || isNaN(minutes)) return null;
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
    return formatTime(hours, minutes);
  }, []);

  const advanceToNext = useCallback(() => {
    setTimeout(() => {
      const inputs = [...document.querySelectorAll('input[inputmode="numeric"]')];
      const idx = inputs.indexOf(inputRef.current);
      if (idx >= 0 && idx < inputs.length - 1) {
        inputs[idx + 1].focus();
      }
    }, 30);
  }, []);

  const handleChange = (e) => {
    let raw = e.target.value;

    // Strip everything except digits and colon
    raw = raw.replace(/[^0-9:]/g, "");

    // Only allow one colon
    const colonCount = (raw.match(/:/g) || []).length;
    if (colonCount > 1) return;

    // Auto-insert colon after 2 digits if user is typing without colon
    const digits = raw.replace(/:/g, "");
    if (!raw.includes(":") && digits.length === 2) {
      const h = parseInt(digits, 10);
      if (h >= 0 && h <= 23) {
        raw = digits + ":";
      }
    }

    // Limit total length to 5 (HH:MM)
    if (raw.length > 5) return;

    setLocalValue(raw);

    // Auto-commit when we have a full valid time (4 digits)
    if (digits.length === 4) {
      const parsed = parseTime(raw);
      if (parsed) {
        setLocalValue(parsed);
        commitChange(parsed);
        advanceToNext();
      }
    }
  };

  const handleBlur = () => {
    setFocused(false);
    const parsed = parseTime(localValue);
    if (parsed) {
      setLocalValue(parsed);
      if (parsed !== value) commitChange(parsed);
    } else if (localValue === "" || localValue === ":") {
      setLocalValue("");
      if (value) commitChange("");
    } else {
      // Invalid — revert
      setLocalValue(value || "");
    }
  };

  const handleFocus = (e) => {
    setFocused(true);
    e.target.select();
  };

  const handleKeyDown = (e) => {
    // Block non-numeric keys (except colon, backspace, delete, arrows, tab, enter)
    const allowed = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Tab", "Enter", ":", "Home", "End"];
    if (!allowed.includes(e.key) && !/^[0-9]$/.test(e.key)) {
      e.preventDefault();
      return;
    }

    if (e.key === "Enter" || e.key === "Tab") {
      const parsed = parseTime(localValue);
      if (parsed) {
        setLocalValue(parsed);
        if (parsed !== value) commitChange(parsed);
      }
      if (e.key === "Enter") {
        e.preventDefault();
        advanceToNext();
        return;
      }
    }

    // Arrow up/down: ±15 min (shift: ±1 hr)
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      const parsed = parseTime(localValue || value || "00:00");
      if (!parsed) return;

      const [h, m] = parsed.split(":").map(Number);
      let total = h * 60 + m;
      const step = e.shiftKey ? 60 : 15;

      total = e.key === "ArrowUp"
        ? Math.min(total + step, 23 * 60 + 59)
        : Math.max(total - step, 0);

      const newVal = formatTime(Math.floor(total / 60), total % 60);
      setLocalValue(newVal);
      commitChange(newVal);
    }
  };

  return (
    <input
      ref={inputRef}
      type="text"
      inputMode="numeric"
      value={localValue}
      onChange={handleChange}
      onBlur={handleBlur}
      onFocus={handleFocus}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      disabled={disabled}
      maxLength={5}
      aria-invalid={invalid || undefined}
      className={cn(
        "h-8 w-[72px] rounded-md border border-input bg-transparent px-2 py-1 text-center text-sm tabular-nums transition-colors",
        "outline-none placeholder:text-muted-foreground/50",
        "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30",
        "disabled:pointer-events-none disabled:opacity-50",
        invalid && "border-destructive ring-1 ring-destructive/20",
        className
      )}
      {...props}
    />
  );
}
