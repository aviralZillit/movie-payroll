import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Lock, Plus } from "lucide-react";

const ALLOWANCE_TYPES = [
  { key: "per_diem", label: "Per Diem", emoji: "🍽️", description: "Daily meal & incidentals allowance" },
  { key: "mileage", label: "Mileage", emoji: "🚗", description: "Vehicle travel reimbursement" },
  { key: "meal_buyout", label: "Meal Buyout", emoji: "🧾", description: "Replacement for catered meal" },
  { key: "kit_rental", label: "Kit Rental", emoji: "🎒", description: "Personal equipment rental" },
];

export default function AllowanceModal({ open, onOpenChange, onAdd, dealMemo, currencySymbol = "£" }) {
  const [selectedType, setSelectedType] = useState(null);
  const [amount, setAmount] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [miles, setMiles] = useState("");
  const [returnTrip, setReturnTrip] = useState(false);
  const [notes, setNotes] = useState("");
  const cs = currencySymbol;

  const reset = () => {
    setSelectedType(null);
    setAmount("");
    setQuantity(1);
    setMiles("");
    setReturnTrip(false);
    setNotes("");
  };

  const handleAdd = () => {
    if (!selectedType) return;
    const allowance = {
      type: selectedType,
      name: ALLOWANCE_TYPES.find(t => t.key === selectedType)?.label || selectedType,
      amount: Number(amount) || 0,
      quantity,
      miles: Number(miles) || 0,
      returnTrip,
      notes,
    };
    // Calculate total based on type
    if (selectedType === "mileage") {
      const mileRate = 0.45; // HMRC rate, could come from deal memo
      const totalMiles = returnTrip ? Number(miles) * 2 : Number(miles);
      allowance.amount = Math.round(totalMiles * mileRate * 100) / 100;
    } else if (selectedType === "kit_rental") {
      allowance.amount = Number(amount) * quantity;
    } else if (selectedType === "per_diem") {
      allowance.amount = Number(amount) * quantity;
    }
    onAdd?.(allowance);
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Allowance</DialogTitle>
          <DialogDescription>Select an allowance type and enter details.</DialogDescription>
        </DialogHeader>

        {/* Lock notice */}
        <div className="flex items-center gap-2 rounded-md bg-amber-500/10 border border-amber-500/20 px-3 py-2 text-xs text-amber-500">
          <Lock className="size-3.5 shrink-0" />
          OT is system-calculated from your times — allowances do not affect OT
        </div>

        {/* Type selector */}
        {!selectedType ? (
          <div className="grid grid-cols-2 gap-3 py-2">
            {ALLOWANCE_TYPES.map(t => (
              <button
                key={t.key}
                onClick={() => setSelectedType(t.key)}
                className="flex flex-col items-center gap-2 rounded-lg border p-4 hover:border-primary/50 hover:bg-muted/30 transition-colors"
              >
                <span className="text-2xl">{t.emoji}</span>
                <span className="text-sm font-medium">{t.label}</span>
                <span className="text-[10px] text-muted-foreground text-center">{t.description}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline">{ALLOWANCE_TYPES.find(t => t.key === selectedType)?.emoji} {ALLOWANCE_TYPES.find(t => t.key === selectedType)?.label}</Badge>
              <button onClick={() => setSelectedType(null)} className="text-xs text-muted-foreground hover:text-foreground">Change</button>
            </div>

            {/* Dynamic fields per type */}
            {selectedType === "per_diem" && (
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label className="text-xs">Daily Rate</Label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{cs}</span>
                    <Input type="number" step="0.01" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} className="pl-6 h-8 text-sm" placeholder={dealMemo?.perDiemRate ? String(dealMemo.perDiemRate) : "45.00"} />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Days</Label>
                  <Input type="number" min="1" max="7" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="h-8 text-sm" />
                </div>
              </div>
            )}

            {selectedType === "mileage" && (
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label className="text-xs">Miles</Label>
                  <Input type="number" min="0" value={miles} onChange={(e) => setMiles(e.target.value)} className="h-8 text-sm" placeholder="34" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Return Trip?</Label>
                  <div className="flex items-center gap-2 h-8">
                    <input type="checkbox" checked={returnTrip} onChange={(e) => setReturnTrip(e.target.checked)} className="rounded" />
                    <span className="text-xs text-muted-foreground">Double the miles for return</span>
                  </div>
                </div>
                {miles > 0 && (
                  <div className="sm:col-span-2 text-xs text-muted-foreground">
                    {returnTrip ? Number(miles) * 2 : Number(miles)} miles × £0.45/mi = <strong>{cs}{((returnTrip ? Number(miles) * 2 : Number(miles)) * 0.45).toFixed(2)}</strong>
                  </div>
                )}
              </div>
            )}

            {selectedType === "meal_buyout" && (
              <div className="space-y-1">
                <Label className="text-xs">Amount</Label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{cs}</span>
                  <Input type="number" step="0.01" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} className="pl-6 h-8 text-sm" placeholder="15.00" />
                </div>
              </div>
            )}

            {selectedType === "kit_rental" && (
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label className="text-xs">Amount per Day</Label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{cs}</span>
                    <Input type="number" step="0.01" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} className="pl-6 h-8 text-sm" placeholder="50.00" />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Days</Label>
                  <Input type="number" min="1" max="7" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="h-8 text-sm" />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <Label className="text-xs">Notes (optional)</Label>
              <Input value={notes} onChange={(e) => setNotes(e.target.value)} className="h-8 text-sm" placeholder="Additional details..." />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => { reset(); onOpenChange(false); }}>Cancel</Button>
          <Button onClick={handleAdd} disabled={!selectedType}>
            <Plus className="size-3.5 mr-1" /> Add to Timecard
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
