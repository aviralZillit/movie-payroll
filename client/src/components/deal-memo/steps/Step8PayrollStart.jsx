import { Controller, useFieldArray } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Building, Users, Plus, Trash2 } from "lucide-react";
import { getBureauOptions } from "@/lib/countryFieldConfig";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const PAY_FREQUENCY_OPTIONS = [
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Bi-Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "semi_monthly", label: "Semi-Monthly" },
];

const RESPONSIBILITY_OPTIONS = [
  { value: "production_accountant", label: "Production Accountant" },
  { value: "payroll_admin", label: "Payroll Admin" },
  { value: "payroll_manager", label: "Payroll Manager" },
  { value: "hod_approver", label: "HOD / Approver" },
  { value: "timecard_approver", label: "Timecard Approver" },
  { value: "petty_cash", label: "Petty Cash" },
  { value: "cost_controller", label: "Cost Controller" },
  { value: "custom", label: "Other" },
];

// ---------------------------------------------------------------------------
// Step 8 - Payroll Start
// ---------------------------------------------------------------------------
export default function Step8PayrollStart({
  control,
  errors,
  watch,
  setValue,
  territory = "UK",
}) {
  const bureaus = getBureauOptions(territory);
  const { fields, append, remove } = useFieldArray({
    control,
    name: "payrollResponsibilities",
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Building className="size-5 text-primary" />
            Payroll Bureau
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Controller
            name="bureauId"
            control={control}
            render={({ field }) => (
              <div className="space-y-1.5">
                <Label>Bureau</Label>
                <Select value={field.value ?? ""} onValueChange={field.onChange}>
                  <SelectTrigger className={cn(errors.bureauId && "border-destructive")}>
                    <SelectValue placeholder="Select bureau..." />
                  </SelectTrigger>
                  <SelectContent>
                    {(bureaus ?? []).map((b) => (
                      <SelectItem key={b._id} value={b._id}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          />

          <Controller
            name="payFrequency"
            control={control}
            render={({ field }) => (
              <div className="space-y-1.5">
                <Label>Pay Frequency</Label>
                <Select value={field.value ?? ""} onValueChange={field.onChange}>
                  <SelectTrigger className={cn(errors.payFrequency && "border-destructive")}>
                    <SelectValue placeholder="Select frequency..." />
                  </SelectTrigger>
                  <SelectContent>
                    {PAY_FREQUENCY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          />
        </CardContent>
      </Card>

      {/* Responsibility Assignments — editable table */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="size-5 text-primary" />
            Responsibility Assignments
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Who manages what for this production's payroll.
          </p>
        </CardHeader>
        <CardContent>
          {fields.length > 0 && (
            <div className="border rounded-lg overflow-hidden mb-4">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left px-3 py-2 font-medium">Person</th>
                    <th className="text-left px-3 py-2 font-medium">Responsibility</th>
                    <th className="text-left px-3 py-2 font-medium">Department / Area</th>
                    <th className="text-left px-3 py-2 font-medium">Notes</th>
                    <th className="px-3 py-2 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {fields.map((field, index) => (
                    <tr key={field.id} className="border-t">
                      <td className="px-3 py-2">
                        <Controller
                          name={`payrollResponsibilities.${index}.personName`}
                          control={control}
                          render={({ field: f }) => (
                            <Input className="h-8 text-sm" placeholder="Name" value={f.value || ""} onChange={f.onChange} />
                          )}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <Controller
                          name={`payrollResponsibilities.${index}.responsibility`}
                          control={control}
                          render={({ field: f }) => (
                            <Input className="h-8 text-sm" placeholder="e.g. Payroll Manager" value={f.value || ""} onChange={f.onChange} />
                          )}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <Controller
                          name={`payrollResponsibilities.${index}.departments`}
                          control={control}
                          render={({ field: f }) => (
                            <Input
                              className="h-8 text-sm"
                              placeholder="e.g. Wardrobe, Camera"
                              value={Array.isArray(f.value) ? f.value.join(", ") : f.value || ""}
                              onChange={(e) => f.onChange(e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
                            />
                          )}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <Controller
                          name={`payrollResponsibilities.${index}.notes`}
                          control={control}
                          render={({ field: f }) => (
                            <Input className="h-8 text-sm" placeholder="Notes" value={f.value || ""} onChange={f.onChange} />
                          )}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <Button variant="ghost" size="sm" onClick={() => remove(index)} className="text-muted-foreground hover:text-destructive">
                          <Trash2 className="size-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ personName: "", responsibility: "", departments: "", notes: "" })}
          >
            <Plus className="size-4 mr-1" />
            Add Row
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
