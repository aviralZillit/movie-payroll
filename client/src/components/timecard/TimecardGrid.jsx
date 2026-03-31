import { useMemo } from "react";
import { motion } from "framer-motion";
import { addDays, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import TimecardDayRow from "./TimecardDayRow";

const COLUMN_HEADERS = [
  { label: "Day", className: "sticky left-0 z-10 bg-background min-w-[100px]" },
  { label: "Call Time", className: "min-w-[80px]" },
  { label: "Lunch Start", className: "min-w-[80px]" },
  { label: "Lunch End", className: "min-w-[80px]" },
  { label: "Wrap Time", className: "min-w-[80px]" },
  { label: "Total", className: "min-w-[56px] text-right" },
  { label: "Straight", className: "min-w-[56px] text-right" },
  { label: "OT 1.5x", className: "min-w-[56px] text-right" },
  { label: "OT 2x", className: "min-w-[56px] text-right" },
  { label: "", className: "min-w-[48px]" },
  { label: "Flags", className: "min-w-[180px]" },
];

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
}) {
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
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              {COLUMN_HEADERS.map((col, i) => (
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
              />
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
