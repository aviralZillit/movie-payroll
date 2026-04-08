import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Hash, Building2, Info } from "lucide-react";

// ---------------------------------------------------------------------------
// Step 5 - Nominal Coding
// Auto-populated from designation + department selected in Step 0.
// Codes come from the DesignationCodeMap API (Movie Magic Budgeting standard).
// User can override any code or amount inline.
// ---------------------------------------------------------------------------
export default function Step5NominalCoding({
  control,
  errors,
  watch,
  setValue,
  nominalLines = [],
  designationName,
  departmentName,
}) {
  // Update a single nominal line field
  const handleLineChange = (index, field, value) => {
    const updated = [...nominalLines];
    updated[index] = { ...updated[index], [field]: value };
    setValue("nominalLines", updated, { shouldDirty: true });
  };

  return (
    <div className="space-y-6">
      {/* Context banner showing which designation/department drives the codes */}
      {(designationName || departmentName) && (
        <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-4 py-3">
          <Building2 className="size-4 text-primary shrink-0" />
          <div className="flex items-center gap-2 flex-wrap text-sm">
            <span className="text-muted-foreground">Codes for:</span>
            {designationName && <Badge variant="outline">{designationName}</Badge>}
            {departmentName && <Badge variant="secondary">{departmentName}</Badge>}
          </div>
        </div>
      )}

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Hash className="size-5 text-primary" />
            Nominal Lines
          </CardTitle>
        </CardHeader>
        <CardContent>
          {nominalLines.length === 0 ? (
            <div className="text-center py-8 space-y-2">
              <Hash className="size-8 mx-auto opacity-30" />
              <p className="text-sm text-muted-foreground">
                Nominal lines are auto-generated from your designation, rates, and allowances.
              </p>
              <p className="text-xs text-muted-foreground">
                Go back and fill in Entity (Step 1) and Rates (Step 4) to see codes.
              </p>
            </div>
          ) : (
            <div className="rounded-md border overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">Acct #</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right w-32">Est. Weekly</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {nominalLines.map((line, idx) => (
                    <TableRow key={idx} className={line.estimatedWeekly == null ? "opacity-60" : ""}>
                      <TableCell>
                        <Input
                          value={line.code || ""}
                          onChange={(e) => handleLineChange(idx, "code", e.target.value)}
                          className="h-7 text-xs font-mono w-16 tabular-nums"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="space-y-0.5">
                          <Input
                            value={line.label || ""}
                            onChange={(e) => handleLineChange(idx, "label", e.target.value)}
                            className="h-7 text-sm border-none shadow-none px-0 focus-visible:ring-0"
                          />
                          {line.description && (
                            <p className="text-[11px] text-muted-foreground pl-0">{line.description}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {line.estimatedWeekly != null ? (
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={line.estimatedWeekly ?? ""}
                            onChange={(e) => handleLineChange(idx, "estimatedWeekly", e.target.value === "" ? null : Number(e.target.value))}
                            className="h-7 text-xs font-mono text-right w-28 ml-auto tabular-nums"
                          />
                        ) : (
                          <span className="text-xs text-muted-foreground italic">from timecards</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <div className="flex items-start gap-2 mt-3 text-xs text-muted-foreground">
            <Info className="size-3.5 mt-0.5 shrink-0" />
            <span>
              Account codes follow Movie Magic Budgeting standard.
              Edit any code or amount inline — changes override the defaults for this deal memo.
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
