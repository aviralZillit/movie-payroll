import { useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { cn, formatCurrency } from "@/lib/utils";
import {
  FileText, Clock, DollarSign, Calculator, User, Building2,
  Briefcase, Banknote, Receipt, TrendingDown, Landmark,
} from "lucide-react";

function SummaryRow({ label, value, highlight, icon: Icon }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-xs text-muted-foreground flex items-center gap-1.5">
        {Icon && <Icon className="size-3" />}
        {label}
      </span>
      <span className={cn("text-xs font-medium tabular-nums", highlight)}>{value}</span>
    </div>
  );
}

/**
 * Right summary panel for the deal memo wizard.
 * Shows 3 tabs: Summary | Timecard Preview | Cost Estimate
 * Updates reactively as the user fills out each step.
 */
export default function DealMemoSummaryPanel({ watch, country, currencySymbol = "£", classificationLabels }) {
  const [activeTab, setActiveTab] = useState("summary");

  const data = watch();
  const cs = currencySymbol;

  // Weekly cost estimate
  const costEstimate = useMemo(() => {
    const weekly = Number(data.weeklyRate) || 0;
    const daily = Number(data.dailyRate) || 0;
    const hourly = Number(data.hourlyRate) || 0;
    const basicWeekly = weekly || daily * 5 || hourly * 50;

    // HP
    const hpMode = data.hpMode || "excl";
    let hp = 0;
    if (hpMode === "excl" && country !== "US") {
      hp = basicWeekly * ((Number(data.holidayPayPct) || 12.07) / 100);
    }

    // Allowances
    const kitWeekly = Number(data.kitAllowance) || 0;
    const carWeekly = Number(data.carAllowance) || 0;
    const phoneWeekly = Number(data.phoneAllowance) || 0;
    const computerWeekly = Number(data.computerAllowance) || 0;
    const travelWeekly = Number(data.travelAllowance) || 0;
    const perDiemWeekly = (Number(data.perDiem) || 0) * 5;
    const housingWeekly = Number(data.housingAllowance) || 0;
    const customTotal = (data.customAllowances || []).reduce((s, c) => s + (Number(c?.amount) || 0), 0);
    const allowances = kitWeekly + carWeekly + phoneWeekly + computerWeekly + travelWeekly + perDiemWeekly + housingWeekly + customTotal;

    // Employer on-costs
    let onCosts = 0;
    if (country === "US") {
      onCosts = basicWeekly * ((Number(data.phPct) || 20) / 100 + (Number(data.ficaPct) || 7.65) / 100);
    } else if (country === "AU") {
      onCosts = basicWeekly * 0.115; // Super
    } else {
      const niPct = (Number(data.employerNiPct) || 13.8) / 100;
      const penPct = (Number(data.pensionPct) || 3) / 100;
      onCosts = basicWeekly * (niPct + penPct);
    }

    const total = basicWeekly + hp + allowances + onCosts;

    return { basicWeekly, hp, allowances, onCosts, total };
  }, [data.weeklyRate, data.dailyRate, data.hourlyRate, data.hpMode, data.holidayPayPct, data.kitAllowance, data.carAllowance, data.phoneAllowance, data.computerAllowance, data.travelAllowance, data.perDiem, data.housingAllowance, data.customAllowances, data.employerNiPct, data.pensionPct, data.phPct, data.ficaPct, country]);

  return (
    <Card className="sticky top-20">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <CardHeader className="pb-0 px-3 pt-3">
          <TabsList className="w-full h-8">
            <TabsTrigger value="summary" className="text-[10px] flex-1">Summary</TabsTrigger>
            <TabsTrigger value="timecard" className="text-[10px] flex-1">Timecard</TabsTrigger>
            <TabsTrigger value="cost" className="text-[10px] flex-1">Cost Est.</TabsTrigger>
          </TabsList>
        </CardHeader>
        <CardContent className="px-3 pb-3 pt-2">
          {/* ── Summary Tab ──────────────────────────────────── */}
          <TabsContent value="summary" className="mt-0 space-y-3">
            {/* Person & Production */}
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1">Deal</p>
              {data.productionId && (
                <SummaryRow label="Production" value={classificationLabels?.production || "Selected"} />
              )}
              {data.personId && (
                <SummaryRow label="Person" value={classificationLabels?.person || "Selected"} />
              )}
              {classificationLabels?.union && (
                <SummaryRow label="Union" value={classificationLabels.union} />
              )}
              {classificationLabels?.designation && (
                <SummaryRow label="Role" value={classificationLabels.designation} />
              )}
              {classificationLabels?.budgetTier && (
                <SummaryRow label="Tier" value={classificationLabels.budgetTier} />
              )}
            </div>

            <Separator />

            {/* Rates */}
            {(data.weeklyRate > 0 || data.dailyRate > 0) && (
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1">Rates</p>
                {data.weeklyRate > 0 && <SummaryRow label="Weekly" value={`${cs}${Number(data.weeklyRate).toLocaleString()}`} icon={Banknote} />}
                {data.dailyRate > 0 && <SummaryRow label="Daily" value={`${cs}${Number(data.dailyRate).toLocaleString()}`} />}
                {data.hourlyRate > 0 && <SummaryRow label="Hourly" value={`${cs}${Number(data.hourlyRate).toLocaleString()}`} />}
                {data.hpMode && data.hpMode !== "na" && (
                  <SummaryRow label="Holiday Pay" value={data.hpMode === "incl" ? "Included" : "Excluded (+12.07%)"} />
                )}
              </div>
            )}

            <Separator />

            {/* Allowances */}
            {costEstimate.allowances > 0 && (
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1">Allowances</p>
                {data.kitAllowance > 0 && <SummaryRow label="Kit" value={`${cs}${data.kitAllowance}/wk`} />}
                {data.carAllowance > 0 && <SummaryRow label="Car" value={`${cs}${data.carAllowance}/wk`} />}
                {data.perDiem > 0 && <SummaryRow label="Per Diem" value={`${cs}${data.perDiem}/day`} />}
                <SummaryRow label="Total Allowances" value={`${cs}${costEstimate.allowances.toFixed(0)}/wk`} highlight="font-semibold" />
              </div>
            )}

            {/* Status */}
            <Separator />
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1">Status</p>
              <SummaryRow label="Territory" value={country || "—"} />
              <SummaryRow label="Deal Type" value={data.dealType || "—"} />
              <SummaryRow label="Dates" value={data.startDate ? `${data.startDate}${data.endDate ? ` → ${data.endDate}` : ""}` : "—"} />
            </div>
          </TabsContent>

          {/* ── Timecard Preview Tab ─────────────────────────── */}
          <TabsContent value="timecard" className="mt-0 space-y-2">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1">Weekly Timecard Template</p>
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => (
              <div key={day} className="flex items-center justify-between rounded-md bg-muted/30 px-2 py-1.5">
                <span className="text-xs font-medium w-8">{day}</span>
                {i < 5 ? (
                  <>
                    <span className="text-[10px] text-muted-foreground">
                      {data.standardWorkDayHrs || 10}hrs + {data.lunchBreakHrs || 1}hr lunch
                    </span>
                    <Badge variant="secondary" className="text-[9px] h-4">Work</Badge>
                  </>
                ) : i === 5 ? (
                  <>
                    <span className="text-[10px] text-muted-foreground">
                      {data.sixthDayMultiplier ? `×${data.sixthDayMultiplier}` : "×1.5"} premium
                    </span>
                    <Badge variant="outline" className="text-[9px] h-4 text-amber-500 border-amber-500/30">6th</Badge>
                  </>
                ) : (
                  <>
                    <span className="text-[10px] text-muted-foreground">Rest day</span>
                    <Badge variant="outline" className="text-[9px] h-4 text-emerald-500 border-emerald-500/30">Rest</Badge>
                  </>
                )}
              </div>
            ))}
            <Separator />
            <SummaryRow label="Standard Day" value={`${data.standardWorkDayHrs || 10} hrs`} icon={Clock} />
            <SummaryRow label="Turnaround" value={`${data.turnaroundMinHrs || 11} hrs min`} icon={Clock} />
            {data.mealPenaltyAmount > 0 && (
              <SummaryRow label="Meal Penalty" value={`${cs}${data.mealPenaltyAmount} after ${data.mealPenaltyAfterHrs || 6}hrs`} />
            )}
          </TabsContent>

          {/* ── Cost Estimate Tab ────────────────────────────── */}
          <TabsContent value="cost" className="mt-0 space-y-2">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1">Weekly Cost to Production</p>

            <SummaryRow label="Basic Pay" value={`${cs}${costEstimate.basicWeekly.toFixed(0)}`} icon={DollarSign} />
            {costEstimate.hp > 0 && (
              <SummaryRow label="Holiday Pay" value={`${cs}${costEstimate.hp.toFixed(0)}`} icon={Receipt} highlight="text-amber-500" />
            )}
            <SummaryRow label="Allowances" value={`${cs}${costEstimate.allowances.toFixed(0)}`} icon={Briefcase} />
            <SummaryRow label="Employer On-costs" value={`${cs}${costEstimate.onCosts.toFixed(0)}`} icon={TrendingDown} highlight="text-red-500" />

            <Separator />

            <div className="flex items-center justify-between py-2">
              <span className="text-xs font-semibold flex items-center gap-1.5">
                <Landmark className="size-3.5 text-primary" />
                Total Weekly Cost
              </span>
              <span className="text-sm font-bold tabular-nums">{cs}{costEstimate.total.toFixed(0)}</span>
            </div>

            {/* Mini bar */}
            <div className="mt-1">
              <div className="h-2 rounded-full bg-muted overflow-hidden flex">
                <div className="bg-primary" style={{ width: `${costEstimate.total > 0 ? (costEstimate.basicWeekly / costEstimate.total * 100) : 0}%` }} />
                <div className="bg-amber-500" style={{ width: `${costEstimate.total > 0 ? (costEstimate.hp / costEstimate.total * 100) : 0}%` }} />
                <div className="bg-blue-500" style={{ width: `${costEstimate.total > 0 ? (costEstimate.allowances / costEstimate.total * 100) : 0}%` }} />
                <div className="bg-red-500" style={{ width: `${costEstimate.total > 0 ? (costEstimate.onCosts / costEstimate.total * 100) : 0}%` }} />
              </div>
              <div className="flex gap-3 mt-1.5 flex-wrap">
                <span className="flex items-center gap-1 text-[9px] text-muted-foreground"><span className="size-1.5 rounded-full bg-primary" />Basic</span>
                <span className="flex items-center gap-1 text-[9px] text-muted-foreground"><span className="size-1.5 rounded-full bg-amber-500" />HP</span>
                <span className="flex items-center gap-1 text-[9px] text-muted-foreground"><span className="size-1.5 rounded-full bg-blue-500" />Allow.</span>
                <span className="flex items-center gap-1 text-[9px] text-muted-foreground"><span className="size-1.5 rounded-full bg-red-500" />On-costs</span>
              </div>
            </div>

            <Separator className="mt-2" />
            <p className="text-[10px] text-muted-foreground text-center">
              Estimated {(costEstimate.total * 52).toLocaleString(undefined, { style: "currency", currency: country === "US" ? "USD" : country === "AU" ? "AUD" : "GBP", maximumFractionDigits: 0 })}/year
            </p>
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  );
}
