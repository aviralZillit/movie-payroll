import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Clock, MapPin, LogIn, LogOut } from "lucide-react";
import api from "@/lib/axios";
import useAuthStore from "@/store/authStore";

export default function PunchClock() {
  const user = useAuthStore(s => s.user);
  const queryClient = useQueryClient();
  const [location, setLocation] = useState(null);
  const [gettingLocation, setGettingLocation] = useState(false);

  // Get today's punches
  const { data: todayPunches } = useQuery({
    queryKey: ["punches", "today"],
    queryFn: async () => { const { data } = await api.get("/punch/today"); return data.data || []; },
    refetchInterval: 30000,
  });

  const lastPunch = todayPunches?.length > 0 ? todayPunches[todayPunches.length - 1] : null;
  const isPunchedIn = lastPunch?.type === "punch_in";

  const getLocation = () => new Promise((resolve, reject) => {
    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => { setGettingLocation(false); resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy }); },
      (err) => { setGettingLocation(false); resolve(null); }, // silently fail
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });

  const punchIn = useMutation({
    mutationFn: async () => {
      const loc = await getLocation();
      const { data } = await api.post("/punch/in", { productionId: user?.activeProductionId, location: loc });
      return data;
    },
    onSuccess: () => { toast.success("Punched In"); queryClient.invalidateQueries({ queryKey: ["punches"] }); },
    onError: (err) => toast.error(err?.response?.data?.message || "Failed"),
  });

  const punchOut = useMutation({
    mutationFn: async () => {
      const loc = await getLocation();
      const { data } = await api.post("/punch/out", { productionId: user?.activeProductionId, location: loc });
      return data;
    },
    onSuccess: () => { toast.success("Punched Out"); queryClient.invalidateQueries({ queryKey: ["punches"] }); },
    onError: (err) => toast.error(err?.response?.data?.message || "Failed"),
  });

  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center min-h-[calc(100vh-120px)] p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl">Punch Clock</CardTitle>
          <p className="text-4xl font-bold font-mono tabular-nums mt-2">{timeStr}</p>
          <p className="text-sm text-muted-foreground mt-1">{now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status */}
          <div className="text-center">
            {isPunchedIn ? (
              <Badge className="bg-emerald-500 text-white text-lg px-4 py-1">Clocked In</Badge>
            ) : (
              <Badge variant="outline" className="text-lg px-4 py-1">Not Clocked In</Badge>
            )}
          </div>

          {/* Big Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              size="lg"
              className="h-24 text-lg bg-emerald-600 hover:bg-emerald-700"
              disabled={isPunchedIn || punchIn.isPending}
              onClick={() => punchIn.mutate()}
            >
              <LogIn className="size-6 mr-2" />
              {punchIn.isPending ? "..." : "Punch In"}
            </Button>
            <Button
              size="lg"
              variant="destructive"
              className="h-24 text-lg"
              disabled={!isPunchedIn || punchOut.isPending}
              onClick={() => punchOut.mutate()}
            >
              <LogOut className="size-6 mr-2" />
              {punchOut.isPending ? "..." : "Punch Out"}
            </Button>
          </div>

          {/* Today's log */}
          {todayPunches?.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Today's Log</p>
              {todayPunches.map((p, i) => (
                <div key={i} className="flex items-center justify-between text-sm rounded-md border px-3 py-2">
                  <div className="flex items-center gap-2">
                    {p.type === "punch_in" ? <LogIn className="size-3.5 text-emerald-500" /> : <LogOut className="size-3.5 text-red-500" />}
                    <span>{p.type === "punch_in" ? "In" : "Out"}</span>
                  </div>
                  <span className="font-mono text-xs">{new Date(p.timestamp).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</span>
                  {p.location?.lat && <MapPin className="size-3 text-emerald-500" />}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
