import { Controller } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { CalendarDays, Briefcase, Shield } from "lucide-react";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const DEAL_TYPES = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "flat", label: "Flat / Run of Show" },
  { value: "picture", label: "Per Picture" },
  { value: "step", label: "Step Deal" },
  { value: "pop", label: "Pay or Play" },
];

const EXCLUSIVITY_OPTIONS = [
  { value: "exclusive", label: "Exclusive" },
  { value: "non_exclusive", label: "Non-Exclusive" },
  { value: "first_priority", label: "First Priority" },
];

// ---------------------------------------------------------------------------
// Step 2 - Deal Structure
// ---------------------------------------------------------------------------
export default function Step2DealStructure({ control, errors, watch }) {
  const dealType = watch("dealType");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Briefcase className="size-5 text-primary" />
            Deal Type
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Controller
            name="dealType"
            control={control}
            render={({ field }) => (
              <div className="space-y-1.5">
                <Label>Deal Type</Label>
                <Select value={field.value ?? ""} onValueChange={field.onChange}>
                  <SelectTrigger className={cn(errors.dealType && "border-destructive")}>
                    <SelectValue placeholder="Select deal type..." />
                  </SelectTrigger>
                  <SelectContent>
                    {DEAL_TYPES.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.dealType && (
                  <p className="text-xs text-destructive">{errors.dealType.message}</p>
                )}
              </div>
            )}
          />

          <Controller
            name="exclusivity"
            control={control}
            render={({ field }) => (
              <div className="space-y-1.5">
                <Label>Exclusivity</Label>
                <Select value={field.value ?? ""} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select exclusivity..." />
                  </SelectTrigger>
                  <SelectContent>
                    {EXCLUSIVITY_OPTIONS.map((opt) => (
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

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <CalendarDays className="size-5 text-primary" />
            Dates & Duration
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Controller
            name="startDate"
            control={control}
            render={({ field }) => (
              <div className="space-y-1.5">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  className={cn(errors.startDate && "border-destructive")}
                />
                {errors.startDate && (
                  <p className="text-xs text-destructive">{errors.startDate.message}</p>
                )}
              </div>
            )}
          />

          <Controller
            name="endDate"
            control={control}
            render={({ field }) => (
              <div className="space-y-1.5">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                />
              </div>
            )}
          />

          <Controller
            name="guaranteedWeeks"
            control={control}
            render={({ field }) => (
              <div className="space-y-1.5">
                <Label>Guaranteed Weeks</Label>
                <Input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))}
                />
              </div>
            )}
          />

          <Controller
            name="prepDays"
            control={control}
            render={({ field }) => (
              <div className="space-y-1.5">
                <Label>Prep Days</Label>
                <Input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))}
                />
              </div>
            )}
          />

          <Controller
            name="shootDays"
            control={control}
            render={({ field }) => (
              <div className="space-y-1.5">
                <Label>Shoot Days</Label>
                <Input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))}
                />
              </div>
            )}
          />

          <Controller
            name="wrapDays"
            control={control}
            render={({ field }) => (
              <div className="space-y-1.5">
                <Label>Wrap Days</Label>
                <Input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))}
                />
              </div>
            )}
          />

          <Controller
            name="travelDays"
            control={control}
            render={({ field }) => (
              <div className="space-y-1.5">
                <Label>Travel Days</Label>
                <Input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))}
                />
              </div>
            )}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="size-5 text-primary" />
            Terms
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Controller
            name="payOrPlay"
            control={control}
            render={({ field }) => (
              <div className="flex items-center gap-3">
                <Switch
                  checked={field.value ?? false}
                  onCheckedChange={field.onChange}
                />
                <Label className="cursor-pointer">Pay or Play</Label>
                <span className="text-xs text-muted-foreground">
                  Guarantees full payment regardless of whether services are used
                </span>
              </div>
            )}
          />
        </CardContent>
      </Card>
    </div>
  );
}
