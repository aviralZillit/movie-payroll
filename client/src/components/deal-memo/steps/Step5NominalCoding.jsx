import { Controller } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Hash, RefreshCw, Receipt } from "lucide-react";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const TAX_CREDIT_SCHEMES = [
  { value: "none", label: "None" },
  { value: "uk_film", label: "UK Film Tax Relief" },
  { value: "uk_hetv", label: "UK HETV Tax Relief" },
  { value: "uk_animation", label: "UK Animation Tax Relief" },
  { value: "us_federal", label: "US Federal Tax Incentive" },
  { value: "us_georgia", label: "Georgia Tax Credit" },
  { value: "us_california", label: "California Film Credit" },
  { value: "us_new_york", label: "New York Tax Credit" },
  { value: "au_offset", label: "Australian Producer Offset" },
  { value: "ca_federal", label: "Canadian Federal CPTC" },
];

// ---------------------------------------------------------------------------
// Step 5 - Nominal Coding
// ---------------------------------------------------------------------------
export default function Step5NominalCoding({
  control,
  errors,
  watch,
  nominalLines = [],
  onRegenerate,
}) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Receipt className="size-5 text-primary" />
            Tax Credit Scheme
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Controller
            name="taxCreditScheme"
            control={control}
            render={({ field }) => (
              <div className="space-y-1.5 max-w-md">
                <Label>Scheme</Label>
                <Select value={field.value ?? ""} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select tax credit scheme..." />
                  </SelectTrigger>
                  <SelectContent>
                    {TAX_CREDIT_SCHEMES.map((opt) => (
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
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Hash className="size-5 text-primary" />
              Nominal Lines
            </CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onRegenerate}
            >
              <RefreshCw className="size-4 mr-1" />
              Regenerate
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {nominalLines.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Nominal lines will be auto-generated based on the deal structure, rates, and allowances.
              Click "Regenerate" to build them.
            </p>
          ) : (
            <div className="rounded-md border overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">Code</TableHead>
                    <TableHead>Label</TableHead>
                    <TableHead className="hidden sm:table-cell">Description</TableHead>
                    <TableHead className="text-right w-28">Est. Weekly</TableHead>
                    <TableHead className="w-24">Cost Centre</TableHead>
                    <TableHead className="w-24">Tax Credit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {nominalLines.map((line, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-mono text-xs">{line.code}</TableCell>
                      <TableCell className="font-medium text-sm">{line.label}</TableCell>
                      <TableCell className="text-muted-foreground text-xs hidden sm:table-cell">
                        {line.description}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs tabular-nums">
                        {line.estimatedWeekly != null ? `${line.estimatedWeekly.toFixed(0)}` : "—"}
                      </TableCell>
                      <TableCell className="font-mono text-xs">{line.costCentre}</TableCell>
                      <TableCell>
                        {line.taxCredit ? (
                          <Badge variant="outline" className="text-emerald-600 border-emerald-500/50 text-[10px]">
                            Eligible
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[10px]">
                            N/A
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
