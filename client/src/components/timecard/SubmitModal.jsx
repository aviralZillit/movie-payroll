import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle2, Send } from "lucide-react";

export default function SubmitModal({ open, onOpenChange, onConfirm, entries = [], weekly = {}, dealMemo = {}, currencySymbol = "£" }) {
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const cs = currencySymbol;

  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Check for warnings
  const warnings = [];
  entries.forEach((e, i) => {
    if (e.turnaroundViolation) warnings.push(`${dayLabels[i] || `Day ${i+1}`}: Turnaround violation (${e.turnaroundShortfallHrs?.toFixed(1)}h short)`);
    if (!e.callTime && !e.isRestDay && !e.isHoliday && e.dayType !== 'OFF') warnings.push(`${dayLabels[i] || `Day ${i+1}`}: Missing call time`);
    if (e.mealDelayMins > 0) warnings.push(`${dayLabels[i] || `Day ${i+1}`}: Meal delay (${e.mealDelayMins}min)`);
  });

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await onConfirm?.();
      onOpenChange(false);
    } catch (err) {
      // handled by parent
    }
    setSubmitting(false);
    setConfirmed(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) setConfirmed(false); onOpenChange(v); }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Submit Timecard for Approval</DialogTitle>
          <DialogDescription>Review your timecard before submitting. You won't be able to edit after submission.</DialogDescription>
        </DialogHeader>

        {/* Summary table */}
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-3 py-2 font-medium">Day</th>
                <th className="text-left px-3 py-2 font-medium">Type</th>
                <th className="text-right px-3 py-2 font-medium">Call</th>
                <th className="text-right px-3 py-2 font-medium">Release</th>
                <th className="text-right px-3 py-2 font-medium">Straight</th>
                <th className="text-right px-3 py-2 font-medium">OT</th>
                <th className="text-right px-3 py-2 font-medium">Day Total</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e, i) => (
                <tr key={i} className={cn("border-t", e.isRestDay && "opacity-50")}>
                  <td className="px-3 py-1.5 font-medium">{dayLabels[i] || `Day ${i+1}`}</td>
                  <td className="px-3 py-1.5"><Badge variant="outline" className="text-[9px]">{e.dayType || '—'}</Badge></td>
                  <td className="px-3 py-1.5 text-right font-mono text-xs">{e.callTime || '—'}</td>
                  <td className="px-3 py-1.5 text-right font-mono text-xs">{e.release || e.wrapTime || '—'}</td>
                  <td className="px-3 py-1.5 text-right tabular-nums">{e.straightHrs > 0 ? `${e.straightHrs.toFixed(1)}h` : '—'}</td>
                  <td className="px-3 py-1.5 text-right tabular-nums text-amber-500">{e.ot1x5Hrs > 0 ? `${e.ot1x5Hrs.toFixed(1)}h` : '—'}</td>
                  <td className="px-3 py-1.5 text-right tabular-nums font-medium">{e.dayTotal > 0 ? `${cs}${e.dayTotal.toLocaleString()}` : '—'}</td>
                </tr>
              ))}
              {/* Totals row */}
              <tr className="border-t-2 font-bold">
                <td className="px-3 py-2" colSpan={4}>Weekly Total</td>
                <td className="px-3 py-2 text-right tabular-nums">{weekly.totalStraightHrs?.toFixed(1) || 0}h</td>
                <td className="px-3 py-2 text-right tabular-nums text-amber-500">{weekly.totalOtHrs?.toFixed(1) || 0}h</td>
                <td className="px-3 py-2 text-right tabular-nums">{cs}{(weekly.wkGross || 0).toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Warnings */}
        {warnings.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-amber-500 flex items-center gap-1">
              <AlertTriangle className="size-3.5" /> {warnings.length} warning{warnings.length !== 1 ? 's' : ''}
            </p>
            {warnings.map((w, i) => (
              <p key={i} className="text-[10px] text-amber-500/80 pl-5">• {w}</p>
            ))}
          </div>
        )}

        {/* Confirmation */}
        <label className="flex items-center gap-2 cursor-pointer">
          <Checkbox checked={confirmed} onCheckedChange={setConfirmed} />
          <span className="text-sm">I confirm these times are accurate and ready for approval</span>
        </label>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!confirmed || submitting} className="bg-emerald-600 hover:bg-emerald-700">
            <Send className="size-3.5 mr-1.5" />
            {submitting ? "Submitting..." : "Submit for Approval"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
