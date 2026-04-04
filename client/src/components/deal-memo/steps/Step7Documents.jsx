import { useEffect, useRef } from "react";
import { Controller, useFieldArray } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { FileText, Plus, X, Pen, FileCheck, Upload, CheckCircle2 } from "lucide-react";

// Standard production documents (from Kate's documentSigningService)
const STANDARD_DOCUMENTS = [
  { filename: "NDA_Confidentiality_Agreement.pdf", description: "Non-Disclosure Agreement — confidentiality of production, cast & story", requiresSignature: true, isStandard: true },
  { filename: "Anti_Harassment_Bullying_Policy.pdf", description: "Anti-Harassment & Bullying Policy", requiresSignature: true, isStandard: true },
  { filename: "Health_Safety_Policy.pdf", description: "Health & Safety Policy", requiresSignature: true, isStandard: true },
  { filename: "Code_of_Conduct.pdf", description: "Code of Conduct", requiresSignature: true, isStandard: true },
  { filename: "GDPR_Data_Protection_Notice.pdf", description: "GDPR Data Protection Notice (read-only attachment)", requiresSignature: false, isStandard: true },
];

// ---------------------------------------------------------------------------
// Document row with file upload
// ---------------------------------------------------------------------------
function DocumentRow({ index, field, control, errors, remove, onFileUpload }) {
  const fileInputRef = useRef(null);

  return (
    <div className={cn(
      "flex items-start gap-3 rounded-lg border p-4",
      field.isStandard && "bg-muted/20 border-dashed"
    )}>
      <div className="mt-0.5 shrink-0">
        {field.uploadedFile ? (
          <CheckCircle2 className="size-5 text-emerald-500" />
        ) : (
          <FileText className="size-5 text-muted-foreground" />
        )}
      </div>
      <div className="flex-1 space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <Controller
            name={`documents.${index}.filename`}
            control={control}
            render={({ field: f }) => (
              <div className="space-y-1">
                <Label className="text-xs">Filename</Label>
                <Input
                  placeholder="e.g. deal_memo_v1.pdf"
                  value={f.value ?? ""}
                  onChange={f.onChange}
                  disabled={field.isStandard}
                  className={cn("h-8 text-sm", errors?.documents?.[index]?.filename && "border-destructive")}
                />
              </div>
            )}
          />
          <Controller
            name={`documents.${index}.description`}
            control={control}
            render={({ field: f }) => (
              <div className="space-y-1">
                <Label className="text-xs">Description</Label>
                <Input
                  placeholder="Brief description..."
                  value={f.value ?? ""}
                  onChange={f.onChange}
                  className="h-8 text-sm"
                />
              </div>
            )}
          />
        </div>

        <div className="flex items-center gap-4">
          <Controller
            name={`documents.${index}.requiresSignature`}
            control={control}
            render={({ field: f }) => (
              <div className="flex items-center gap-2">
                <Switch
                  checked={f.value ?? false}
                  onCheckedChange={f.onChange}
                  size="sm"
                />
                <Label className="text-xs cursor-pointer flex items-center gap-1">
                  <Pen className="size-3" />
                  Requires Signature
                </Label>
              </div>
            )}
          />

          {/* File upload */}
          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".pdf,.doc,.docx"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file && onFileUpload) {
                  onFileUpload(index, file);
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="size-3 mr-1" />
              {field.uploadedFile ? "Replace" : "Upload"}
            </Button>
            {field.uploadedFile && (
              <span className="text-xs text-emerald-600 dark:text-emerald-400">
                {field.uploadedFile}
              </span>
            )}
          </div>

          {field.isStandard && (
            <Badge variant="secondary" className="text-[10px]">Standard</Badge>
          )}
        </div>
      </div>

      {!field.isStandard && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => remove(index)}
          className="text-muted-foreground hover:text-destructive shrink-0"
        >
          <X className="size-4" />
        </Button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 7 - Documents
// ---------------------------------------------------------------------------
export default function Step7Documents({ control, errors, watch, setValue }) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "documents",
  });

  const documents = watch("documents") || [];
  const docsRequiringSignature = documents.filter((d) => d?.requiresSignature).length;

  // Pre-populate standard documents on first render
  useEffect(() => {
    if (fields.length === 0) {
      STANDARD_DOCUMENTS.forEach((doc) => append(doc));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFileUpload = (index, file) => {
    // In production, this would upload to S3/cloud storage
    // For now, just store the filename
    setValue(`documents.${index}.uploadedFile`, file.name);
    if (!documents[index]?.filename || documents[index]?.isStandard) {
      // Don't overwrite standard document filenames
    } else {
      setValue(`documents.${index}.filename`, file.name);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="size-5 text-primary" />
              Signing Documents
            </CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                append({
                  filename: "",
                  description: "",
                  requiresSignature: true,
                  isStandard: false,
                })
              }
            >
              <Plus className="size-4 mr-1" />
              Add Document
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {fields.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No documents added yet. Standard documents will be added automatically.
            </p>
          ) : (
            <div className="space-y-3">
              {fields.map((field, index) => (
                <DocumentRow
                  key={field.id}
                  index={index}
                  field={field}
                  control={control}
                  errors={errors}
                  remove={remove}
                  onFileUpload={handleFileUpload}
                />
              ))}
            </div>
          )}

          {fields.length > 0 && (
            <>
              <Separator className="my-4" />
              <div className="flex items-center gap-3">
                <FileCheck className="size-5 text-muted-foreground" />
                <div className="text-sm">
                  <span className="font-medium">Envelope Summary:</span>{" "}
                  <span className="text-muted-foreground">
                    {fields.length} document{fields.length !== 1 ? "s" : ""}
                    {docsRequiringSignature > 0 && (
                      <>
                        {" "}&middot;{" "}
                        <Badge variant="outline" className="text-xs">
                          {docsRequiringSignature} requiring signature
                        </Badge>
                      </>
                    )}
                  </span>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
