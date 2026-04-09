import { useMemo } from "react";
import { motion } from "framer-motion";
import { addDays, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import TimecardDayRow from "./TimecardDayRow";

// Build column headers dynamically based on deal memo settings
function buildColumnHeaders(dealMemo) {
  const dm = dealMemo || {};
  const isFlatDeal = ['flat', 'picture', 'per_film', 'flat_fee'].includes(dm.dealType);
  const isBuyout = dm.rateType === 'buyout' || dm.rateType === 'all_in';
  const noOT = !dm.overtimeApplicable || isFlatDeal || isBuyout;

  const cols = [
    { label: "Day", className: "sticky left-0 z-10 bg-background min-w-[100px]", key: "day" },
    { label: "Day Type", className: "min-w-[110px]", key: "dayType" },
    { label: "Crew Call", className: "min-w-[80px]", key: "crewCall" },
    { label: "Unit Call", className: "min-w-[80px]", key: "unitCall" },
    { label: "Unit Wrap", className: "min-w-[80px]", key: "unitWrap" },
    { label: "Release", className: "min-w-[80px]", key: "release" },
    { label: "Total", className: "min-w-[56px] text-right", key: "total" },
  ];

  if (!noOT) {
    cols.push({ label: "Straight", className: "min-w-[56px] text-right", key: "straight" });
    cols.push({ label: "Pre-Call OT", className: "min-w-[64px] text-right", key: "preCallOT" });
    cols.push({ label: "Film OT", className: "min-w-[56px] text-right", key: "filmOT" });
    cols.push({ label: "Wrap OT", className: "min-w-[56px] text-right", key: "wrapOT" });
    if (dm.btaEnabled) cols.push({ label: "BTA", className: "min-w-[48px] text-right", key: "bta" });
  }

  if (dm.mealPenaltyEnabled !== false && !isFlatDeal) {
    cols.push({ label: "Meal", className: "min-w-[48px] text-right", key: "meal" });
  }
  if (dm.nightPremiumEnabled !== false && !isFlatDeal) {
    cols.push({ label: "Night", className: "min-w-[48px] text-right", key: "night" });
  }

  cols.push({ label: "Day Total", className: "min-w-[72px] text-right", key: "dayTotal" });
  cols.push({ label: "", className: "min-w-[48px]", key: "indicators" });
  cols.push({ label: "Flags", className: "min-w-[160px]", key: "flags" });

  return cols;
}

/**
 * Detects 6th/7th consecutive work days.
 * entries: array of 7 day entries (Mon-Sun)
 */
function detectConsecutiveDays(entries) {
  const worked = entries.map(
    (e) => !e?.isRestDay && !e?.isHoliday && (e?.callTime || e?.isTravelDay)
  );

  const result = { sixthDay: -1, seventhDay: -1 };
  let streak = 0;

  for (let i = 0; i < worked.length; i++) {
    if (worked[i]) {
      streak++;
      if (streak === 6) result.sixthDay = i;
      if (streak === 7) result.seventhDay = i;
    } else {
      streak = 0;
    }
  }

  return result;
}

export default function TimecardGrid({
  entries = [],
  weekStartDate,
  onEntryChange,
  disabled = false,
  standardDayHrs,
  dayTypes,
  dealType,
  dealMemo = {},
}) {
  const isFlatDeal = ['flat', 'picture', 'per_film', 'flat_fee'].includes(dealType || dealMemo?.dealType);
  const headers = useMemo(() => buildColumnHeaders(dealMemo), [dealMemo]);
  // Build 7-day array starting from weekStartDate (Monday)
  const days = useMemo(() => {
    const start = weekStartDate ? parseISO(weekStartDate) : new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const date = addDays(start, i);
      return {
        date: date.toISOString(),
        entry: entries[i] || {},
        index: i,
      };
    });
  }, [weekStartDate, entries]);

  const { sixthDay, seventhDay } = useMemo(
    () => detectConsecutiveDays(entries),
    [entries]
  );

  const handleDayChange = (dayIndex, updatedEntry) => {
    onEntryChange?.(dayIndex, updatedEntry);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="rounded-lg border border-border bg-card shadow-sm"
    >
      {isFlatDeal && (
        <div className="px-4 py-2 border-b bg-amber-50/50 dark:bg-amber-950/20 text-sm text-amber-700 dark:text-amber-400">
          Flat deal — overtime and day premiums not applicable. Time entries for reporting purposes only.
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              {headers.map((col, i) => (
                <th
                  key={i}
                  className={cn(
                    "px-2 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground",
                    col.className
                  )}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {days.map(({ date, entry, index }) => (
              <TimecardDayRow
                key={index}
                entry={entry}
                dayIndex={index}
                date={date}
                onChange={(updated) => handleDayChange(index, updated)}
                disabled={disabled}
                isSixthDay={index === sixthDay}
                isSeventhDay={index === seventhDay}
                standardDayHrs={standardDayHrs}
                dayTypes={dayTypes}
              />
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
