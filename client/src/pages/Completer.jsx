import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Lock, Users, Clock, ChevronDown, ChevronUp, Check, AlertTriangle, Info } from "lucide-react";
import api from "@/lib/axios";
import useAuthStore from "@/store/authStore";
import TimeInput from "@/components/timecard/TimeInput";

// ── Privacy Banner ───────────────────────────────────────────────────
function PrivacyBanner({ ownRate }) {
  return (
    <div className="rounded-lg bg-red-500/5 border border-red-500/20 px-4 py-3 flex items-center gap-3">
      <Lock className="size-5 text-red-400 shrink-0" />
      <div>
        <p className="text-sm font-medium text-red-400">Rate Confidentiality</p>
        <p className="text-xs text-muted-foreground">
          You can see hours and OT breakdown for all crew, but rate details are hidden for privacy.
        </p>
      </div>
      {ownRate && (
        <Badge className="ml-auto bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs">
          Your rate: {ownRate}
        </Badge>
      )}
    </div>
  );
}

// ── Crew Card in Left Panel ──────────────────────────────────────────
function CrewCard({ crew, isSelected, isSelf, onClick, dayStatuses = [] }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left rounded-lg border p-3 transition-colors",
        isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/30",
      )}
    >
      <div className="flex items-center gap-2">
        <div className={cn("size-8 rounded-full flex items-center justify-center text-xs font-bold",
          isSelf ? "bg-amber-500/20 text-amber-400" : "bg-primary/10 text-primary"
        )}>
          {crew.initials || crew.name?.substring(0, 2).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-medium truncate">{crew.name}</p>
            {isSelf && <Badge className="bg-amber-500 text-white text-[8px] px-1 py-0">YOU</Badge>}
          </div>
          <p className="text-xs text-muted-foreground truncate">{crew.role}</p>
        </div>
      </div>
      {/* Day dots */}
      <div className="flex gap-1 mt-2">
        {['M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => {
          const status = dayStatuses[i] || 'pending';
          return (
            <div key={i} className={cn("size-4 rounded-full border text-[7px] flex items-center justify-center font-bold",
              status === 'approved' && "bg-emerald-500/20 border-emerald-500/30 text-emerald-400",
              status === 'entered' && "bg-primary/20 border-primary/30 text-primary",
              status === 'off' && "bg-muted border-border text-muted-foreground",
              status === 'pending' && "bg-muted/50 border-border text-muted-foreground/50",
            )}>{d}</div>
          );
        })}
      </div>
    </button>
  );
}

