import { Controller, useFieldArray } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { FileText, Plus, X, Pen, FileCheck } from "lucide-react";

// ---------------------------------------------------------------------------
// Step 7 - Documents
// ---------------------------------------------------------------------------
export default function Step7Documents({ control, errors, watch }) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "documents",
  });

  const documents = watch("documents") || [];
  const docsRequiringSignature = documents.filter((d) => d?.requiresSignature).length;

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
              No documents added yet. Click "Add Document" to attach signing documents.
            </p>
          ) : (
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex items-start gap-3 rounded-lg border p-4"
                >
                  <FileText className="size-5 mt-0.5 text-muted-foreground shrink-0" />
                  <div className="flex-1 grid gap-3 sm:grid-cols-2">
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
                            className={cn(
                              "h-8 text-sm",
                              errors?.documents?.[index]?.filename && "border-destructive"
                            )}
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
                    <Controller
                      name={`documents.${index}.requiresSignature`}
                      control={control}
                      render={({ field: f }) => (
                        <div className="flex items-center gap-2 sm:col-span-2">
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
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(index)}
                    className="text-muted-foreground hover:text-destructive shrink-0"
                  >
                    <X className="size-4" />
                  </Button>
                </div>
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
