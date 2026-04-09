import { useMemo, useEffect } from "react";
import { Controller, useFieldArray } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Users, Briefcase, ClipboardCheck } from "lucide-react";
import {
  getEmploymentStatuses,
  getCrewFields,
} from "@/lib/countryFieldConfig";
import { getEmploymentRules } from "@/lib/employmentTypeRules";

// ---------------------------------------------------------------------------
// Responsibility badge
// ---------------------------------------------------------------------------
function OwnerBadge({ owner }) {
  if (owner === "production") {
    return (
      <Badge variant="secondary" className="bg-muted text-muted-foreground text-[10px] px-1.5">
        PRODUCTION
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="border-amber-500/50 text-amber-600 dark:text-amber-400 text-[10px] px-1.5">
      Crew will complete
    </Badge>
  );
}

// ---------------------------------------------------------------------------
// Step 1 - Crew Details + Right to Work
// ---------------------------------------------------------------------------
export default function Step1CrewDetails({ control, errors, setValue, watch, territory = "UK", unionFields, currencySymbol }) {
  const employmentStatus = watch("employmentStatus");

  const statusOptions = useMemo(
    () => getEmploymentStatuses(territory),
    [territory]
  );

  const dynamicFields = useMemo(
    () => getCrewFields(employmentStatus),
    [employmentStatus]
  );

  return (
    <div className="space-y-6">
      {/* Employment Status */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Briefcase className="size-5 text-primary" />
            Employment Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Controller
            name="employmentStatus"
            control={control}
            render={({ field }) => (
              <div className="space-y-1.5 max-w-sm">
                <Label>Employment Type</Label>
                <Select
                  value={field.value ?? ""}
                  onValueChange={(val) => {
                    field.onChange(val);
                  }}
                >
                  <SelectTrigger className={cn(errors.employmentStatus && "border-destructive")}>
                    <SelectValue placeholder="Select employment type..." />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.employmentStatus && (
                  <p className="text-xs text-destructive">{errors.employmentStatus.message}</p>
                )}
              </div>
            )}
          />
        </CardContent>
      </Card>

      {/* Dynamic crew fields based on employment status */}
      {dynamicFields.length > 0 && (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="size-5 text-primary" />
              Crew Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {dynamicFields.map((fieldDef) => (
              <Controller
                key={fieldDef.name}
                name={fieldDef.name}
                control={control}
                render={({ field }) => (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Label>{fieldDef.label}</Label>
                      <OwnerBadge owner={fieldDef.owner} />
                    </div>
                    <Input
                      type={fieldDef.type || "text"}
                      placeholder={fieldDef.placeholder}
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      disabled={fieldDef.owner === "crew"}
                      className={cn(
                        errors[fieldDef.name] && "border-destructive",
                        fieldDef.owner === "crew" && "bg-muted/50"
                      )}
                    />
                    {errors[fieldDef.name] && (
                      <p className="text-xs text-destructive">{errors[fieldDef.name].message}</p>
                    )}
                  </div>
                )}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Required from Crew — admin picks which fields crew must fill */}
      {employmentStatus && (
        <CrewRequiredFieldsCard
          control={control}
          watch={watch}
          setValue={setValue}
          employmentStatus={employmentStatus}
          territory={territory}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// All possible crew-fillable fields with labels
// ---------------------------------------------------------------------------
const ALL_CREW_FIELDS = [
  { key: 'niNumber', label: 'NI Number', territories: ['UK', 'IE'] },
  { key: 'taxCode', label: 'Tax Code', territories: ['UK'] },
  { key: 'studentLoan', label: 'Student Loan Plan', territories: ['UK'] },
  { key: 'bankSortCode', label: 'Bank Sort Code', territories: ['UK'] },
  { key: 'bankAccountNumber', label: 'Bank Account Number', territories: ['UK', 'AU'] },
  { key: 'ltdCompanyName', label: 'Company Name', territories: ['UK', 'AU', 'DE'] },
  { key: 'ltdCompanyReg', label: 'Company Reg Number', territories: ['UK', 'AU', 'DE'] },
  { key: 'vatNumber', label: 'VAT Number', territories: ['UK'] },
  { key: 'utrNumber', label: 'UTR Number', territories: ['UK'] },
  { key: 'ssn', label: 'SSN', territories: ['US'] },
  { key: 'w4FilingStatus', label: 'W-4 Filing Status', territories: ['US'] },
  { key: 'achRoutingNumber', label: 'ACH Routing Number', territories: ['US'] },
  { key: 'achAccountNumber', label: 'ACH Account Number', territories: ['US'] },
  { key: 'corpName', label: 'Corp Name', territories: ['US'] },
  { key: 'corpEin', label: 'Corp EIN', territories: ['US'] },
  { key: 'tfn', label: 'Tax File Number (TFN)', territories: ['AU'] },
  { key: 'superFund', label: 'Super Fund Name', territories: ['AU'] },
  { key: 'superMemberNumber', label: 'Super Member Number', territories: ['AU'] },
  { key: 'bsb', label: 'BSB', territories: ['AU'] },
  { key: 'steuerID', label: 'Steuer-ID', territories: ['DE'] },
  { key: 'sozialversicherung', label: 'Sozialversicherungsnummer', territories: ['DE'] },
  { key: 'iban', label: 'IBAN', territories: ['DE', 'FR', 'ES'] },
  { key: 'numSecSociale', label: 'Numéro Sécurité Sociale', territories: ['FR'] },
  { key: 'nie', label: 'NIE / DNI', territories: ['ES'] },
  { key: 'numSegSocial', label: 'Número Seguridad Social', territories: ['ES'] },
  { key: 'dateOfBirth', label: 'Date of Birth', territories: ['UK', 'US', 'AU', 'DE', 'FR', 'ES'] },
  { key: 'crewAddress', label: 'Address', territories: ['UK', 'US', 'AU', 'DE', 'FR', 'ES'] },
  { key: 'emergencyContact', label: 'Emergency Contact', territories: ['UK', 'US', 'AU', 'DE', 'FR', 'ES'] },
];

function CrewRequiredFieldsCard({ control, watch, setValue, employmentStatus, territory }) {
  const { fields, replace } = useFieldArray({ control, name: "crewRequiredFields" });
  const crewRequiredFields = watch("crewRequiredFields") || [];

  // Filter fields relevant to this territory
  const relevantFields = useMemo(() =>
    ALL_CREW_FIELDS.filter(f => f.territories.includes(territory)),
    [territory]
  );

  // Get auto-suggested required fields from employment type rules
  const empRules = useMemo(() => getEmploymentRules(employmentStatus), [employmentStatus]);
  const autoRequired = useMemo(() => new Set(empRules?.requiredFields || []), [empRules]);

  // Auto-populate when employment type changes
  useEffect(() => {
    if (!employmentStatus) return;
    const showFields = new Set(empRules?.showFields || []);
    const newRequired = relevantFields
      .filter(f => showFields.has(f.key))
      .map(f => ({
        fieldKey: f.key,
        label: f.label,
        isCompleted: false,
      }));
    // Only auto-set if currently empty or employment type just changed
    if (crewRequiredFields.length === 0 || crewRequiredFields.every(f => !f.fieldKey)) {
      replace(newRequired);
    }
  }, [employmentStatus]);

  const isChecked = (key) => crewRequiredFields.some(f => f.fieldKey === key);

  const toggleField = (key, label) => {
    if (isChecked(key)) {
      replace(crewRequiredFields.filter(f => f.fieldKey !== key));
    } else {
      replace([...crewRequiredFields, { fieldKey: key, label, isCompleted: false }]);
    }
  };

  // Only show fields relevant to the selected employment type
  const empShowFields = new Set(empRules?.showFields || []);
  const visibleFields = relevantFields.filter(f => empShowFields.has(f.key) || isChecked(f.key));

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <ClipboardCheck className="size-5 text-primary" />
          Fields Required from Crew Member
        </CardTitle>
        <CardDescription>
          Select which fields this crew member must complete. Auto-suggested based on employment type.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {visibleFields.map((f) => (
            <label
              key={f.key}
              className={cn(
                "flex items-center gap-2 p-2 rounded-md border cursor-pointer hover:bg-muted/30 transition-colors",
                isChecked(f.key) && "border-primary/50 bg-primary/5"
              )}
            >
              <Checkbox
                checked={isChecked(f.key)}
                onCheckedChange={() => toggleField(f.key, f.label)}
              />
              <span className="text-sm">{f.label}</span>
              {autoRequired.has(f.key) && (
                <Badge variant="outline" className="text-[9px] ml-auto">Suggested</Badge>
              )}
            </label>
          ))}
        </div>
        {crewRequiredFields.length > 0 && (
          <p className="text-xs text-muted-foreground mt-3">
            {crewRequiredFields.length} field{crewRequiredFields.length !== 1 ? 's' : ''} required from crew
          </p>
        )}
      </CardContent>
    </Card>
  );
}
