import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Building2, MapPin, AlertTriangle } from "lucide-react";

/**
 * Ltd Company Day Log — lightweight alternative to full timecard.
 * Shows only: date, worked (yes/no), UK location (yes/no).
 * NO time fields (IR35 risk — Ltd workers don't fill timecards).
 * Linked to Purchase Order, not deal memo rates.
 */
export default function LtdDayLog({ entries = [], weekStartDate, onEntryChange, disabled = false }) {
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const handleToggle = (dayIndex, field, value) => {
    const updated = { ...entries[dayIndex], [field]: value };
    onEntryChange?.(dayIndex, updated);
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-start gap-2 rounded-md bg-amber-500/10 border border-amber-500/20 px-3 py-2">
        <AlertTriangle className="size-4 text-amber-500 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium text-amber-500">Ltd Company Day Log</p>
          <p className="text-xs text-amber-500/80">
            This is a simplified day log for Ltd company / corporate workers. Time fields are not shown to maintain IR35 compliance.
            Invoice against your Purchase Order separately.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Building2 className="size-5 text-primary" />
            Days Worked
          </CardTitle>
          <CardDescription>Mark which days you worked and whether in the UK (for AVEC/HETVC qualification).</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-2.5 font-medium">Day</th>
                  <th className="text-center px-4 py-2.5 font-medium">Worked</th>
                  <th className="text-center px-4 py-2.5 font-medium">
                    <div className="flex items-center justify-center gap-1">
                      <MapPin className="size-3.5" /> UK Location
                    </div>
                  </th>
                  <th className="text-left px-4 py-2.5 font-medium">Notes</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, i) => (
                  <tr key={i} className={cn("border-t", entry?.worked === false && "opacity-50")}>
                    <td className="px-4 py-3">
                      <div>
                        <span className="font-semibold">{dayLabels[i] || `Day ${i + 1}`}</span>
                        {entry?.date && (
                          <span className="text-xs text-muted-foreground ml-2">
                            {new Date(entry.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' })}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Switch
                        checked={entry?.worked ?? false}
                        onCheckedChange={(v) => handleToggle(i, 'worked', v)}
                        disabled={disabled}
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Switch
                        checked={entry?.ukLocation ?? true}
                        onCheckedChange={(v) => handleToggle(i, 'ukLocation', v)}
                        disabled={disabled || !entry?.worked}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={entry?.notes || ''}
                        onChange={(e) => handleToggle(i, 'notes', e.target.value)}
                        placeholder="Optional notes"
                        disabled={disabled}
                        className="w-full bg-transparent text-sm border-b border-transparent hover:border-border focus:border-primary outline-none py-1"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
            <span>Days worked: <strong className="text-foreground">{entries.filter(e => e?.worked).length}</strong></span>
            <span>UK days: <strong className="text-foreground">{entries.filter(e => e?.worked && e?.ukLocation !== false).length}</strong></span>
            <span>Non-UK: <strong className="text-foreground">{entries.filter(e => e?.worked && e?.ukLocation === false).length}</strong></span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
