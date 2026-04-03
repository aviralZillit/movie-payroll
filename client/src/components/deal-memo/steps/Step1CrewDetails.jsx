import { useMemo } from "react";
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
import { Users, Briefcase } from "lucide-react";

// ---------------------------------------------------------------------------
// Territory-aware employment status options
// ---------------------------------------------------------------------------
const EMPLOYMENT_STATUSES = {
  UK: [
    { value: "paye", label: "PAYE" },
    { value: "ltd", label: "Ltd Company" },
    { value: "sole_trader", label: "Sole Trader" },
  ],
  US: [
    { value: "w2", label: "W-2 Employee" },
    { value: "loanout", label: "Loan-out Corp" },
    { value: "1099", label: "1099 Contractor" },
  ],
  AU: [
    { value: "payg", label: "PAYG" },
    { value: "pty_ltd", label: "Pty Ltd" },
    { value: "abn", label: "ABN Sole Trader" },
  ],
  CA: [
    { value: "t4", label: "T4 Employee" },
    { value: "corp", label: "Personal Corp" },
    { value: "self_employed", label: "Self-Employed" },
  ],
};

// ---------------------------------------------------------------------------
// Field definitions per employment status
// ---------------------------------------------------------------------------
const FIELD_DEFS = {
  // UK
  paye: [
    { name: "niNumber", label: "NI Number", placeholder: "AB 12 34 56 C", owner: "crew" },
    { name: "taxCode", label: "Tax Code", placeholder: "1257L", owner: "crew" },
    { name: "studentLoan", label: "Student Loan Plan", placeholder: "Plan 1 / Plan 2 / None", owner: "crew" },
  ],
  ltd: [
    { name: "companyName", label: "Company Name", placeholder: "Enter company name", owner: "crew" },
    { name: "companyRegNumber", label: "Company Reg Number", placeholder: "12345678", owner: "crew" },
    { name: "vatNumber", label: "VAT Number", placeholder: "GB 123 4567 89", owner: "crew" },
  ],
  sole_trader: [
    { name: "niNumber", label: "NI Number", placeholder: "AB 12 34 56 C", owner: "crew" },
    { name: "utrNumber", label: "UTR Number", placeholder: "1234567890", owner: "crew" },
  ],
  // US
  w2: [
    { name: "ssn", label: "SSN", placeholder: "XXX-XX-XXXX", owner: "crew" },
    { name: "w4FilingStatus", label: "W-4 Filing Status", placeholder: "Single / Married", owner: "crew" },
    { name: "w4Allowances", label: "W-4 Allowances", placeholder: "0", owner: "crew", type: "number" },
    { name: "stateWithholding", label: "State Withholding", placeholder: "CA / NY / etc.", owner: "production" },
  ],
  loanout: [
    { name: "loanoutCorpName", label: "Loan-out Corp Name", placeholder: "Enter corp name", owner: "crew" },
    { name: "federalId", label: "Federal ID (EIN)", placeholder: "XX-XXXXXXX", owner: "crew" },
    { name: "stateOfIncorp", label: "State of Incorporation", placeholder: "CA", owner: "crew" },
  ],
  "1099": [
    { name: "ssn", label: "SSN / EIN", placeholder: "XXX-XX-XXXX", owner: "crew" },
    { name: "businessName", label: "Business Name (if applicable)", placeholder: "", owner: "crew" },
  ],
  // AU
  payg: [
    { name: "tfn", label: "Tax File Number", placeholder: "123 456 789", owner: "crew" },
    { name: "superFund", label: "Super Fund Name", placeholder: "Enter super fund", owner: "crew" },
    { name: "superMemberNo", label: "Super Member Number", placeholder: "Member number", owner: "crew" },
  ],
  pty_ltd: [
    { name: "abn", label: "ABN", placeholder: "12 345 678 901", owner: "crew" },
    { name: "companyName", label: "Company Name", placeholder: "Enter company name", owner: "crew" },
    { name: "gstRegistered", label: "GST Registered", placeholder: "Yes / No", owner: "crew" },
  ],
  abn: [
    { name: "tfn", label: "Tax File Number", placeholder: "123 456 789", owner: "crew" },
    { name: "abn", label: "ABN", placeholder: "12 345 678 901", owner: "crew" },
  ],
  // CA
  t4: [
    { name: "sin", label: "SIN", placeholder: "123 456 789", owner: "crew" },
    { name: "td1FederalClaim", label: "TD1 Federal Claim", placeholder: "Basic personal amount", owner: "crew" },
  ],
  corp: [
    { name: "corpName", label: "Corporation Name", placeholder: "Enter corp name", owner: "crew" },
    { name: "businessNumber", label: "Business Number", placeholder: "123456789RC0001", owner: "crew" },
  ],
  self_employed: [
    { name: "sin", label: "SIN", placeholder: "123 456 789", owner: "crew" },
    { name: "businessNumber", label: "Business Number (optional)", placeholder: "", owner: "crew" },
  ],
};

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
// Step 1 - Crew Details
// ---------------------------------------------------------------------------
export default function Step1CrewDetails({ control, errors, setValue, watch, territory = "UK" }) {
  const employmentStatus = watch("employmentStatus");

  const statusOptions = useMemo(
    () => EMPLOYMENT_STATUSES[territory] || EMPLOYMENT_STATUSES.UK,
    [territory]
  );

  const dynamicFields = useMemo(
    () => FIELD_DEFS[employmentStatus] || [],
    [employmentStatus]
  );

  return (
    <div className="space-y-6">
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
    </div>
  );
}
