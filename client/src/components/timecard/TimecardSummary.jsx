import { useMemo } from "react";
import { motion } from "framer-motion";
import { Clock, Timer, AlertTriangle, TrendingUp } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

function SummaryRow({ label, value, icon: Icon, highlight, className }) {
  return (
    <div className={cn("flex items-center justify-between py-2", className)}>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {Icon && <Icon className="h-3.5 w-3.5" />}
        <span>{label}</span>
      </div>
      <span
        className={cn(
          "text-sm font-semibold tabular-nums",
          highlight === "amber" && "text-amber-600 dark:text-amber-400",
          highlight === "red" && "text-red-600 dark:text-red-400",
          highlight === "green" && "text-emerald-600 dark:text-emerald-400"
        )}
      >
        {value}
      </span>
    </div>
  );
}

export default function TimecardSummary({ entries = [], standardDayHrs = 11 }) {
  const toMin = (t) => { if (!t) return 0; const [h, m] = t.split(':').map(Number); return h * 60 + (m || 0); };

  const totals = useMemo(() => {
    const result = {
      totalHours: 0,
      straightHours: 0,
      ot15Hours: 0,
      ot20Hours: 0,
      daysWorked: 0,
      mealPenalties: 0,
      turnaroundWarnings: 0,
      travelDays: 0,
      restDays: 0,
      holidays: 0,
    };

    entries.forEach((entry) => {
      if (!entry) return;

      // Skip rest days and holidays for hour totals
      if (entry.isRestDay || entry.isHoliday) {
        if (entry.isRestDay) result.restDays++;
        if (entry.isHoliday) result.holidays++;
        if (entry.isTravelDay) result.travelDays++;
        return;
      }

      // Use server values if available, otherwise calculate client-side
      let total = entry.totalWorkedHrs || entry.totalHours || 0;
      let straight = entry.straightHrs || entry.straightHours || 0;
      let ot15 = entry.ot1x5Hrs || entry.ot15Hours || 0;
      let ot20 = entry.ot2xHrs || entry.ot20Hours || 0;

      if (total === 0 && entry.callTime && entry.wrapTime) {
        let callMin = toMin(entry.callTime);
        let wrapMin = toMin(entry.wrapTime);
        if (wrapMin <= callMin) wrapMin += 24 * 60;
        let lunchDur = 0;
        if (entry.lunchStart && entry.lunchEnd) {
          let ls = toMin(entry.lunchStart);
          let le = toMin(entry.lunchEnd);
          if (le < ls) le += 24 * 60;
          lunchDur = (le - ls) / 60;
        }
        total = Math.round(((wrapMin - callMin) / 60 - lunchDur) * 100) / 100;
        straight = Math.min(total, standardDayHrs);
        ot15 = Math.max(0, total - standardDayHrs);
      }

      result.totalHours += total;
      result.straightHours += straight;
      result.ot15Hours += ot15;
      result.ot20Hours += ot20;

      if (entry.callTime && entry.wrapTime) {
        result.daysWorked++;
      }
      if (entry.mealPenaltyCount > 0 || entry.mealPenalty) result.mealPenalties++;
      if (entry.turnaroundViolation || entry.turnaroundWarning) result.turnaroundWarnings++;
      if (entry.isTravelDay) result.travelDays++;
    });

    return result;
  }, [entries]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            Weekly Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-1 divide-y divide-border/50">
            {/* Main hours */}
            <div className="pb-3">
              <div className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Hours
              </div>
              <SummaryRow
                label="Total Hours"
                value={`${totals.totalHours.toFixed(1)}h`}
                icon={Clock}
              />
              <SummaryRow
                label="Straight Time"
                value={`${totals.straightHours.toFixed(1)}h`}
                icon={Timer}
              />
              <SummaryRow
                label="OT 1.5x"
                value={`${totals.ot15Hours.toFixed(1)}h`}
                icon={TrendingUp}
                highlight={totals.ot15Hours > 0 ? "amber" : undefined}
              />
              <SummaryRow
                label="OT 2x"
                value={`${totals.ot20Hours.toFixed(1)}h`}
                icon={TrendingUp}
                highlight={totals.ot20Hours > 0 ? "red" : undefined}
              />
            </div>

            {/* Days breakdown */}
            <div className="py-3">
              <div className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Days
              </div>
              <SummaryRow label="Days Worked" value={totals.daysWorked} />
              {totals.travelDays > 0 && (
                <SummaryRow label="Travel Days" value={totals.travelDays} />
              )}
              {totals.restDays > 0 && (
                <SummaryRow label="Rest Days" value={totals.restDays} />
              )}
              {totals.holidays > 0 && (
                <SummaryRow label="Holidays" value={totals.holidays} />
              )}
            </div>

            {/* Warnings */}
            {(totals.mealPenalties > 0 || totals.turnaroundWarnings > 0) && (
              <div className="pt-3">
                <div className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Alerts
                </div>
                {totals.mealPenalties > 0 && (
                  <SummaryRow
                    label="Meal Penalties"
                    value={totals.mealPenalties}
                    icon={AlertTriangle}
                    highlight="red"
                  />
                )}
                {totals.turnaroundWarnings > 0 && (
                  <SummaryRow
                    label="Turnaround Warnings"
                    value={totals.turnaroundWarnings}
                    icon={AlertTriangle}
                    highlight="amber"
                  />
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