// ── Main Completer Page ──────────────────────────────────────────────
export default function Completer() {
  const { deptId } = useParams();
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const [selectedCrewId, setSelectedCrewId] = useState(null);

  // Fetch department crew timecards
  const { data: deptData, isLoading } = useQuery({
    queryKey: ["completer", deptId],
    queryFn: async () => {
      const { data } = await api.get(`/timecards/completer/${deptId}`);
      return data.data || data;
    },
    enabled: !!deptId,
  });

  const crew = deptData?.crew || [];
  const selectedCrew = crew.find(c => c.id === selectedCrewId) || crew[0];
  const isSelf = selectedCrew?.id === (user?._id || user?.id);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex h-[calc(100vh-64px)]">
      {/* Left Panel — Crew List */}
      <div className="w-72 border-r overflow-y-auto p-4 space-y-3">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            {deptData?.department || "Department"}
          </h2>
          <p className="text-xs text-muted-foreground">{crew.length} crew</p>
        </div>
        <div className="space-y-2">
          {crew.map(c => (
            <CrewCard
              key={c.id}
              crew={c}
              isSelected={selectedCrew?.id === c.id}
              isSelf={c.id === (user?._id || user?.id)}
              onClick={() => setSelectedCrewId(c.id)}
              dayStatuses={c.dayStatuses}
            />
          ))}
        </div>
        <Button className="w-full" size="sm" disabled={!crew.some(c => c.submitted)}>
          Submit All Completed
        </Button>
      </div>

      {/* Main Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <PrivacyBanner ownRate={isSelf ? `${selectedCrew?.currency || '£'}${selectedCrew?.hourlyRate || 0}/hr` : null} />

        {selectedCrew ? (
          <>
            {/* Crew Header */}
            <div className="flex items-center gap-4">
              <div className={cn("size-12 rounded-full flex items-center justify-center text-lg font-bold",
                isSelf ? "bg-amber-500/20 text-amber-400" : "bg-primary/10 text-primary"
              )}>
                {selectedCrew.initials || selectedCrew.name?.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-bold">{selectedCrew.name}</h2>
                <p className="text-sm text-muted-foreground">{selectedCrew.role} — {deptData?.department}</p>
              </div>
              {isSelf ? (
                <Card className="ml-auto bg-amber-500/5 border-amber-500/20 px-4 py-2">
                  <p className="text-xs text-amber-400 font-medium">Your Scale Rate</p>
                  <p className="text-lg font-bold text-amber-400 tabular-nums">{selectedCrew.currency || '£'}{selectedCrew.hourlyRate || 0}/hr</p>
                </Card>
              ) : (
                <Card className="ml-auto bg-muted/50 px-4 py-2">
                  <div className="flex items-center gap-2">
                    <Lock className="size-4 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Rate confidential</p>
                  </div>
                </Card>
              )}
            </div>

            {/* Week Summary Strip */}
            <div className="grid grid-cols-6 gap-3">
              <Card className="p-3 text-center"><p className="text-xs text-muted-foreground">Days</p><p className="text-lg font-bold">{selectedCrew.daysWorked || 0}/6</p></Card>
              <Card className="p-3 text-center"><p className="text-xs text-muted-foreground">ST Hours</p><p className="text-lg font-bold">{selectedCrew.straightHrs || 0}</p></Card>
              <Card className="p-3 text-center"><p className="text-xs text-muted-foreground">OT Hours</p><p className="text-lg font-bold text-amber-500">{selectedCrew.otHrs || 0}</p></Card>
              <Card className="p-3 text-center"><p className="text-xs text-muted-foreground">DT Hours</p><p className="text-lg font-bold text-red-500">{selectedCrew.dtHrs || 0}</p></Card>
              <Card className="p-3 text-center"><p className="text-xs text-muted-foreground">Meals</p><p className="text-lg font-bold">{selectedCrew.mealFlags || 0}</p></Card>
              <Card className={cn("p-3 text-center", isSelf ? "bg-amber-500/5 border-amber-500/20" : "opacity-50")}>
                <p className="text-xs text-muted-foreground">Week Gross</p>
                {isSelf ? (
                  <p className="text-lg font-bold text-amber-400 tabular-nums">{selectedCrew.currency || '£'}{(selectedCrew.weekGross || 0).toLocaleString()}</p>
                ) : (
                  <div className="flex items-center justify-center gap-1"><Lock className="size-3 text-muted-foreground" /><span className="text-xs text-muted-foreground">Hidden</span></div>
                )}
              </Card>
            </div>

            {/* Day Sections */}
            <div className="space-y-2">
              {(selectedCrew.days || []).map((day, i) => (
                <DaySection key={i} day={day} index={i} isSelf={isSelf} currency={selectedCrew.currency || '£'} />
              ))}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            Select a crew member from the left panel
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── Day Section (Collapsible) ────────────────────────────────────────
function DaySection({ day, index, isSelf, currency }) {
  const [expanded, setExpanded] = useState(index === 0);
  const cs = currency;

  return (
    <Card>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/20 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold">{day.label || `Day ${index + 1}`}</span>
          <span className="text-xs text-muted-foreground">{day.date}</span>
          {day.dayType && <Badge variant="outline" className="text-[9px]">{day.dayType}</Badge>}
          {day.isSixthDay && <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-[8px]">6TH</Badge>}
        </div>
        <div className="flex items-center gap-3">
          {day.totalHrs > 0 && <span className="text-xs text-muted-foreground">{day.totalHrs}h</span>}
          {expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
        </div>
      </button>
      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t">
          {/* Time inputs */}
          <div className="grid grid-cols-7 gap-2 pt-3">
            {['Crew Call', 'Set Call', 'M1 Out', 'M1 In', 'M2 Out', 'M2 In', 'Wrap'].map((label, i) => (
              <div key={label} className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">{label}</Label>
                <Input
                  type="text"
                  placeholder="HH:MM"
                  defaultValue={day.times?.[i] || ""}
                  className="h-8 text-xs font-mono text-center"
                  disabled={label === 'Set Call'}
                />
              </div>
            ))}
          </div>

          {/* Hours Breakdown */}
          <div className="flex gap-4 text-xs">
            <span>ST: <strong>{day.stHrs || 0}h</strong></span>
            <span className="text-amber-500">OT: <strong>{day.otHrs || 0}h</strong></span>
            <span className="text-red-500">DT: <strong>{day.dtHrs || 0}h</strong></span>
            <span>Total: <strong>{day.totalHrs || 0}h</strong></span>
            {isSelf && day.dayPay > 0 && <span className="text-amber-400 ml-auto">Day Pay: <strong>{cs}{day.dayPay.toLocaleString()}</strong></span>}
          </div>
        </div>
      )}
    </Card>
  );
}
