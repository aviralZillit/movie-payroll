import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Film,
  Search,
  MapPin,
  Calendar,
  Banknote,
  Users,
  Clapperboard,
  FileText,
  Clock,
  Plus,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import api from "@/lib/axios";

const STATUS_CONFIG = {
  pre_production: { label: "Pre-Production", color: "bg-amber-500/15 text-amber-500 border-amber-500/30" },
  production: { label: "In Production", color: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30" },
  post_production: { label: "Post-Production", color: "bg-blue-500/15 text-blue-500 border-blue-500/30" },
  wrapped: { label: "Wrapped", color: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30" },
  cancelled: { label: "Cancelled", color: "bg-red-500/15 text-red-500 border-red-500/30" },
};

const TYPE_LABELS = {
  feature_film: "Feature Film",
  tv_drama: "TV Drama",
  tv_comedy: "TV Comedy",
  tv_entertainment: "TV Entertainment",
  short_film: "Short Film",
  documentary: "Documentary",
  commercial: "Commercial",
  animation: "Animation",
};

function useProductions() {
  return useQuery({
    queryKey: ["productions"],
    queryFn: async () => {
      const { data } = await api.get("/productions");
      return data.data;
    },
  });
}

export default function Productions() {
  const navigate = useNavigate();
  const { data: productions, isLoading } = useProductions();
  const [search, setSearch] = useState("");

  const filtered = (productions || []).filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.code?.toLowerCase().includes(q) ||
      p.companyName?.toLowerCase().includes(q)
    );
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Productions</h1>
          <p className="text-sm text-muted-foreground">
            Manage your film and TV productions
          </p>
        </div>
        <Button className="cursor-pointer">
          <Plus className="h-4 w-4 mr-1.5" />
          New Production
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Search productions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Production Cards */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="py-16">
          <CardContent className="flex flex-col items-center justify-center text-center">
            <Film className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-lg font-medium text-muted-foreground">
              No productions found
            </p>
            <p className="text-sm text-muted-foreground/60 mt-1">
              {search ? "Try a different search term" : "Create your first production to get started"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((production, i) => (
            <ProductionCard
              key={production._id}
              production={production}
              index={i}
              onClick={() => navigate(`/productions/${production._id}`)}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}

function ProductionCard({ production, index, onClick }) {
  const p = production;
  const statusCfg = STATUS_CONFIG[p.status] || STATUS_CONFIG.pre_production;
  const memberCount = p.members?.length || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card
        className="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-primary/20 hover:-translate-y-0.5"
        onClick={onClick}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg truncate group-hover:text-primary transition-colors">
                {p.name}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1.5">
                <Badge
                  variant="outline"
                  className={cn("text-[10px] font-medium border", statusCfg.color)}
                >
                  {statusCfg.label}
                </Badge>
                {p.code && (
                  <span className="text-[11px] font-mono text-muted-foreground">
                    {p.code}
                  </span>
                )}
              </div>
            </div>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Clapperboard className="h-5 w-5 text-primary" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Type + Country */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Film className="h-3.5 w-3.5" />
              {TYPE_LABELS[p.productionType] || p.productionType}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              {p.country || "--"}
            </span>
          </div>

          {/* Budget */}
          <div className="flex items-center gap-1.5 text-sm">
            <Banknote className="h-3.5 w-3.5 text-emerald-500" />
            <span className="font-semibold">{formatCurrency(p.budget, p.country)}</span>
            <span className="text-muted-foreground">budget</span>
          </div>

          {/* Dates */}
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            {p.startDate
              ? format(parseISO(p.startDate), "dd MMM yyyy")
              : "TBD"}
            {p.endDate && (
              <span>
                {" "}— {format(parseISO(p.endDate), "dd MMM yyyy")}
              </span>
            )}
          </div>

          {/* Footer stats */}
          <div className="flex items-center gap-4 pt-2 border-t border-border/50 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {memberCount} member{memberCount !== 1 ? "s" : ""}
            </span>
            {p.companyName && (
              <span className="truncate">{p.companyName}</span>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
