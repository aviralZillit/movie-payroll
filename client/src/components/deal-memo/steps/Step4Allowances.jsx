import { Controller, useFieldArray } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn, formatCurrency } from "@/lib/utils";
import { Wallet, Plus, X, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const FREQUENCY_OPTIONS = [
  { value: "weekly", label: "Weekly" },
  { value: "daily", label: "Daily" },
  { value: "monthly", label: "Monthly" },
  { value: "one_time", label: "One-Time" },
  { value: "per_episode", label: "Per Episode" },
];

const TAX_TREATMENT_OPTIONS = [
  { value: "taxable", label: "Taxable" },
  { value: "non_taxable", label: "Non-Taxable" },
  { value: "reimbursement", label: "Reimbursement" },
];

// ---------------------------------------------------------------------------
// Expandable cap settings
// ---------------------------------------------------------------------------
function CapSettings({ index, control }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        {expanded ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
        Cap Settings
      </button>

      {expanded && (
        <div className="mt-2 grid gap-3 sm:grid-cols-3 rounded-md border p-3 bg-muted/30">
          <Controller
            name={`allowances.${index}.weeklyCap`}
            control={control}
            render={({ field }) => (
              <div className="space-y-1">
                <Label className="text-xs">Weekly Cap</Label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="No cap"
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))}
                  className="h-8 text-sm"
                />
              </div>
            )}
          />
          <Controller
            name={`allowances.${index}.dailyCap`}
            control={control}
            render={({ field }) => (
              <div className="space-y-1">
                <Label className="text-xs">Daily Cap</Label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="No cap"
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))}
                  className="h-8 text-sm"
                />
              </div>
            )}
          />
          <Controller
            name={`allowances.${index}.maxDaysPerWeek`}
            control={control}
            render={({ field }) => (
              <div className="space-y-1">
                <Label className="text-xs">Max Days / Week</Label>
                <Input
                  type="number"
                  min={1}
                  max={7}
                  placeholder="7"
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))}
                  className="h-8 text-sm"
                />
              </div>
            )}
          />
          <Controller
            name={`allowances.${index}.excludeSundays`}
            control={control}
            render={({ field }) => (
              <div className="flex items-center gap-2 col-span-1">
                <Switch checked={field.value ?? false} onCheckedChange={field.onChange} size="sm" />
                <Label className="text-xs cursor-pointer">Exclude Sundays</Label>
              </div>
            )}
          />
          <Controller
            name={`allowances.${index}.payableOnTravel`}
            control={control}
            render={({ field }) => (
              <div className="flex items-center gap-2 col-span-1">
                <Switch checked={field.value ?? false} onCheckedChange={field.onChange} size="sm" />
                <Label className="text-xs cursor-pointer">Payable on Travel</Label>
              </div>
            )}
          />
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 4 - Allowances
// ---------------------------------------------------------------------------
export default function Step4Allowances({ control, errors, watch, currencySymbol = "$" }) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "allowances",
  });

  const allowances = watch("allowances") || [];

  const total = allowances.reduce((sum, a) => sum + (Number(a?.amount) || 0), 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Wallet className="size-5 text-primary" />
              Allowances
            </CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                append({
                  name: "",
                  amount: 0,
                  frequency: "weekly",
                  taxTreatment: "taxable",
                  weeklyCap: null,
                  dailyCap: null,
                  maxDaysPerWeek: null,
                  excludeSundays: false,
                  payableOnTravel: false,
                })
              }
            >
              <Plus className="size-4 mr-1" />
              Add Allowance
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {fields.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No allowances added yet. Click "Add Allowance" to get started.
            </p>
          ) : (
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="rounded-lg border p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="grid gap-3 sm:grid-cols-4 flex-1">
                      <Controller
                        name={`allowances.${index}.name`}
                        control={control}
                        render={({ field: f }) => (
                          <div className="space-y-1">
                            <Label className="text-xs">Name</Label>
                            <Input
                              placeholder="e.g. Kit Allowance"
                              value={f.value ?? ""}
                              onChange={f.onChange}
                              className={cn(
                                "h-8 text-sm",
                                errors?.allowances?.[index]?.name && "border-destructive"
                              )}
                            />
                          </div>
                        )}
                      />
                      <Controller
                        name={`allowances.${index}.amount`}
                        control={control}
                        render={({ field: f }) => (
                          <div className="space-y-1">
                            <Label className="text-xs">Amount</Label>
                            <div className="relative">
                              <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                                {currencySymbol}
                              </span>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                value={f.value ?? ""}
                                onChange={(e) =>
                                  f.onChange(e.target.value === "" ? 0 : Number(e.target.value))
                                }
                                className="h-8 text-sm pl-6 tabular-nums"
                              />
                            </div>
                          </div>
                        )}
                      />
                      <Controller
                        name={`allowances.${index}.frequency`}
                        control={control}
                        render={({ field: f }) => (
                          <div className="space-y-1">
                            <Label className="text-xs">Frequency</Label>
                            <Select value={f.value ?? ""} onValueChange={f.onChange}>
                              <SelectTrigger className="h-8 text-sm">
                                {f.value ? (
                                  <span>{FREQUENCY_OPTIONS.find(o => o.value === f.value)?.label || f.value}</span>
                                ) : (
                                  <SelectValue placeholder="Select..." />
                                )}
                              </SelectTrigger>
                              <SelectContent>
                                {FREQUENCY_OPTIONS.map((opt) => (
                                  <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      />
                      <Controller
                        name={`allowances.${index}.taxTreatment`}
                        control={control}
                        render={({ field: f }) => (
                          <div className="space-y-1">
                            <Label className="text-xs">Tax Treatment</Label>
                            <Select value={f.value ?? ""} onValueChange={f.onChange}>
                              <SelectTrigger className="h-8 text-sm">
                                {f.value ? (
                                  <span>{TAX_TREATMENT_OPTIONS.find(o => o.value === f.value)?.label || f.value}</span>
                                ) : (
                                  <SelectValue placeholder="Select..." />
                                )}
                              </SelectTrigger>
                              <SelectContent>
                                {TAX_TREATMENT_OPTIONS.map((opt) => (
                                  <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                      className="mt-5 text-muted-foreground hover:text-destructive"
                    >
                      <X className="size-4" />
                    </Button>
                  </div>

                  <CapSettings index={index} control={control} />
                </div>
              ))}
            </div>
          )}

          {fields.length > 0 && (
            <>
              <Separator className="my-4" />
              <div className="flex justify-end">
                <div className="rounded-md bg-muted px-4 py-2 text-sm font-medium tabular-nums">
                  Total: {currencySymbol}
                  {total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
