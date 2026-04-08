import { Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Info } from "lucide-react";

// ---------------------------------------------------------------------------
// UnionField — Dynamic field renderer for union-specific deal memo fields
// ---------------------------------------------------------------------------
// Given a field config object, renders the appropriate input type using
// shadcn/ui components and react-hook-form Controller.
//
// All field values are stored under the `unionFields.{key}` namespace
// to keep them separate from common deal memo fields.
// ---------------------------------------------------------------------------

export default function UnionField({ field, control, errors, currencySymbol = "\u00A3", watch }) {
  const fieldName = `unionFields.${field.key}`;
  const colClass = field.colSpan === 2 ? "sm:col-span-2" : "";

  return (
    <Controller
      name={fieldName}
      control={control}
      defaultValue={field.default ?? (field.type === 'boolean' ? false : field.type === 'multi_select' ? [] : undefined)}
      render={({ field: formField }) => {
        const error = errors?.unionFields?.[field.key];

        // --- Boolean / Switch ---
        if (field.type === "boolean") {
          return (
            <div className={cn("flex items-center gap-3 py-1", colClass)}>
              <Switch
                checked={formField.value ?? false}
                onCheckedChange={formField.onChange}
              />
              <div className="flex items-center gap-1.5">
                <Label className="cursor-pointer text-sm">{field.label}</Label>
                {field.helpText && <HelpIcon text={field.helpText} />}
              </div>
            </div>
          );
        }

        // --- Select ---
        if (field.type === "select") {
          const selectedOpt = (field.options ?? []).find(
            (o) => o.value === formField.value
          );
          return (
            <div className={cn("space-y-1.5", colClass)}>
              <FieldLabel label={field.label} helpText={field.helpText} required={field.required} />
              <Select
                value={formField.value ?? ""}
                onValueChange={formField.onChange}
              >
                <SelectTrigger className={cn(error && "border-destructive")}>
                  {selectedOpt ? (
                    <span className="truncate">{selectedOpt.label}</span>
                  ) : (
                    <SelectValue placeholder={field.placeholder || `Select ${field.label.toLowerCase()}...`} />
                  )}
                </SelectTrigger>
                <SelectContent>
                  {(field.options ?? []).map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {error && <p className="text-xs text-destructive">{error.message}</p>}
            </div>
          );
        }

        // --- Multi-select (checkboxes) ---
        if (field.type === "multi_select") {
          const selected = formField.value ?? [];
          const toggle = (val) => {
            const next = selected.includes(val)
              ? selected.filter((v) => v !== val)
              : [...selected, val];
            formField.onChange(next);
          };
          return (
            <div className={cn("space-y-1.5 sm:col-span-2", colClass)}>
              <FieldLabel label={field.label} helpText={field.helpText} required={field.required} />
              <div className="flex flex-wrap gap-3 pt-1">
                {(field.options ?? []).map((opt) => (
                  <label key={opt.value} className="flex items-center gap-1.5 text-sm cursor-pointer">
                    <Checkbox
                      checked={selected.includes(opt.value)}
                      onCheckedChange={() => toggle(opt.value)}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
              {error && <p className="text-xs text-destructive">{error.message}</p>}
            </div>
          );
        }

        // --- Currency ---
        if (field.type === "currency") {
          return (
            <div className={cn("space-y-1.5", colClass)}>
              <FieldLabel label={field.label} helpText={field.helpText} required={field.required} />
              <div className="relative">
                <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  {currencySymbol}
                </span>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder={field.placeholder || "0.00"}
                  value={formField.value ?? ""}
                  onChange={(e) =>
                    formField.onChange(
                      e.target.value === "" ? null : Number(e.target.value)
                    )
                  }
                  className={cn("pl-7 tabular-nums", error && "border-destructive")}
                />
              </div>
              {error && <p className="text-xs text-destructive">{error.message}</p>}
            </div>
          );
        }

        // --- Percentage ---
        if (field.type === "percentage") {
          return (
            <div className={cn("space-y-1.5", colClass)}>
              <FieldLabel label={field.label} helpText={field.helpText} required={field.required} />
              <div className="relative">
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  placeholder={field.placeholder || "0"}
                  value={formField.value ?? ""}
                  onChange={(e) =>
                    formField.onChange(
                      e.target.value === "" ? null : Number(e.target.value)
                    )
                  }
                  className={cn("pr-8 tabular-nums", error && "border-destructive")}
                />
                <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  %
                </span>
              </div>
              {error && <p className="text-xs text-destructive">{error.message}</p>}
            </div>
          );
        }

        // --- Date ---
        if (field.type === "date") {
          return (
            <div className={cn("space-y-1.5", colClass)}>
              <FieldLabel label={field.label} helpText={field.helpText} required={field.required} />
              <Input
                type="date"
                value={formField.value ?? ""}
                onChange={formField.onChange}
                className={cn(error && "border-destructive")}
              />
              {error && <p className="text-xs text-destructive">{error.message}</p>}
            </div>
          );
        }

        // --- Number ---
        if (field.type === "number") {
          return (
            <div className={cn("space-y-1.5", colClass)}>
              <FieldLabel label={field.label} helpText={field.helpText} required={field.required} />
              <Input
                type="number"
                step="any"
                placeholder={field.placeholder || ""}
                value={formField.value ?? ""}
                onChange={(e) =>
                  formField.onChange(
                    e.target.value === "" ? null : Number(e.target.value)
                  )
                }
                className={cn("tabular-nums", error && "border-destructive")}
              />
              {error && <p className="text-xs text-destructive">{error.message}</p>}
            </div>
          );
        }

        // --- Text (default) ---
        return (
          <div className={cn("space-y-1.5", colClass)}>
            <FieldLabel label={field.label} helpText={field.helpText} required={field.required} />
            <Input
              type="text"
              placeholder={field.placeholder || ""}
              value={formField.value ?? ""}
              onChange={formField.onChange}
              className={cn(error && "border-destructive")}
            />
            {error && <p className="text-xs text-destructive">{error.message}</p>}
          </div>
        );
      }}
    />
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function FieldLabel({ label, helpText, required }) {
  return (
    <div className="flex items-center gap-1.5">
      <Label>
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      {helpText && <HelpIcon text={helpText} />}
    </div>
  );
}

function HelpIcon({ text }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Info className="size-3.5 text-muted-foreground cursor-help" />
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs text-xs">
        {text}
      </TooltipContent>
    </Tooltip>
  );
}
