import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle } from "lucide-react";
import TimeInput from "./TimeInput";

export default function AmendModal({ open, onOpenChange, onAmend, field, currentValue, entryDate }) {
  const [newValue, setNewValue] = useState(currentValue || "");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  const fieldLabels = {
    unitCall: "Unit Call",
    unitWrap: "Unit Wrap",
  };

  const handleSave = async () => {
    if (!newValue || !reason.trim()) return;
    setSaving(true);
    try {
      await onAmend?.({ field, newValue, reason: reason.trim() });
      onOpenChange(false);
      setReason("");
    } catch (err) {
      // error handled by parent
    }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Amend {fieldLabels[field] || field}</DialogTitle>
          <DialogDescription>
            This field was set by production. Your amendment will be logged and visible to the production accountant.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-xs">Original</Label>
              <div className="h-9 px-3 rounded-md border bg-muted/50 flex items-center text-sm font-mono text-muted-foreground">
                {currentValue || "—"}
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">New Time</Label>
              <TimeInput
                value={newValue}
                onChange={setNewValue}
                placeholder="HH:MM"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">
              Reason for Amendment <span className="text-destructive">*</span>
            </Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. GPS failed to log my departure, actual wrap was 19:30 not 18:00..."
              rows={3}
              className="text-sm"
            />
            {reason.length > 0 && reason.length < 10 && (
              <p className="text-[10px] text-amber-500">Please provide more detail</p>
            )}
          </div>

          <div className="flex items-start gap-2 rounded-md bg-amber-500/10 border border-amber-500/20 px-3 py-2">
            <AlertTriangle className="size-3.5 text-amber-500 mt-0.5 shrink-0" />
            <p className="text-[10px] text-amber-500">
              This amendment will be flagged as "Manual" and logged with your name, timestamp, and reason.
              Your producer and production accountant will see this change.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={!newValue || !reason.trim() || saving}>
            {saving ? "Saving..." : "Save Amendment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
