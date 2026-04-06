import { useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn, formatCurrency } from "@/lib/utils";
import {
  Film,
  Users,
  Building2,
  Banknote,
  Wallet,
  CalendarDays,
  FileText,
  ShieldCheck,
  Hash,
  Building,
  Send,
  Save,
  Download,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Summary section helper
// ---------------------------------------------------------------------------
function SummarySection({ icon: Icon, title, children }) {
  return (
    <div>
      <h3 className="flex items-center gap-2 text-sm font-semibold mb-3">
        <Icon className="size-4 text-primary" />
        {title}
      </h3>
      <div className="grid gap-1.5 text-sm">{children}</div>
    </div>
  );
}

function SummaryRow({ label, value, badge }) {
  if (value == null || value === "") return null;
  return (
    <div className="flex justify-between py-1 px-2 rounded-sm hover:bg-muted/50">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right flex items-center gap-2">
        {value}
        {badge && (
          <Badge variant="outline" className="text-[10px]">
            {badge}
          </Badge>
        )}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 9 - Preview & Issue
// ---------------------------------------------------------------------------
export default function Step9PreviewIssue({
  watch,
  onIssue,
  onSaveDraft,
  isSubmitting = false,
  labels = {},
  currencySymbol = "\u00A3",
}) {
  const data = watch();
  const previewRef = useRef(null);

  const allowances = data.allowances || [];
  const documents = data.documents || [];
  const totalAllowances = allowances.reduce((sum, a) => sum + (Number(a?.amount) || 0), 0);

  const handleDownloadPDF = useCallback(async () => {
    if (!previewRef.current) return;
    try {
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      const element = previewRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      // Handle multi-page if content is tall
      const pageHeight = pdf.internal.pageSize.getHeight();
      let heightLeft = pdfHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }

      const filename = `Deal-Memo-${labels.person || "Draft"}-${new Date().toISOString().slice(0, 10)}.pdf`;
      pdf.save(filename);
    } catch (err) {
      console.error("PDF generation failed:", err);
    }
  }, [labels]);

  return (
    <div className="space-y-6">
      <Card ref={previewRef}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Deal Memo Preview</CardTitle>
            <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
              <Download className="size-4 mr-1.5" />
              Download PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Entity & Territory */}
          <SummarySection icon={Film} title="Entity & Territory">
            <SummaryRow label="Production" value={labels.production} />
            <SummaryRow label="Person" value={labels.person} />
            <SummaryRow label="Contracting Entity" value={labels.entity} />
            <SummaryRow label="Territory" value={data.territory || labels.territory} />
            <SummaryRow label="Screen Credit" value={data.screenCredit} />
          </SummarySection>

          <Separator />

          {/* Classification */}
          <SummarySection icon={Building2} title="Classification">
            <SummaryRow label="Union / Agreement" value={labels.union} />
            <SummaryRow label="Department" value={labels.department} />
            <SummaryRow label="Designation" value={labels.designation} />
            <SummaryRow label="Budget Tier" value={labels.budgetTier} />
          </SummarySection>

          <Separator />

          {/* Crew Details */}
          <SummarySection icon={Users} title="Crew Details">
            <SummaryRow label="Employment Status" value={labels.employmentStatus || data.employmentStatus} />
          </SummarySection>

          <Separator />

          {/* Deal Structure */}
          <SummarySection icon={CalendarDays} title="Deal Structure">
            <SummaryRow label="Deal Type" value={data.dealType} />
            <SummaryRow label="Start Date" value={data.startDate} />
            <SummaryRow label="End Date" value={data.endDate} />
            <SummaryRow label="Guaranteed Weeks" value={data.guaranteedWeeks} />
            <SummaryRow label="Prep Days" value={data.prepDays} />
            <SummaryRow label="Shoot Days" value={data.shootDays} />
            <SummaryRow label="Wrap Days" value={data.wrapDays} />
            <SummaryRow label="Travel Days" value={data.travelDays} />
            <SummaryRow label="Exclusivity" value={data.exclusivity} />
            <SummaryRow label="Pay or Play" value={data.payOrPlay ? "Yes" : "No"} />
          </SummarySection>

          <Separator />

          {/* Rates */}
          <SummarySection icon={Banknote} title="Rates">
            <SummaryRow label="Rate Basis" value={data.rateBasis} />
            <SummaryRow
              label="Rate Amount"
              value={data.rateAmount != null ? `${currencySymbol}${Number(data.rateAmount).toLocaleString()}` : null}
            />
            <SummaryRow label="Rate Type" value={data.rateType} />
            <SummaryRow
              label="Weekly Rate"
              value={data.weeklyRate != null ? `${currencySymbol}${Number(data.weeklyRate).toLocaleString()}` : null}
            />
            <SummaryRow
              label="Daily Rate"
              value={data.dailyRate != null ? `${currencySymbol}${Number(data.dailyRate).toLocaleString()}` : null}
            />
            <SummaryRow
              label="Hourly Rate"
              value={data.hourlyRate != null ? `${currencySymbol}${Number(data.hourlyRate).toLocaleString()}` : null}
            />
            {data.hpMode && <SummaryRow label="Holiday Pay Mode" value={data.hpMode} />}
          </SummarySection>

          <Separator />

          {/* Allowances */}
          <SummarySection icon={Wallet} title="Allowances">
            {allowances.length === 0 ? (
              <p className="text-muted-foreground text-sm px-2">No allowances</p>
            ) : (
              <>
                {allowances.map((a, i) => (
                  <SummaryRow
                    key={i}
                    label={a.name || `Allowance ${i + 1}`}
                    value={`${currencySymbol}${Number(a.amount || 0).toLocaleString()}`}
                    badge={a.frequency}
                  />
                ))}
                <div className="flex justify-between px-2 pt-1 font-medium">
                  <span>Total Allowances</span>
                  <span className="tabular-nums">
                    {currencySymbol}{totalAllowances.toLocaleString()}
                  </span>
                </div>
              </>
            )}
          </SummarySection>

          <Separator />

          {/* Nominal Coding */}
          <SummarySection icon={Hash} title="Nominal Coding">
            <SummaryRow label="Tax Credit Scheme" value={data.taxCreditScheme || "None"} />
          </SummarySection>

          <Separator />

          {/* Compliance */}
          <SummarySection icon={ShieldCheck} title="Compliance">
            <div className="px-2 text-muted-foreground text-sm">
              Compliance checks reviewed in previous step
            </div>
          </SummarySection>

          <Separator />

          {/* Documents */}
          <SummarySection icon={FileText} title="Documents">
            {documents.length === 0 ? (
              <p className="text-muted-foreground text-sm px-2">No documents attached</p>
            ) : (
              documents.map((d, i) => (
                <SummaryRow
                  key={i}
                  label={d.filename || `Document ${i + 1}`}
                  value={d.requiresSignature ? "Signature required" : "No signature"}
                />
              ))
            )}
          </SummarySection>

          <Separator />

          {/* Payroll */}
          <SummarySection icon={Building} title="Payroll">
            <SummaryRow label="Bureau" value={labels.bureau} />
            <SummaryRow label="Pay Frequency" value={data.payFrequency} />
          </SummarySection>
        </CardContent>
      </Card>

      {/* Action buttons */}
      <div className="flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onSaveDraft}
          disabled={isSubmitting}
        >
          <Save className="size-4 mr-1.5" />
          Save as Draft
        </Button>
        <Button
          type="button"
          onClick={onIssue}
          disabled={isSubmitting}
        >
          <Send className="size-4 mr-1.5" />
          {isSubmitting ? "Issuing..." : "Issue Deal Memo"}
        </Button>
      </div>
    </div>
  );
}
