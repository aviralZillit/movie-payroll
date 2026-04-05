import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Globe, BookOpen, Scale, Landmark, ExternalLink,
  FileText, AlertTriangle, CheckCircle2, ChevronRight, Download,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import api from "@/lib/axios";

function useRatesBible(territoryCode) {
  return useQuery({
    queryKey: ["rates-bible", "territory", territoryCode],
    queryFn: async () => {
      const { data } = await api.get(`/rates-bible/territory/${territoryCode}`);
      return data.data;
    },
    enabled: !!territoryCode,
    staleTime: 600000,
  });
}

function useTerritories() {
  return useQuery({
    queryKey: ["territories"],
    queryFn: async () => {
      const { data } = await api.get("/territories");
      return data.data;
    },
    staleTime: 600000,
  });
}

function useRateSearch(query) {
  return useQuery({
    queryKey: ["rates-bible", "search", query],
    queryFn: async () => {
      const { data } = await api.get(`/rates-bible/search?q=${encodeURIComponent(query)}&limit=100`);
      return data.data;
    },
    enabled: query.length >= 2,
    staleTime: 30000,
  });
}

// Territory status dot
function StatusDot({ count }) {
  if (count >= 3) return <span className="h-2 w-2 rounded-full bg-emerald-500" />;
  if (count >= 1) return <span className="h-2 w-2 rounded-full bg-amber-500" />;
  return <span className="h-2 w-2 rounded-full bg-zinc-500" />;
}

// Rate row component
function RateRow({ rate, index }) {
  if (rate.isHeader) {
    return (
      <tr className="bg-muted/30">
        <td colSpan={4} className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {rate.grade}
        </td>
      </tr>
    );
  }

  return (
    <motion.tr
      initial={{ opacity: 0, y: 2 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.01 }}
      className="border-b border-border/30 hover:bg-muted/20 transition-colors"
    >
      <td className="px-3 py-2 text-sm">{rate.grade}</td>
      <td className={cn(
        "px-3 py-2 text-sm font-mono tabular-nums text-right",
        rate.isIndividuallyNegotiated && "text-purple-500 italic",
        rate.isOwnNegotiation && "text-teal-500"
      )}>
        {rate.primaryRate || "-"}
      </td>
      <td className="px-3 py-2 text-xs text-muted-foreground text-right">{rate.secondaryRate || ""}</td>
      <td className="px-3 py-2 text-xs text-muted-foreground">{rate.budgetTier || ""}</td>
    </motion.tr>
  );
}

// Rule item component
function RuleItem({ rule }) {
  return (
    <div className={cn(
      "flex items-start gap-3 py-2.5 px-3 rounded-lg",
      rule.isWarning && "bg-amber-500/5 border border-amber-500/20"
    )}>
      {rule.isWarning ? (
        <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
      ) : (
        <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
      )}
      <div>
        <span className="text-sm font-medium">{rule.key}</span>
        <p className="text-xs text-muted-foreground mt-0.5">{rule.value}</p>
      </div>
    </div>
  );
}

