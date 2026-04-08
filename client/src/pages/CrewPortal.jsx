import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import {
  User, Film, Shield, CheckCircle2, AlertCircle, Save, Loader2,
  FileText, Pen, Download, Check, Upload, ShieldCheck, XCircle, Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import api from "@/lib/axios";
import useAuthStore from "@/store/authStore";

import {
  getOnboardingRequirements,
  groupByCategory,
  checkOnboardingCompletion,
  ONBOARDING_CATEGORIES,
} from "@/lib/onboardingRequirements";

function useMyDealMemos() {
  return useQuery({
    queryKey: ["deal-memos", "my-deals"],
    queryFn: async () => {
      const { data } = await api.get("/deal-memos/my-deals");
      return data.data;
    },
  });
}

function useCrewComplete(dealMemoId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (fields) => {
      const { data } = await api.patch(`/deal-memos/${dealMemoId}/crew-complete`, fields);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deal-memos"] });
    },
  });
}

function useSignDocument(dealMemoId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ docIndex, signatureText }) => {
      const { data } = await api.post(`/deal-memos/${dealMemoId}/documents/${docIndex}/sign`, {
        signatureText,
        agreed: true,
      });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deal-memos"] });
    },
  });
}

// ── Signing Modal ──────────────────────────────────────────────────────
function SignDocumentModal({ open, onOpenChange, document, docIndex, dealMemoId, onSigned }) {
  const [signatureText, setSignatureText] = useState("");
  const [agreed, setAgreed] = useState(false);
  const signDoc = useSignDocument(dealMemoId);

  const handleSign = () => {
    if (!signatureText.trim() || !agreed) return;
    signDoc.mutate(
      { docIndex, signatureText: signatureText.trim() },
      {
        onSuccess: (result) => {
          toast.success("Document signed successfully");
          onOpenChange(false);
          setSignatureText("");
          setAgreed(false);
          if (onSigned) onSigned(result);
        },
        onError: (err) => toast.error(err?.response?.data?.message || "Failed to sign"),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pen className="size-5 text-primary" />
            Sign Document
          </DialogTitle>
          <DialogDescription>
            {document?.filename} — {document?.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {document?.fileUrl ? (
            <div className="rounded-md border bg-muted/30 p-4 text-center">
              <a href={document.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 text-sm text-primary hover:underline">
                <Download className="size-4" />
                View & Download Document
              </a>
            </div>
          ) : (
            <div className="rounded-md border border-blue-500/30 bg-blue-500/5 p-4 text-center space-y-1">
              <p className="text-sm font-medium">Document not yet uploaded</p>
              <p className="text-xs text-muted-foreground">
                The production team has not uploaded the PDF for this document yet.
                By signing below, you acknowledge the standard terms of "{document?.filename}"
                as used by this production. The full document will be provided separately.
              </p>
            </div>
          )}

          <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-4">
            <p className="text-sm">
              By typing your name below and clicking "Sign", you confirm that you have read and agree
              to the terms of this document. This constitutes your electronic signature.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              🔒 Your signature, IP address, and timestamp will be recorded for audit purposes.
              In future, this will be handled via DocuSign for full legal compliance.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label>Type your full name as signature</Label>
            <Input
              value={signatureText}
              onChange={(e) => setSignatureText(e.target.value)}
              placeholder="e.g. John Smith"
              className="text-lg font-serif italic"
            />
          </div>

          <div className="flex items-start gap-2">
            <Checkbox
              checked={agreed}
              onCheckedChange={setAgreed}
              id="agree-check"
            />
            <label htmlFor="agree-check" className="text-sm text-muted-foreground cursor-pointer leading-tight">
              I have read this document and agree to its terms. I understand this is a legally binding electronic signature.
            </label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            onClick={handleSign}
            disabled={!signatureText.trim() || !agreed || signDoc.isPending}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {signDoc.isPending ? (
              <Loader2 className="size-4 mr-1.5 animate-spin" />
            ) : (
              <Pen className="size-4 mr-1.5" />
            )}
            Sign Document
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Deal Memo Card with Documents + Fields ─────────────────────────────
// ── RTW Documents Section (Crew uploads) ─────────────────────────────
const RTW_STATUS_CONFIG = {
  requested: { label: 'Requested', icon: Clock, className: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  uploaded: { label: 'Uploaded', icon: Upload, className: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  verified: { label: 'Verified', icon: CheckCircle2, className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
  rejected: { label: 'Rejected', icon: XCircle, className: 'bg-red-500/10 text-red-600 border-red-500/30' },
};

function RtwDocumentsSection({ dealMemo }) {
  const queryClient = useQueryClient();
  const rtwDocs = dealMemo.rightToWork?.documents || [];

  if (rtwDocs.length === 0) return null;

  const handleUpload = async (docIdx, file, reference) => {
    const formData = new FormData();
    formData.append('file', file);
    if (reference) formData.append('reference', reference);

    try {
      await api.post(`/deal-memos/${dealMemo._id}/rtw-documents/${docIdx}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Document uploaded successfully');
      queryClient.invalidateQueries({ queryKey: ['deal-memos'] });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to upload');
    }
  };

  return (
    <div className="space-y-3">
      <Separator />
      <h3 className="text-sm font-semibold flex items-center gap-2">
        <ShieldCheck className="size-4 text-primary" />
        Right to Work Documents
      </h3>
      <p className="text-xs text-muted-foreground">
        Your production has requested the following documents. Please upload each one.
      </p>
      <div className="space-y-2">
        {rtwDocs.map((doc, idx) => (
          <RtwDocRow key={idx} doc={doc} docIdx={idx} onUpload={handleUpload} />
        ))}
      </div>
    </div>
  );
}

function RtwDocRow({ doc, docIdx, onUpload }) {
  const fileInputRef = useState(null);
  const [reference, setReference] = useState(doc.reference || '');
  const inputRef = { current: null };

  const config = RTW_STATUS_CONFIG[doc.status] || RTW_STATUS_CONFIG.requested;
  const Icon = config.icon;
  const canUpload = doc.status === 'requested' || doc.status === 'rejected';

  return (
    <div className={cn(
      'rounded-lg border p-3 space-y-2',
      doc.status === 'rejected' && 'border-red-500/30 bg-red-500/5',
      doc.status === 'verified' && 'border-emerald-500/30 bg-emerald-500/5',
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="size-4 text-muted-foreground" />
          <span className="text-sm font-medium">{doc.docType || `Document ${docIdx + 1}`}</span>
          {doc.required && <Badge variant="outline" className="text-[10px]">Required</Badge>}
        </div>
        <Badge variant="outline" className={cn('gap-1 text-xs', config.className)}>
          <Icon className="size-3" />
          {config.label}
        </Badge>
      </div>

      {/* Rejection note */}
      {doc.status === 'rejected' && doc.rejectionNote && (
        <div className="text-xs text-red-600 dark:text-red-400 bg-red-500/10 rounded px-2 py-1">
          ❌ {doc.rejectionNote}
        </div>
      )}

      {/* Verified info */}
      {doc.status === 'verified' && doc.verifiedBy && (
        <div className="text-xs text-emerald-600 dark:text-emerald-400">
          ✅ Verified by {doc.verifiedBy?.firstName} {doc.verifiedBy?.lastName}
          {doc.verifiedAt && ` on ${format(parseISO(doc.verifiedAt), 'dd MMM yyyy')}`}
        </div>
      )}

      {/* Uploaded file info */}
      {doc.uploadedFile && (
        <div className="text-xs text-muted-foreground flex items-center gap-1">
          📎 {doc.uploadedFile}
          {doc.status === 'uploaded' && <span className="text-blue-500 ml-1">— waiting for admin verification</span>}
        </div>
      )}

      {/* Upload form — only for requested or rejected docs */}
      {canUpload && (
        <div className="flex items-center gap-2 flex-wrap pt-1">
          <Input
            placeholder="Reference / Doc No."
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            className="h-7 text-xs w-44"
          />
          <input
            type="file"
            ref={(el) => { inputRef.current = el; }}
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onUpload(docIdx, file, reference);
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="size-3 mr-1" />
            {doc.status === 'rejected' ? 'Re-upload' : 'Upload'}
          </Button>
        </div>
      )}
    </div>
  );
}

function DealMemoCard({ dealMemo }) {
  const territory = dealMemo.territory || dealMemo.country || "UK";
  const requirements = getOnboardingRequirements(territory);
  const grouped = groupByCategory(requirements);
  const fields = requirements; // flat list for backward compat
  // Field name mapping: onboarding key → deal memo schema field
  // Some onboarding keys don't match the DealMemo schema exactly
  const FIELD_ALIASES = { address: 'crewAddress' };

  const [formValues, setFormValues] = useState(() => {
    const initial = {};
    requirements.forEach((f) => {
      const schemaKey = FIELD_ALIASES[f.key] || f.key;
      let val = dealMemo[f.key] || dealMemo[schemaKey] || "";
      // Format Date objects to YYYY-MM-DD string for date inputs
      if (val && typeof val === 'object' && val instanceof Date) {
        val = val.toISOString().slice(0, 10);
      } else if (val && typeof val === 'string' && f.type === 'date' && val.includes('T')) {
        val = val.slice(0, 10); // "1997-12-23T00:00:00.000Z" → "1997-12-23"
      }
      initial[f.key] = val;
    });
    return initial;
  });

  const crewComplete = useCrewComplete(dealMemo._id);
  const [signingDoc, setSigningDoc] = useState(null); // { doc, index }

  const signingDocs = dealMemo.signingDocuments || [];
  const docsRequiringSignature = signingDocs.filter(d => d.requiresSignature);
  const docsSigned = docsRequiringSignature.filter(d => d.status === 'signed');
  const allDocsSigned = docsRequiringSignature.length > 0 && docsSigned.length === docsRequiringSignature.length;

  const onboardingStatus = checkOnboardingCompletion(requirements, formValues);
  const completedCount = onboardingStatus.requiredFilled;
  const totalRequired = onboardingStatus.requiredTotal;
  const requiredCompleted = onboardingStatus.requiredFilled;

  const handleSave = () => {
    const nonEmpty = {};
    Object.entries(formValues).forEach(([k, v]) => {
      if (v) {
        // Map field aliases back to schema field names
        const schemaKey = FIELD_ALIASES[k] || k;
        nonEmpty[schemaKey] = v;
        // Also send with original key in case server accepts both
        if (schemaKey !== k) nonEmpty[k] = v;
      }
    });
    crewComplete.mutate(nonEmpty, {
      onSuccess: () => toast.success("Details saved successfully"),
      onError: (err) => toast.error(err?.response?.data?.message || "Failed to save"),
    });
  };

  return (
    <Card>
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{dealMemo.dealNumber}</CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">
              {dealMemo.productionId?.name} • {dealMemo.designationId?.name || dealMemo.departmentId?.name}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={cn(
              "text-xs",
              requiredCompleted === totalRequired ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" : "bg-amber-500/10 text-amber-600 border-amber-500/30"
            )}>
              {requiredCompleted === totalRequired ? (
                <><CheckCircle2 className="size-3 mr-1" /> Complete</>
              ) : (
                <><AlertCircle className="size-3 mr-1" /> {requiredCompleted}/{totalRequired} fields</>
              )}
            </Badge>
            <Badge variant="secondary" className="text-xs">{territory}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-6">
        {/* Documents to Sign */}
        {signingDocs.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
              <FileText className="size-4 text-primary" />
              Documents to Sign
              <Badge variant="outline" className="text-[10px] ml-auto">
                {docsSigned.length}/{docsRequiringSignature.length} signed
              </Badge>
            </h3>
            <div className="space-y-2">
              {signingDocs.map((doc, idx) => (
                <div key={idx} className={cn(
                  "flex items-center justify-between rounded-lg border px-4 py-3",
                  doc.status === 'signed' && "bg-emerald-500/5 border-emerald-500/20"
                )}>
                  <div className="flex items-center gap-3">
                    {doc.status === 'signed' ? (
                      <CheckCircle2 className="size-5 text-emerald-500 shrink-0" />
                    ) : (
                      <FileText className="size-5 text-muted-foreground shrink-0" />
                    )}
                    <div>
                      <p className="text-sm font-medium">{doc.filename}</p>
                      <p className="text-xs text-muted-foreground">{doc.description}</p>
                      {doc.status === 'signed' && doc.signedAt && (
                        <p className="text-[10px] text-emerald-600 mt-0.5">
                          Signed {format(new Date(doc.signedAt), "dd MMM yyyy 'at' HH:mm")}
                          {doc.signatureText && ` by ${doc.signatureText}`}
                        </p>
                      )}
                    </div>
                  </div>
                  {doc.requiresSignature && doc.status !== 'signed' ? (
                    <Button
                      size="sm"
                      onClick={() => setSigningDoc({ doc, index: idx })}
                      className="bg-primary"
                    >
                      <Pen className="size-3.5 mr-1" />
                      Review & Sign
                    </Button>
                  ) : doc.status === 'signed' ? (
                    <Badge className="bg-emerald-500 text-white text-xs">
                      <Check className="size-3 mr-1" /> Signed
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">Read-only</Badge>
                  )}
                </div>
              ))}
            </div>
            <Separator className="mt-4" />
          </div>
        )}

        {/* Signing Modal */}
        {signingDoc && (
          <SignDocumentModal
            open={!!signingDoc}
            onOpenChange={(open) => !open && setSigningDoc(null)}
            document={signingDoc.doc}
            docIndex={signingDoc.index}
            dealMemoId={dealMemo._id}
            onSigned={() => setSigningDoc(null)}
          />
        )}

        {/* Right to Work Documents */}
        <RtwDocumentsSection dealMemo={dealMemo} />

        {/* Onboarding Requirements — grouped by category */}
        {(() => {
          const completion = checkOnboardingCompletion(requirements, formValues);
          return (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <User className="size-4 text-primary" />
                  Onboarding Requirements
                </h3>
                <Badge variant="outline" className={cn("text-xs",
                  completion.isComplete ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" : "bg-amber-500/10 text-amber-600 border-amber-500/30"
                )}>
                  {completion.requiredFilled}/{completion.requiredTotal} required
                </Badge>
              </div>

              {grouped.map((group) => {
                const groupFilled = group.items.filter(f => f.required && formValues[f.key]).length;
                const groupRequired = group.items.filter(f => f.required).length;
                return (
                  <div key={group.category}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{group.label}</span>
                      {groupRequired > 0 && (
                        <span className="text-[10px] text-muted-foreground">{groupFilled}/{groupRequired}</span>
                      )}
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {group.items.map((field) => (
                        <div key={field.key} className="space-y-1.5">
                          <Label className="text-sm flex items-center gap-1.5">
                            {field.label}
                            {field.required && <span className="text-red-500">*</span>}
                            {formValues[field.key] && <CheckCircle2 className="size-3 text-emerald-500" />}
                          </Label>
                          <Input
                            type={field.type || "text"}
                            placeholder={field.placeholder || field.label}
                            value={formValues[field.key] || ""}
                            onChange={(e) => setFormValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
                            className={cn(
                              "h-9",
                              field.required && !formValues[field.key] && "border-amber-500/50"
                            )}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}
        <div className="flex justify-end mt-6">
          <Button onClick={handleSave} disabled={crewComplete.isPending}>
            {crewComplete.isPending ? (
              <Loader2 className="size-4 mr-1.5 animate-spin" />
            ) : (
              <Save className="size-4 mr-1.5" />
            )}
            Save Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function CrewPortal() {
  const user = useAuthStore((s) => s.user);
  const { data: dealMemos = [], isLoading } = useMyDealMemos();

  // Crew should only see deal memos that have been issued to them — NOT drafts
  const activeDealMemos = dealMemos.filter((dm) =>
    ["sent", "signed", "active", "issued", "completed", "pending_approval"].includes(dm.status)
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 p-6"
    >
      <div>
        <h1 className="text-2xl font-bold">Crew Portal</h1>
        <p className="text-sm text-muted-foreground">
          Complete your employment details for active deal memos. Your information is kept confidential.
        </p>
      </div>

      {/* Info banner */}
      <Card className="border-blue-500/30 bg-blue-500/5">
        <CardContent className="flex items-start gap-3 py-4">
          <Shield className="size-5 text-blue-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium">Your data is secure</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Only payroll administrators can see your tax and bank details. Production coordinators cannot view pay rates or personal information you enter here.
            </p>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-48 rounded-lg bg-muted/30 animate-pulse" />
          ))}
        </div>
      ) : activeDealMemos.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <User className="size-12 text-muted-foreground/30 mb-4" />
            <p className="text-lg font-medium">No active deal memos</p>
            <p className="text-sm text-muted-foreground mt-1">
              You'll see your deal memos here once a production coordinator sends one.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {activeDealMemos.map((dm) => (
            <DealMemoCard key={dm._id} dealMemo={dm} />
          ))}
        </div>
      )}
    </motion.div>
  );
}
