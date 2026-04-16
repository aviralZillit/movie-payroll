import { useEffect, useRef } from "react";
import { Controller } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Film, Users, Building2, Globe } from "lucide-react";
import { getTerritoryFlag } from "@/lib/countryFieldConfig";
import UnionField from "@/components/deal-memo/UnionField";

// ---------------------------------------------------------------------------
// Auto-scroll Card — scrolls into view when it first mounts
// ---------------------------------------------------------------------------
function AutoScrollCard({ children }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) {
      setTimeout(() => {
        ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, []);
  return <div ref={ref}><Card>{children}</Card></div>;
}

// ---------------------------------------------------------------------------
// FilterSelect (shared pattern)
// ---------------------------------------------------------------------------
function FilterSelect({
  label,
  placeholder,
  value,
  onValueChange,
  options,
  disabled,
  loading,
  error,
  className,
  renderLabel,
}) {
  const selectedOption = (options ?? []).find((o) => o._id === value);
  const selectedLabel = renderLabel ? renderLabel(selectedOption) : selectedOption?.name;
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label>{label}</Label>
      <Select value={value || undefined} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger className={cn("w-full", error && "border-destructive")}>
          {selectedLabel ? (
            <span className="truncate">{selectedLabel}</span>
          ) : (
            <SelectValue placeholder={loading ? "Loading..." : placeholder} />
          )}
        </SelectTrigger>
        <SelectContent>
          {(options ?? []).map((opt) => (
            <SelectItem key={opt._id} value={opt._id}>
              {renderLabel ? renderLabel(opt) : opt.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Territory flag badge
// ---------------------------------------------------------------------------
function TerritoryBadge({ territory }) {
  const info = getTerritoryFlag(territory);
  return (
    <Badge variant="outline" className="gap-1.5 text-sm px-3 py-1">
      <span>{info.emoji}</span>
      <span>{info.label}</span>
    </Badge>
  );
}

// ---------------------------------------------------------------------------
// Union short code helper — prefers shortCode, falls back to acronym
// ---------------------------------------------------------------------------
function getUnionDisplayName(union) {
  if (!union) return '';
  // Use shortCode if available
  if (union.shortCode) return union.shortCode;
  // Try to extract acronym from name (e.g. "Broadcasting, Entertainment, Communications and Theatre Union" → "BECTU")
  if (union.code) return union.code;
  // Fallback: if name is long (>30 chars), create acronym from capital letters or first letters of words
  const name = union.name || '';
  if (name.length > 30) {
    const words = name.split(/[\s,&-]+/).filter(w => w.length > 0 && w[0] === w[0].toUpperCase() && !['and', 'the', 'of', 'for', 'in'].includes(w.toLowerCase()));
    if (words.length >= 2) {
      return words.map(w => w[0]).join('');
    }
  }
  return name;
}

// ---------------------------------------------------------------------------
// Step 0 - Entity & Territory
// ---------------------------------------------------------------------------
export default function Step0EntityTerritory({
  control,
  errors,
  setValue,
  watch,
  productions,
  productionsLoading,
  personOptions,
  entities,
  entitiesLoading,
  unions,
  unionsLoading,
  departments,
  departmentsLoading,
  designations,
  designationsLoading,
  budgetTiers,
  budgetTiersLoading,
  territory,
  unionFields,
  currencySymbol,
}) {
  const watchedProductionId = watch("productionId");
  const watchedUnionId = watch("unionId");
  const watchedDepartmentId = watch("departmentId");
  const watchedDesignationId = watch("designationId");
  const screenCredit = watch("screenCredit");

  // Auto-fill screen credit from designation name when designation changes
  useEffect(() => {
    if (!watchedDesignationId) return;
    const designation = (designations ?? []).find(d => d._id === watchedDesignationId);
    if (designation?.name && (!screenCredit || screenCredit === '')) {
      setValue("screenCredit", designation.name, { shouldDirty: true });
    }
  }, [watchedDesignationId, designations, setValue]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Film className="size-5 text-primary" />
            Production & Person
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Controller
            name="productionId"
            control={control}
            render={({ field }) => (
              <FilterSelect
                label="Production"
                placeholder="Select production..."
                value={field.value}
                onValueChange={field.onChange}
                options={productions}
                loading={productionsLoading}
                error={errors.productionId?.message}
              />
            )}
          />

          <Controller
            name="personId"
            control={control}
            render={({ field }) => (
              <FilterSelect
                label="Person"
                placeholder={watchedProductionId ? "Select person..." : "Select production first"}
                value={field.value}
                onValueChange={field.onChange}
                options={personOptions}
                disabled={!watchedProductionId}
                error={errors.personId?.message}
              />
            )}
          />

          <Controller
            name="contractingEntityId"
            control={control}
            render={({ field }) => (
              <FilterSelect
                label="Contracting Entity"
                placeholder={watchedProductionId ? "Select entity..." : "Select production first"}
                value={field.value}
                onValueChange={field.onChange}
                options={entities}
                disabled={!watchedProductionId}
                loading={entitiesLoading}
                error={errors.contractingEntityId?.message}
              />
            )}
          />

          {/* Territory - auto-derived, read-only */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5">
              <Globe className="size-3.5" />
              Territory
            </Label>
            <div className="flex items-center h-9">
              {territory ? (
                <TerritoryBadge territory={territory} />
              ) : (
                <span className="text-sm text-muted-foreground">
                  Auto-derived from production
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Building2 className="size-5 text-primary" />
            Classification
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Controller
            name="unionId"
            control={control}
            render={({ field }) => (
              <FilterSelect
                label="Union / Agreement"
                placeholder="Select union..."
                value={field.value}
                onValueChange={(val) => {
                  field.onChange(val);
                  setValue("departmentId", "");
                  setValue("designationId", "");
                  setValue("budgetTierId", "");
                }}
                options={unions}
                loading={unionsLoading}
                disabled={!watchedProductionId}
                error={errors.unionId?.message}
                renderLabel={getUnionDisplayName}
              />
            )}
          />

          <Controller
            name="departmentId"
            control={control}
            render={({ field }) => (
              <FilterSelect
                label="Department"
                placeholder={watchedUnionId ? "Select department..." : "Select union first"}
                value={field.value}
                onValueChange={(val) => {
                  field.onChange(val);
                  setValue("designationId", "");
                }}
                options={departments}
                loading={departmentsLoading}
                disabled={!watchedUnionId}
                error={errors.departmentId?.message}
              />
            )}
          />

          <Controller
            name="designationId"
            control={control}
            render={({ field }) => (
              <FilterSelect
                label="Designation / Role"
                placeholder={watchedDepartmentId ? "Select designation..." : "Select department first"}
                value={field.value}
                onValueChange={field.onChange}
                options={designations}
                loading={designationsLoading}
                disabled={!watchedDepartmentId}
                error={errors.designationId?.message}
              />
            )}
          />

          <Controller
            name="budgetTierId"
            control={control}
            render={({ field }) => (
              <FilterSelect
                label="Budget Tier"
                placeholder={watchedUnionId ? "Select budget tier..." : "Select union first"}
                value={field.value}
                onValueChange={field.onChange}
                options={budgetTiers}
                loading={budgetTiersLoading}
                disabled={!watchedUnionId}
                error={errors.budgetTierId?.message}
              />
            )}
          />

          <Controller
            name="screenCredit"
            control={control}
            render={({ field }) => (
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Screen Credit</Label>
                <Input
                  placeholder="e.g. Director of Photography"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  className={cn(errors.screenCredit && "border-destructive")}
                />
                {errors.screenCredit && (
                  <p className="text-xs text-destructive">{errors.screenCredit.message}</p>
                )}
              </div>
            )}
          />
        </CardContent>
      </Card>

    </div>
  );
}
