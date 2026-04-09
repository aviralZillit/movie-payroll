import { useMemo, useState } from "react";
import { Controller, useFieldArray } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ShieldCheck, CheckCircle2, Clock, FileText, Plus, X, Info } from "lucide-react";
import { getRightToWorkConfig } from "@/lib/countryFieldConfig";

// ---------------------------------------------------------------------------
// Step 6 — Right to Work (Admin: select which docs to request from crew)
//
// The admin's ONLY job here is to:
//   1. Pick which documents the crew member needs to provide
//   2. Optionally add a note
//   3. Set the overall verification status
//
// The crew member fills in references, uploads scans, and enters expiry
// dates via the deal memo — NOT here.
// ---------------------------------------------------------------------------
export default function Step6RightToWork({
  control,
  errors,
  watch,
  territory = "UK",
}) {
  const rtwConfig = useMemo(() => getRightToWorkConfig(territory), [territory]);
  const rtwStatus = watch("rightToWork.status") || "pending";
  const [customDocName, setCustomDocName] = useState("");

  const { fields, append, remove } = useFieldArray({
    control,
    name: "rightToWork.documents",
  });

  // Quick-add from the predefined list
  const handleToggleDoc = (docName, checked) => {
    if (checked) {
      append({ docType: docName, required: true, status: "requested" });
    } else {
      const idx = fields.findIndex(f => f.docType === docName);
      if (idx >= 0) remove(idx);
    }
  };

  const requestedDocNames = fields.map(f => f.docType);
  const availableDocs = rtwConfig.requestableDocuments || [];

  return (
    <div className="space-y-6">
      {/* What to request */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShieldCheck className="size-5 text-primary" />
              {rtwConfig.label}
            </CardTitle>
            <Badge variant="outline" className={cn("gap-1 text-xs",
              rtwStatus === "verified" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" : "bg-amber-500/10 text-amber-600 border-amber-500/30"
            )}>
              {rtwStatus === "verified" ? <CheckCircle2 className="size-3" /> : <Clock className="size-3" />}
              {rtwStatus === "verified" ? "Verified" : "Pending"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Select which documents this crew member needs to provide. They will upload them via the deal memo.
          </p>

          {/* Checkbox list of standard documents */}
          <div className="space-y-2">
            {availableDocs.map((docName) => {
              const isChecked = requestedDocNames.includes(docName);
              return (
                <label
                  key={docName}
                  className={cn(
                    "flex items-center gap-3 rounded-md border px-3 py-2.5 cursor-pointer transition-colors",
                    isChecked ? "border-primary/50 bg-primary/5" : "hover:bg-muted/50"
                  )}
                >
                  <Checkbox
                    checked={isChecked}
                    onCheckedChange={(checked) => handleToggleDoc(docName, checked)}
                  />
                  <FileText className="size-4 text-muted-foreground shrink-0" />
                  <span className="text-sm">{docName}</span>
                  {isChecked && (
                    <Badge variant="outline" className="ml-auto text-[10px] bg-primary/10 text-primary border-primary/30">
                      Requested
                    </Badge>
                  )}
                </label>
              );
            })}
          </div>

          {/* Custom document request */}
          <div className="flex items-center gap-2 pt-2 border-t">
            <Input
              placeholder="Other document (e.g. P45, Tax Return)..."
              value={customDocName}
              onChange={(e) => setCustomDocName(e.target.value)}
              className="h-8 text-sm flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8"
              disabled={!customDocName.trim()}
              onClick={() => {
                if (customDocName.trim()) {
                  append({ docType: customDocName.trim(), required: true, status: "requested" });
                  setCustomDocName("");
                }
              }}
            >
              <Plus className="size-3 mr-1" />
              Add
            </Button>
          </div>

          {/* Custom docs that aren't in the predefined list */}
          {fields.filter(f => f.docType && !availableDocs.includes(f.docType)).length > 0 && (
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Custom requests:</Label>
              {fields.map((field, idx) => {
                if (!field.docType || availableDocs.includes(field.docType)) return null;
                return (
                  <div key={field.id} className="flex items-center gap-2 rounded-md border px-3 py-2">
                    <FileText className="size-4 text-muted-foreground" />
                    <span className="text-sm flex-1">{field.docType}</span>
                    <Badge variant="outline" className="text-[10px]">Requested</Badge>
                    <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => remove(idx)}>
                      <X className="size-3" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary + Notes */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">Summary & Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-4 text-sm">
            <span className="text-muted-foreground">Documents requested:</span>
            <Badge variant="secondary">{fields.length}</Badge>
          </div>

          <Controller
            name="rightToWork.notes"
            control={control}
            render={({ field }) => (
              <div className="space-y-1.5">
                <Label>Notes for crew member</Label>
                <Input
                  placeholder="e.g. Please provide within 48 hours of start date..."
                  value={field.value ?? ""}
                  onChange={field.onChange}
                />
              </div>
            )}
          />

        </CardContent>
      </Card>
    </div>
  );
}
