import { useRef, useCallback, useMemo } from "react";
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
  Clock,
  DollarSign,
  Receipt,
  TrendingDown,
  Landmark,
  Calculator,
} from "lucide-react";
import { isPayrollVisibleRole } from "@/lib/countryFieldConfig";

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
// Status badge for right to work
// ---------------------------------------------------------------------------
function RtwStatusBadge({ status }) {
  const config = {
    verified: { label: "Verified", className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" },
    pending: { label: "Pending", className: "bg-amber-500/10 text-amber-600 border-amber-500/30" },
    expired: { label: "Expired", className: "bg-red-500/10 text-red-600 border-red-500/30" },
  };
  const c = config[status] || config.pending;
  return <Badge variant="outline" className={cn("text-[10px]", c.className)}>{c.label}</Badge>;
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
  currencySymbol = "£",
  userRole,
}) {
  const data = watch();
  const previewRef = useRef(null);

  const allowances = data.allowances || [];
  const documents = data.documents || [];
  const cs = currencySymbol;
  const showPayroll = isPayrollVisibleRole(userRole);

  // Weekly cost estimate
  const isUS = labels.territory === "US" || data.territory === "US";
  const costEstimate = useMemo(() => {
    const weekly = Math.round((Number(data.weeklyRate) || Number(data.dailyRate) * 5 || 0) * 100) / 100;
    const hp = (!isUS && data.hpMode !== "incl" && data.hpMode !== "na") ? weekly * 0.1207 : 0;
    const allowTotal = allowances.reduce((sum, a) => sum + (Number(a?.amount) || 0), 0);
    // US: FICA (7.65%) + P&H/Fringe (~20%)  |  UK: Employer NIC (13.8%) + Pension (3%)
    const employerTaxPct = isUS ? 0.0765 : 0.138;
    const fringePct = isUS ? 0.20 : 0.03;
    const onCosts = weekly * (employerTaxPct + fringePct);
    const total = weekly + hp + allowTotal + onCosts;
    return { weekly, hp, allowances: allowTotal, onCosts, total };
  }, [data, allowances, isUS]);

  const handleDownloadPDF = useCallback(() => {
    if (!previewRef.current) return;
    const printWindow = window.open("", "_blank", "width=800,height=1100");
    if (!printWindow) return;
    const content = previewRef.current.innerHTML;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Deal Memo - ${labels.person || "Draft"}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #111; background: #fff; padding: 32px; font-size: 13px; line-height: 1.5; }
          h1, h2, h3, h4 { color: #111; }
          .text-muted-foreground { color: #666; }
          .font-medium { font-weight: 500; }
          .font-semibold { font-weight: 600; }
          .font-bold { font-weight: 700; }
          .tabular-nums { font-variant-numeric: tabular-nums; }
          .text-xs { font-size: 11px; }
          .text-sm { font-size: 13px; }
          .text-lg { font-size: 16px; }
          .text-emerald-500, .text-emerald-600 { color: #10b981; }
          .text-amber-500 { color: #f59e0b; }
          .text-red-500 { color: #ef4444; }
          .text-primary { color: #3b82f6; }
          [class*="border"] { border-color: #e5e7eb; }
          [class*="rounded"] { border-radius: 6px; }
          [class*="separator"], hr { border-top: 1px solid #e5e7eb; margin: 12px 0; }
          [class*="badge"] { display: inline-flex; padding: 2px 8px; border-radius: 9999px; font-size: 10px; border: 1px solid #e5e7eb; }
          svg { display: none; }
          @media print { body { padding: 16px; } }
          @page { margin: 20mm; }
        </style>
      </head>
      <body>
        <h1 style="font-size:20px;margin-bottom:4px;">Deal Memo</h1>
        <p style="color:#666;margin-bottom:24px;font-size:12px;">${labels.person || "Draft"} — ${new Date().toLocaleDateString()}</p>
        ${content}
      </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
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
            {data.rightToWork?.rtwDocType && (
              <div className="flex justify-between py-1 px-2">
                <span className="text-muted-foreground">Right to Work</span>
                <span className="flex items-center gap-2">
                  <span className="text-sm">{data.rightToWork.rtwDocType}</span>
                  <RtwStatusBadge status={data.rightToWork?.status} />
                </span>
              </div>
            )}
          </SummarySection>

          <Separator />

          {/* Deal Structure */}
          <SummarySection icon={CalendarDays} title="Deal Structure">
            <SummaryRow label="Deal Type" value={data.dealType} />
            <SummaryRow label="Start Date" value={data.startDate} />
            <SummaryRow label="End Date" value={data.endDate} />
            <SummaryRow label="Exclusivity" value={data.exclusivity} />
            {data.separateRates && (
              <>
                <SummaryRow label="Prep Rate" value={data.prepRate != null ? `${cs}${Number(data.prepRate).toLocaleString()}` : null} />
                <SummaryRow label="Shoot Rate" value={data.shootRate != null ? `${cs}${Number(data.shootRate).toLocaleString()}` : null} />
                <SummaryRow label="Wrap Rate" value={data.wrapRate != null ? `${cs}${Number(data.wrapRate).toLocaleString()}` : null} />
              </>
            )}
          </SummarySection>

          <Separator />

          {/* Rates */}
          <SummarySection icon={Banknote} title="Rates">
            <SummaryRow label="Rate Basis" value={data.rateBasis} />
            {!data.separateRates && (
              <SummaryRow
                label="Rate Amount"
                value={data.rateAmount != null ? `${cs}${Number(data.rateAmount).toLocaleString()}` : null}
              />
            )}
            <SummaryRow label="Rate Type" value={data.rateType} />
            <SummaryRow
              label="Weekly Rate"
              value={data.weeklyRate != null ? `${cs}${Number(data.weeklyRate).toLocaleString()}` : null}
            />
            <SummaryRow
              label="Daily Rate"
              value={data.dailyRate != null ? `${cs}${Number(data.dailyRate).toLocaleString()}` : null}
            />
            {data.hpMode && !isUS && <SummaryRow label="Holiday Pay Mode" value={data.hpMode} />}
          </SummarySection>

          <Separator />

          {/* Allowances */}
          <SummarySection icon={Wallet} title="Allowances">
            {allowances.length === 0 ? (
              <p className="text-muted-foreground text-sm px-2">No allowances</p>
            ) : (
              allowances.map((a, i) => (
                <SummaryRow
                  key={i}
                  label={a.name || `Allowance ${i + 1}`}
                  value={`${cs}${Number(a.amount || 0).toLocaleString()}`}
                  badge={a.frequency}
                />
              ))
            )}
          </SummarySection>

          <Separator />

          {/* Nominal Coding */}
          <SummarySection icon={Hash} title="Nominal Coding">
            <div className="px-2 text-muted-foreground text-sm">
              {(data.nominalLines || []).length} nominal lines configured
            </div>
          </SummarySection>

          <Separator />

          {/* Right to Work */}
          <SummarySection icon={ShieldCheck} title="Right to Work">
            <div className="px-2 flex items-center gap-2">
              <RtwStatusBadge status={data.rightToWork?.status} />
              <span className="text-sm text-muted-foreground">
                {data.rightToWork?.rtwDocType || "Not yet configured"}
              </span>
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

          {/* Payroll - only visible to accounting roles */}
          {showPayroll && (
            <>
              <Separator />
              <SummarySection icon={Building} title="Payroll">
                <SummaryRow label="Bureau" value={labels.bureau} />
                <SummaryRow label="Pay Frequency" value={data.payFrequency} />
              </SummarySection>
            </>
          )}
        </CardContent>
      </Card>

      {/* Cost Estimate + Timecard Preview side-by-side */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Weekly Cost Estimate */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Calculator className="size-4 text-primary" />
              Weekly Cost to Production
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1.5"><DollarSign className="size-3" />Basic Pay</span>
              <span className="font-medium tabular-nums">{cs}{costEstimate.weekly.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </div>
            {costEstimate.hp > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1.5"><Receipt className="size-3" />Holiday Pay</span>
                <span className="font-medium tabular-nums text-amber-500">{cs}{costEstimate.hp.toFixed(0)}</span>
              </div>
            )}
            {costEstimate.allowances > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1.5"><Wallet className="size-3" />Allowances</span>
                <span className="font-medium tabular-nums">{cs}{costEstimate.allowances.toFixed(0)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1.5"><TrendingDown className="size-3" />{isUS ? 'FICA + P&H/Fringe' : 'Employer On-costs'}</span>
              <span className="font-medium tabular-nums text-red-500">{cs}{costEstimate.onCosts.toFixed(0)}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-sm font-semibold flex items-center gap-1.5">
                <Landmark className="size-4 text-primary" />Total Weekly
              </span>
              <span className="font-bold tabular-nums text-lg">{cs}{costEstimate.total.toFixed(0)}</span>
            </div>
            {/* Color bar */}
            <div className="h-2 rounded-full bg-muted overflow-hidden flex">
              <div className="bg-primary" style={{ width: `${costEstimate.total > 0 ? (costEstimate.weekly / costEstimate.total * 100) : 0}%` }} />
              <div className="bg-amber-500" style={{ width: `${costEstimate.total > 0 ? (costEstimate.hp / costEstimate.total * 100) : 0}%` }} />
              <div className="bg-blue-500" style={{ width: `${costEstimate.total > 0 ? (costEstimate.allowances / costEstimate.total * 100) : 0}%` }} />
              <div className="bg-red-500" style={{ width: `${costEstimate.total > 0 ? (costEstimate.onCosts / costEstimate.total * 100) : 0}%` }} />
            </div>
            <div className="flex gap-3 flex-wrap">
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><span className="size-2 rounded-full bg-primary" />Basic</span>
              {!isUS && <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><span className="size-2 rounded-full bg-amber-500" />HP</span>}
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><span className="size-2 rounded-full bg-blue-500" />Allow.</span>
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><span className="size-2 rounded-full bg-red-500" />{isUS ? 'FICA+P&H' : 'On-costs'}</span>
            </div>
          </CardContent>
        </Card>

        {/* Timecard Preview */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Clock className="size-4 text-primary" />
              Weekly Timecard Template
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => (
              <div key={day} className="flex items-center justify-between rounded-md bg-muted/30 px-3 py-1.5">
                <span className="text-xs font-medium w-8">{day}</span>
                {i < 5 ? (
                  <>
                    <span className="text-[11px] text-muted-foreground">
                      Standard day
                    </span>
                    <Badge variant="secondary" className="text-[10px] h-5">Work</Badge>
                  </>
                ) : i === 5 ? (
                  <>
                    <span className="text-[11px] text-muted-foreground">
                      6th day premium
                    </span>
                    <Badge variant="outline" className="text-[10px] h-5 text-amber-500 border-amber-500/30">6th Day</Badge>
                  </>
                ) : (
                  <>
                    <span className="text-[11px] text-muted-foreground">Rest day</span>
                    <Badge variant="outline" className="text-[10px] h-5 text-emerald-500 border-emerald-500/30">Rest</Badge>
                  </>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

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