export default function RatesBible() {
  const [selectedTerritory, setSelectedTerritory] = useState("uk");
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarQuery, setSidebarQuery] = useState("");

  const { data: territories = [] } = useTerritories();
  const { data: agreements = [], isLoading } = useRatesBible(selectedTerritory);
  const { data: searchResults = [] } = useRateSearch(searchQuery);

  const filteredTerritories = useMemo(() => {
    if (!sidebarQuery) return territories;
    return territories.filter(t =>
      t.name.toLowerCase().includes(sidebarQuery.toLowerCase()) ||
      t.code.toLowerCase().includes(sidebarQuery.toLowerCase())
    );
  }, [territories, sidebarQuery]);

  const selectedTerritoryData = territories.find(t => t.code.toLowerCase() === selectedTerritory);

  return (
    <div className="flex flex-col md:flex-row" style={{ height: 'calc(100vh - 56px)' }}>
      {/* ── Sidebar: Territory List (horizontal scroll on mobile, vertical on desktop) ──── */}
      <div className="md:w-64 border-b md:border-b-0 md:border-r border-border bg-card flex flex-col">
        <div className="p-3 border-b border-border">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold">Territories</h2>
          </div>
          <Input
            placeholder="Search territories..."
            value={sidebarQuery}
            onChange={(e) => setSidebarQuery(e.target.value)}
            className="h-8 text-xs"
          />
        </div>
        {/* Mobile: horizontal scroll | Desktop: vertical list */}
        <div className="md:hidden overflow-x-auto">
          <div className="flex gap-1 p-1 min-w-max">
            {filteredTerritories.map((t) => (
              <button
                key={t.code}
                onClick={() => setSelectedTerritory(t.code.toLowerCase())}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors",
                  selectedTerritory === t.code.toLowerCase()
                    ? "bg-primary/10 text-primary font-medium border border-primary/30"
                    : "hover:bg-muted/50 text-muted-foreground border border-transparent"
                )}
              >
                <span>{t.flag}</span>
                <span>{t.name}</span>
              </button>
            ))}
          </div>
        </div>
        <ScrollArea className="flex-1 hidden md:block">
          <div className="p-1">
            {filteredTerritories.map((t) => (
              <button
                key={t.code}
                onClick={() => setSelectedTerritory(t.code.toLowerCase())}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-left text-sm transition-colors",
                  selectedTerritory === t.code.toLowerCase()
                    ? "bg-primary/10 text-primary font-medium"
                    : "hover:bg-muted/50 text-muted-foreground"
                )}
              >
                <span className="text-base">{t.flag}</span>
                <span className="flex-1 truncate">{t.name}</span>
                <StatusDot count={t.agreementCount} />
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* ── Main Content ────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="h-5 w-5 text-primary" />
              <div>
                <h1 className="text-xl font-bold">Global Rates Bible</h1>
                <p className="text-xs text-muted-foreground">
                  {selectedTerritoryData?.flag} {selectedTerritoryData?.name} — {selectedTerritoryData?.defaultCurrency} — {agreements.length} agreement{agreements.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search rates across all territories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
          </div>
        </div>

        {/* Search Results (overlay) */}
        {searchQuery.length >= 2 && searchResults.length > 0 && (
          <div className="px-6 py-3 bg-muted/30 border-b border-border">
            <p className="text-xs text-muted-foreground mb-2">
              Found {searchResults.length} rates matching "{searchQuery}"
            </p>
            <div className="max-h-48 overflow-y-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-muted-foreground">
                    <th className="text-left py-1 px-2">Territory</th>
                    <th className="text-left py-1 px-2">Agreement</th>
                    <th className="text-left py-1 px-2">Grade</th>
                    <th className="text-right py-1 px-2">Rate</th>
                    <th className="text-left py-1 px-2">Tier</th>
                  </tr>
                </thead>
                <tbody>
                  {searchResults.slice(0, 20).map((r, i) => (
                    <tr key={i} className="border-b border-border/20 hover:bg-muted/20">
                      <td className="py-1.5 px-2 uppercase">{r.territory}</td>
                      <td className="py-1.5 px-2 truncate max-w-[200px]">{r.agreement}</td>
                      <td className="py-1.5 px-2">{r.grade}</td>
                      <td className={cn("py-1.5 px-2 text-right font-mono", r.isIndividuallyNegotiated && "text-purple-500")}>
                        {r.primaryRate}
                      </td>
                      <td className="py-1.5 px-2 text-muted-foreground">{r.budgetTier}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Agreements Content */}
        <ScrollArea className="flex-1">
          <div className="p-6 space-y-6">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-48 rounded-lg bg-muted/30 animate-pulse" />
                ))}
              </div>
            ) : agreements.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <FileText className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">No confirmed agreements for this territory</p>
              </div>
            ) : (
              agreements.map((agreement) => (
                <Card key={agreement.agreementId} className="overflow-hidden">
                  <CardHeader className="border-b py-3 px-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-sm font-semibold">{agreement.agreementName}</CardTitle>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {agreement.union} • {agreement.type} • Effective: {agreement.effectiveFrom ? new Date(agreement.effectiveFrom).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : 'N/A'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={agreement.status === 'confirmed' ? 'default' : 'secondary'} className="text-[10px]">
                          {agreement.status}
                        </Badge>
                        {agreement.pdfUrl && (
                          <Button variant="outline" size="sm" className="h-7 text-xs" asChild>
                            <a href={agreement.pdfUrl} target="_blank" rel="noopener noreferrer">
                              <Download className="h-3 w-3 mr-1" />
                              PDF
                            </a>
                          </Button>
                        )}
                        {agreement.sourceUrl && (
                          <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
                            <a href={agreement.sourceUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Source
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                    {agreement.holidayPayNote && (
                      <div className="mt-2 flex items-start gap-2 rounded-md bg-amber-500/10 px-3 py-2">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
                        <p className="text-xs text-amber-600 dark:text-amber-400">{agreement.holidayPayNote}</p>
                      </div>
                    )}
                  </CardHeader>

                  <Tabs defaultValue="rates" className="w-full">
                    <TabsList className="w-full justify-start rounded-none border-b bg-transparent h-9 px-4">
                      <TabsTrigger value="rates" className="text-xs data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                        Rates ({agreement.rates?.filter(r => !r.isHeader).length || 0})
                      </TabsTrigger>
                      <TabsTrigger value="rules" className="text-xs data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                        Rules ({agreement.rules?.length || 0})
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="rates" className="mt-0">
                      {agreement.rates?.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b border-border text-xs text-muted-foreground">
                                <th className="text-left px-3 py-2 font-medium">Grade / Role</th>
                                <th className="text-right px-3 py-2 font-medium">Rate</th>
                                <th className="text-right px-3 py-2 font-medium">Secondary</th>
                                <th className="text-left px-3 py-2 font-medium">Budget Tier</th>
                              </tr>
                            </thead>
                            <tbody>
                              {agreement.rates.map((rate, i) => (
                                <RateRow key={i} rate={rate} index={i} />
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="p-4 text-sm text-muted-foreground">No rate data available</p>
                      )}
                    </TabsContent>

                    <TabsContent value="rules" className="mt-0 p-4">
                      {agreement.rules?.length > 0 ? (
                        <div className="space-y-2">
                          {agreement.rules.map((rule, i) => (
                            <RuleItem key={i} rule={rule} />
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No rules data available</p>
                      )}
                    </TabsContent>
                  </Tabs>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
