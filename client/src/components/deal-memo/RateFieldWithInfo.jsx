import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { cn, formatCurrency } from "@/lib/utils";
import { CheckCircle2, AlertTriangle, Info, ExternalLink } from "lucide-react";
import { useValidateRate } from "@/hooks/useDealMemos";

/**
 * An input field for monetary rates that validates against union minimums.
 *
 * Props:
 *  - label        : field label
 *  - value        : current rate value (number)
 *  - onChange      : (value: number) => void
 *  - rateType     : e.g. "dailyRate", "weeklyRate", "hourlyRate"
 *  - union        : union code for validation
 *  - department   : department for validation
 *  - designation  : designation for validation
 *  - budgetTier   : budget tier for validation
 *  - sourceUrl    : optional URL describing where the rate came from
 *  - sourceLabel  : optional label for the source
 *  - disabled     : whether the field is read-only
 *  - className    : wrapper className
 *  - error        : form error message
 */
export default function RateFieldWithInfo({
  label,
  value,
  onChange,
  rateType,
  union,
  department,
  designation,
  budgetTier,
  sourceUrl,
  sourceLabel,
  disabled = false,
  className,
  error,
  currencySymbol = "£",
}) {
  const validateRate = useValidateRate();
  const [validation, setValidation] = useState(null);

  // Validate when the value changes and we have enough context
  useEffect(() => {
    if (value == null || value === "" || !union || !rateType) {
      setValidation(null);
      return;
    }

    const timeout = setTimeout(() => {
      validateRate.mutate(
        { rate: Number(value), rateType, union, department, designation, budgetTier },
        {
          onSuccess: (data) => setValidation(data),
          onError: () => setValidation(null),
        }
      );
    }, 400);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, rateType, union, department, designation, budgetTier]);

  const isValid = validation?.isValid;
  const isBelow = validation && !validation.isValid;

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center gap-1.5">
        <Label>{label}</Label>

        {/* Source info tooltip */}
        {(sourceUrl || sourceLabel) && (
          <Tooltip>
            <TooltipTrigger className="text-muted-foreground hover:text-foreground transition-colors">
              <Info className="size-3.5" />
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <span className="flex items-center gap-1.5">
                Source: {sourceLabel || "Rate Card"}
                {sourceUrl && (
                  <a
                    href={sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-0.5 text-blue-400 hover:text-blue-300"
                  >
                    View <ExternalLink className="size-3" />
                  </a>
                )}
              </span>
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      <div className="relative">
        <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
          {currencySymbol}
        </span>
        <Input
          type="number"
          step="0.01"
          min="0"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
          disabled={disabled}
          className={cn(
            "pl-7 pr-9 tabular-nums",
            isValid && "border-emerald-500/60 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30",
            isBelow && "border-amber-500/60 focus-visible:border-amber-500 focus-visible:ring-amber-500/30",
            error && "border-destructive"
          )}
        />

        {/* Validation indicator */}
        {isValid && (
          <CheckCircle2 className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 size-4 text-emerald-500" />
        )}

        {isBelow && (
          <Tooltip>
            <TooltipTrigger className="absolute right-2.5 top-1/2 -translate-y-1/2">
              <AlertTriangle className="size-4 text-amber-500" />
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs text-amber-200">
              <p>
                {validation.warningMessage ||
                  `Rate is ${formatCurrency(Math.abs(validation.difference))} below the union minimum of ${formatCurrency(validation.minimum)}.`}
              </p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      {/* Minimum reference line */}
      {validation?.minimum != null && (
        <p className="text-xs text-muted-foreground">
          Minimum: {formatCurrency(validation.minimum)}
        </p>
      )}
    </div>
  );
}
