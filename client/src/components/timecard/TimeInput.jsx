import { useState, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

/**
 * HH:MM time input component with validation and keyboard navigation.
 * Accepts/displays time in 24-hour format (e.g., "09:30", "17:45").
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
  const inputRef = useRef(null);

  // Sync external value changes
  if (!focused && value !== localValue) {
    setLocalValue(value);
  }

  const parseTime = useCallback((str) => {
    if (!str) return null;
    const cleaned = str.replace(/[^0-9:]/g, "");

    // Handle various formats: "0930", "09:30", "930"
    let hours, minutes;

    if (cleaned.includes(":")) {
      const [h, m] = cleaned.split(":");
      hours = parseInt(h, 10);
      minutes = parseInt(m, 10);
    } else if (cleaned.length >= 3) {
      if (cleaned.length === 3) {
        hours = parseInt(cleaned.slice(0, 1), 10);
        minutes = parseInt(cleaned.slice(1), 10);
      } else {
        hours = parseInt(cleaned.slice(0, 2), 10);
        minutes = parseInt(cleaned.slice(2, 4), 10);
      }
    } else {
      return null;
    }

    if (isNaN(hours) || isNaN(minutes)) return null;
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  }, []);

  const handleChange = (e) => {
    const raw = e.target.value;
    // Allow user to type freely, but limit length
    if (raw.length > 5) return;
    setLocalValue(raw);
  };

  const handleBlur = () => {
    setFocused(false);
    const parsed = parseTime(localValue);
    if (parsed) {
      setLocalValue(parsed);
      if (parsed !== value) {
        onChange?.(parsed);
      }
    } else if (localValue === "") {
      onChange?.("");
    } else {
      // Revert to last valid value
      setLocalValue(value || "");
    }
  };

  const handleFocus = (e) => {
    setFocused(true);
    e.target.select();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.target.blur();
    }

    // Arrow up/down to increment/decrement minutes
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      const parsed = parseTime(localValue || "00:00");
      if (!parsed) return;

      const [h, m] = parsed.split(":").map(Number);
      let totalMinutes = h * 60 + m;
      const step = e.shiftKey ? 60 : 15;

      if (e.key === "ArrowUp") {
        totalMinutes = Math.min(totalMinutes + step, 23 * 60 + 59);
      } else {
        totalMinutes = Math.max(totalMinutes - step, 0);
      }

      const newH = Math.floor(totalMinutes / 60);
      const newM = totalMinutes % 60;
      const newVal = `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}`;
      setLocalValue(newVal);
      onChange?.(newVal);
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
