import { memo, useMemo } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { AlertCircle, Plane, Coffee, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import TimeInput from "./TimeInput";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const DEFAULT_DAY_TYPES = [
  { name: 'SWD', color: '#3b82f6', isWorkDay: true },     // Standard Work Day
  { name: 'CWD', color: '#14b8a6', isWorkDay: true },     // Camera Work Day
  { name: 'SCWD', color: '#a855f7', isWorkDay: true },    // Special Camera Work Day
  { name: 'Shoot', color: '#3b82f6', isWorkDay: true },
  { name: 'Prep', color: '#f59e0b', isWorkDay: true },
  { name: 'Wrap', color: '#8b5cf6', isWorkDay: true },
  { name: 'RIG', color: '#f97316', isWorkDay: true },     // Rigging
  { name: 'TRVL', color: '#eab308', isWorkDay: false },   // Travel
  { name: 'HOL', color: '#22c55e', isWorkDay: false },    // Holiday
  { name: 'SICK', color: '#ef4444', isWorkDay: false },   // Sick
  { name: 'OFF', color: '#6b7280', isWorkDay: false },    // Day Off / Rest
];

const NON_WORK_DAY_TYPES = ['OFF', 'TRVL', 'HOL', 'SICK', 'Rest', 'Travel'];

function TimecardDayRow({
  entry,
  dayIndex,
  date,
  onChange,
  disabled = false,
  isSixthDay = false,
  isSeventhDay = false,
  standardDayHrs = 11,
  dayTypes,
}) {
  const availableDayTypes = dayTypes?.length > 0 ? dayTypes : DEFAULT_DAY_TYPES;
  const currentDayType = entry?.dayType || 'Shoot';
  const isNonWorkDayType = NON_WORK_DAY_TYPES.some(
    (t) => currentDayType.toLowerCase().includes(t.toLowerCase())
  ) || availableDayTypes.find((dt) => dt.name === currentDayType)?.isWorkDay === false;
  const dayLabel = DAY_LABELS[dayIndex] || "";
  const dateStr = date ? format(new Date(date), "dd/MM") : "";
  const fullDateStr = date ? format(new Date(date), "EEE dd MMM") : "";

  const hasMealPenalty = (entry?.mealPenaltyCount > 0) || (entry?.mealPenalty === true);
  const hasTurnaroundWarning = entry?.turnaroundViolation || (entry?.turnaroundWarning === true);
  const isRestDay = entry?.isRestDay || false;
  const isTravelDay = entry?.isTravelDay || false;
  const isHoliday = entry?.isHoliday || false;
  const isOff = isRestDay || isHoliday || isNonWorkDayType;

  // Client-side hour calculation for real-time display
  const hours = useMemo(() => {
    // If server has calculated values, use those
    if (entry?.totalWorkedHrs > 0) {
      return {
        total: entry.totalWorkedHrs,
        straight: entry.straightHrs || 0,
        ot15: entry.ot1x5Hrs || 0,
        ot20: entry.ot2xHrs || 0,
      };
    }
    // Otherwise calculate client-side from time fields
    const call = entry?.callTime;
    const wrap = entry?.wrapTime;
    const lunchS = entry?.lunchStart;
    const lunchE = entry?.lunchEnd;
    if (!call || !wrap) return { total: 0, straight: 0, ot15: 0, ot20: 0 };

    const toMin = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + (m || 0); };
    let callMin = toMin(call);
    let wrapMin = toMin(wrap);
    if (wrapMin <= callMin) wrapMin += 24 * 60; // overnight

    let lunchDuration = 0;
    if (lunchS && lunchE) {
      let ls = toMin(lunchS);
      let le = toMin(lunchE);
      if (le < ls) le += 24 * 60;
      lunchDuration = (le - ls) / 60;
    }

    const total = Math.round(((wrapMin - callMin) / 60 - lunchDuration) * 100) / 100;
    const stdDay = standardDayHrs || 11;
    const straight = Math.min(total, stdDay);
    const otTotal = Math.max(0, total - stdDay);

    return { total, straight, ot15: otTotal, ot20: 0 };
  }, [entry?.callTime, entry?.wrapTime, entry?.lunchStart, entry?.lunchEnd, entry?.totalWorkedHrs, entry?.straightHrs, entry?.ot1x5Hrs, entry?.ot2xHrs, standardDayHrs]);

  const handleFieldChange = (field, value) => {
    onChange?.({ ...entry, [field]: value });
  };

  const rowHighlight = isSeventhDay
    ? "bg-red-50/60 dark:bg-red-950/20"
    : isSixthDay
    ? "bg-amber-50/60 dark:bg-amber-950/20"
    : isOff
    ? "bg-muted/40"
    : "";

  return (
    <motion.tr
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: dayIndex * 0.03 }}
      className={cn(
        "group border-b border-border/50 transition-colors hover:bg-muted/30",
        rowHighlight
      )}
    >
      {/* Day & Date */}
      <td className="sticky left-0 z-10 bg-inherit px-3 py-2">
        <div className="flex items-center gap-2">
          <div className="flex flex-col">
            <span className={cn(
              "text-sm font-semibold",
              isSixthDay && "text-amber-600 dark:text-amber-400",
              isSeventhDay && "text-red-600 dark:text-red-400"
            )}>
              {dayLabel}
            </span>
            <span className="text-xs text-muted-foreground">{dateStr}</span>
          </div>
          {isSixthDay && (
            <Tooltip>
              <TooltipTrigger>
                <span className="inline-flex h-4 items-center rounded bg-amber-100 px-1 text-[10px] font-medium text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                  6th
                </span>
              </TooltipTrigger>
              <TooltipContent>6th consecutive work day</TooltipContent>
            </Tooltip>
          )}
          {isSeventhDay && (
            <Tooltip>
              <TooltipTrigger>
                <span className="inline-flex h-4 items-center rounded bg-red-100 px-1 text-[10px] font-medium text-red-700 dark:bg-red-900/40 dark:text-red-400">
                  7th
                </span>
              </TooltipTrigger>
              <TooltipContent>7th consecutive work day</TooltipContent>
            </Tooltip>
          )}
        </div>
      </td>

      {/* Day Type */}
      <td className="px-1.5 py-2">
        <select
          value={currentDayType}
          onChange={(e) => handleFieldChange("dayType", e.target.value)}
          disabled={disabled}
          className={cn(
            "h-8 w-[110px] rounded-md border border-input bg-background px-2 text-xs font-medium",
            "focus:outline-none focus:ring-1 focus:ring-ring",
            "disabled:cursor-not-allowed disabled:opacity-50"
          )}
        >
          {availableDayTypes.map((dt) => (
            <option key={dt.name} value={dt.name}>
              {dt.name}
            </option>
          ))}
        </select>
        {/* Color dot indicator */}
        {(() => {
          const dtColor = availableDayTypes.find((dt) => dt.name === currentDayType)?.color;
          return dtColor ? (
            <span
              className="ml-1 inline-block h-2 w-2 rounded-full align-middle"
              style={{ backgroundColor: dtColor }}
            />
          ) : null;
        })()}
      </td>

      {/* Crew Call — editable by crew */}
      <td className="px-1.5 py-2">
        <TimeInput
          value={entry?.callTime || ""}
          onChange={(v) => handleFieldChange("callTime", v)}
          disabled={disabled || isOff}
          placeholder="06:00"
        />
      </td>

      {/* Unit Call — locked (set by AD/production), amend with reason */}
      <td className="px-1.5 py-2">
        <TimeInput
          value={entry?.unitCall || ""}
          onChange={(v) => handleFieldChange("unitCall", v)}
          disabled={disabled || isOff}
          placeholder="07:00"
        />
      </td>

      {/* Unit Wrap — locked (set by AD/production), amend with reason */}
      <td className="px-1.5 py-2">
        <TimeInput
          value={entry?.unitWrap || entry?.lunchEnd || ""}
          onChange={(v) => handleFieldChange("unitWrap", v)}
          disabled={disabled || isOff}
          placeholder="18:00"
        />
      </td>

      {/* Release — crew's actual departure */}
      <td className="px-1.5 py-2">
        <TimeInput
          value={entry?.release || entry?.wrapTime || ""}
          onChange={(v) => {
            handleFieldChange("release", v);
            handleFieldChange("wrapTime", v); // backward compat
          }}
          disabled={disabled || isOff}
          placeholder="19:00"
        />
      </td>

      {/* Total Hours */}
      <td className="px-2 py-2 text-right tabular-nums">
        <span className="text-sm font-medium">
          {hours.total > 0 ? hours.total.toFixed(1) : "-"}
        </span>
      </td>

      {/* Straight */}
      <td className="px-2 py-2 text-right tabular-nums">
        <span className="text-sm text-muted-foreground">
          {hours.straight > 0 ? hours.straight.toFixed(1) : "-"}
        </span>
      </td>

      {/* Pre-Call OT */}
      <td className="px-2 py-2 text-right tabular-nums">
        <span className={cn("text-sm", (entry?.preCallOTMins > 0 || hours.ot15 > 0) && "font-medium text-teal-600 dark:text-teal-400")}>
          {entry?.preCallOTMins > 0 ? (entry.preCallOTMins / 60).toFixed(1) : hours.ot15 > 0 ? hours.ot15.toFixed(1) : "-"}
        </span>
      </td>

      {/* Filming OT */}
      <td className="px-2 py-2 text-right tabular-nums">
        <span className={cn("text-sm", entry?.filmingOTMins > 0 && "font-medium text-amber-600 dark:text-amber-400")}>
          {entry?.filmingOTMins > 0 ? (entry.filmingOTMins / 60).toFixed(1) : "-"}
        </span>
      </td>

      {/* Wrap OT */}
      <td className="px-2 py-2 text-right tabular-nums">
        <span className={cn("text-sm", (entry?.wrapOTMins > 0 || hours.ot20 > 0) && "font-medium text-red-600 dark:text-red-400")}>
          {entry?.wrapOTMins > 0 ? (entry.wrapOTMins / 60).toFixed(1) : hours.ot20 > 0 ? hours.ot20.toFixed(1) : "-"}
        </span>
      </td>

      {/* Indicators */}
      <td className="px-2 py-2">
        <div className="flex items-center gap-1.5">
          {hasMealPenalty && (
            <Tooltip>
              <TooltipTrigger>
                <span className="relative flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-50" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
                </span>
              </TooltipTrigger>
              <TooltipContent>Meal penalty - lunch break violated</TooltipContent>
            </Tooltip>
          )}
          {hasTurnaroundWarning && (
            <Tooltip>
              <TooltipTrigger>
                <div className="flex items-center gap-0.5">
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                  {entry?.turnaroundHrs != null && (
                    <span className="text-[10px] font-medium text-orange-500 tabular-nums">{entry.turnaroundHrs.toFixed(1)}h</span>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                Turnaround: {entry?.turnaroundHrs != null ? `${entry.turnaroundHrs.toFixed(1)}hrs rest` : 'insufficient rest'}
                {entry?.turnaroundShortfallHrs > 0 && ` (${entry.turnaroundShortfallHrs.toFixed(1)}hrs short)`}
              </TooltipContent>
            </Tooltip>
          )}
          {!hasTurnaroundWarning && entry?.turnaroundHrs > 0 && (
            <Tooltip>
              <TooltipTrigger>
                <span className="text-[10px] text-muted-foreground tabular-nums">{entry.turnaroundHrs.toFixed(1)}h</span>
              </TooltipTrigger>
              <TooltipContent>Turnaround: {entry.turnaroundHrs.toFixed(1)}hrs rest from previous wrap</TooltipContent>
            </Tooltip>
          )}
        </div>
      </td>

      {/* Toggles */}
      <td className="px-2 py-2">
        <div className="flex items-center gap-3">
          <Tooltip>
            <TooltipTrigger>
              <div className="flex items-center gap-1">
                <Plane className={cn("h-3.5 w-3.5", isTravelDay ? "text-blue-500" : "text-muted-foreground/40")} />
                <Switch
                  size="sm"
                  checked={isTravelDay}
                  onCheckedChange={(v) => handleFieldChange("isTravelDay", v)}
                  disabled={disabled}
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>Travel Day</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger>
              <div className="flex items-center gap-1">
                <Coffee className={cn("h-3.5 w-3.5", isRestDay ? "text-green-500" : "text-muted-foreground/40")} />
                <Switch
                  size="sm"
                  checked={isRestDay}
                  onCheckedChange={(v) => handleFieldChange("isRestDay", v)}
                  disabled={disabled}
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>Rest Day</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger>
              <div className="flex items-center gap-1">
                <Star className={cn("h-3.5 w-3.5", isHoliday ? "text-purple-500" : "text-muted-foreground/40")} />
                <Switch
                  size="sm"
                  checked={isHoliday}
                  onCheckedChange={(v) => handleFieldChange("isHoliday", v)}
                  disabled={disabled}
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>Holiday</TooltipContent>
          </Tooltip>
        </div>
      </td>
    </motion.tr>
  );
}

export default memo(TimecardDayRow);
