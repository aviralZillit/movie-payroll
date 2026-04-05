import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import {
  User, Film, Shield, CheckCircle2, AlertCircle, Save, Loader2,
  FileText, Pen, Download, Check,
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

// Territory-specific field definitions
const CREW_FIELDS = {
  UK: [
    { key: "niNumber", label: "National Insurance Number", placeholder: "AB 12 34 56 C", required: true },
    { key: "taxCode", label: "Tax Code", placeholder: "1257L", required: true },
    { key: "bankSortCode", label: "Bank Sort Code", placeholder: "12-34-56", required: true },
    { key: "bankAccountNumber", label: "Bank Account Number", placeholder: "12345678", required: true },
    { key: "dateOfBirth", label: "Date of Birth", type: "date", required: true },
    { key: "address", label: "Address", placeholder: "Full address", required: true },
    { key: "emergencyContact", label: "Emergency Contact", placeholder: "Name & phone number", required: false },
  ],
  US: [
    { key: "ssn", label: "Social Security Number", placeholder: "XXX-XX-XXXX", required: true },
    { key: "w4FilingStatus", label: "W-4 Filing Status", placeholder: "Single / Married / Head of Household", required: true },
    { key: "stateWithholding", label: "State Withholding", placeholder: "CA / NY / etc.", required: true },
    { key: "achRoutingNumber", label: "ACH Routing Number", placeholder: "9 digits", required: true },
    { key: "achAccountNumber", label: "ACH Account Number", placeholder: "Account number", required: true },
    { key: "dateOfBirth", label: "Date of Birth", type: "date", required: true },
    { key: "address", label: "Address", placeholder: "Full address", required: true },
  ],
  CA: [
    { key: "sin", label: "Social Insurance Number", placeholder: "XXX-XXX-XXX", required: true },
    { key: "province", label: "Province", placeholder: "BC / ON / QC", required: true },
    { key: "dateOfBirth", label: "Date of Birth", type: "date", required: true },
    { key: "address", label: "Address", placeholder: "Full address", required: true },
  ],
  AU: [
    { key: "tfn", label: "Tax File Number", placeholder: "XXX XXX XXX", required: true },
    { key: "superFund", label: "Superannuation Fund", placeholder: "Fund name", required: true },
    { key: "superMemberNumber", label: "Super Member Number", placeholder: "Member #", required: true },
    { key: "bsb", label: "BSB", placeholder: "XXX-XXX", required: true },
    { key: "dateOfBirth", label: "Date of Birth", type: "date", required: true },
    { key: "address", label: "Address", placeholder: "Full address", required: true },
  ],
};

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
          {document?.fileUrl && (
            <div className="rounded-md border bg-muted/30 p-4 text-center">
              <a href={document.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 text-sm text-primary hover:underline">
                <Download className="size-4" />
                Download & Review Document
              </a>
            </div>
          )}

          <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-4">
            <p className="text-sm">
              By typing your name below and clicking "Sign", you confirm that you have read and agree
              to the terms of this document. This constitutes your electronic signature.
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
function DealMemoCard({ dealMemo }) {
  const territory = dealMemo.territory || dealMemo.country || "UK";
  const fields = CREW_FIELDS[territory] || CREW_FIELDS.UK;
  const [formValues, setFormValues] = useState(() => {
    const initial = {};
    fields.forEach((f) => { initial[f.key] = dealMemo[f.key] || ""; });
    return initial;
  });

  const crewComplete = useCrewComplete(dealMemo._id);
  const [signingDoc, setSigningDoc] = useState(null); // { doc, index }

  const signingDocs = dealMemo.signingDocuments || [];
  const docsRequiringSignature = signingDocs.filter(d => d.requiresSignature);
  const docsSigned = docsRequiringSignature.filter(d => d.status === 'signed');
  const allDocsSigned = docsRequiringSignature.length > 0 && docsSigned.length === docsRequiringSignature.length;

  const completedCount = fields.filter((f) => formValues[f.key]).length;
  const totalRequired = fields.filter((f) => f.required).length;
  const requiredCompleted = fields.filter((f) => f.required && formValues[f.key]).length;

  const handleSave = () => {
    const nonEmpty = {};
    Object.entries(formValues).forEach(([k, v]) => { if (v) nonEmpty[k] = v; });
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

        {/* Crew Fields */}
        <div>
          <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
            <User className="size-4 text-primary" />
            Your Details
          </h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map((field) => (
            <div key={field.key} className="space-y-1.5">
              <Label className="text-sm flex items-center gap-1.5">
                {field.label}
                {field.required && <span className="text-red-500">*</span>}
              </Label>
              <Input
                type={field.type || "text"}
                placeholder={field.placeholder}
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

  const activeDealMemos = dealMemos.filter((dm) =>
    ["sent", "signed", "active", "issued"].includes(dm.status)
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
