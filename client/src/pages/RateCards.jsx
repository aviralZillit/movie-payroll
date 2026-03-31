import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PoundSterling,
  Clock,
  CalendarDays,
  Moon,
  AlertCircle,
  Search,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import InfoTooltip from "@/components/common/InfoTooltip";
import {
  useUnions,
  useDepartments,
  useDesignations,
  useBudgetTiers,
  useRateLookup,
  useOvertimeRules,
} from "@/hooks/useRateCards";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatGBP(value) {
  if (value == null) return "--";
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 2,
  }).format(value);
}

function formatPercent(value) {
  if (value == null) return "--";
  return `${value}%`;
}

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StatCard({ label, value, icon: Icon, accent = false, sourceUrl, sourceDocument }) {
  return (
    <motion.div variants={cardVariants}>
      <Card
        className={`relative overflow-hidden backdrop-blur-sm transition-shadow hover:shadow-lg ${
          accent
            ? "bg-gradient-to-br from-primary/5 to-primary/10 ring-primary/20"
            : "bg-card/80"
        }`}
      >
        <CardContent className="flex items-start justify-between gap-3 pt-1">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {label}
            </p>
            <p
              className={`text-2xl font-bold tracking-tight ${
                accent ? "text-primary" : "text-foreground"
              }`}
            >
              {value}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <InfoTooltip sourceUrl={sourceUrl} sourceDocument={sourceDocument} />
            {Icon && (
              <div
                className={`rounded-lg p-2 ${
                  accent
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <Icon className="size-4" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function SmallStatCard({ label, value, sourceUrl, sourceDocument }) {
  return (
    <motion.div variants={cardVariants}>
      <Card className="bg-card/80 backdrop-blur-sm transition-shadow hover:shadow-lg">
        <CardContent className="flex items-center justify-between gap-2 pt-1">
          <div className="space-y-0.5">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {label}
            </p>
            <p className="text-lg font-semibold text-foreground">{value}</p>
          </div>
          <InfoTooltip sourceUrl={sourceUrl} sourceDocument={sourceDocument} />
        </CardContent>
      </Card>
    </motion.div>
  );
}

function FilterSelect({
  label,
  placeholder,
  value,
  onValueChange,
  options,
  disabled,
  loading,
}) {
  const selectedLabel = (options ?? []).find((o) => o._id === value)?.name;
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <Select value={value ?? ""} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger className="w-[200px]">
          {selectedLabel ? (
            <span className="truncate">{selectedLabel}</span>
          ) : (
            <SelectValue placeholder={loading ? "Loading..." : placeholder} />
          )}
        </SelectTrigger>
        <SelectContent>
          {(options ?? []).map((opt) => (
            <SelectItem key={opt._id} value={opt._id}>
              {opt.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function RateCardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

function OvertimeRulesTable({ rules }) {
  if (!rules || rules.length === 0) return null;

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="visible">
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="size-4 text-primary" />
            Overtime Rules
          </CardTitle>
          <CardDescription>
            Applicable overtime multipliers and thresholds
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rule</TableHead>
                <TableHead>After Hours</TableHead>
                <TableHead>After Time</TableHead>
                <TableHead>Multiplier</TableHead>
                <TableHead>Applies To</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.map((rule, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium">{rule.name}</TableCell>
                  <TableCell>
                    {rule.afterHours != null ? `${rule.afterHours}h` : "--"}
                  </TableCell>
                  <TableCell>{rule.afterTime ?? "--"}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{rule.multiplier}x</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {rule.appliesTo ?? "--"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function RateCards() {
  // Selection state
  const [unionId, setUnionId] = useState(null);
  const [departmentId, setDepartmentId] = useState(null);
  const [designationId, setDesignationId] = useState(null);
  const [budgetTierId, setBudgetTierId] = useState(null);

  // Data hooks
  const { data: unions, isLoading: unionsLoading } = useUnions();
  const { data: departments, isLoading: deptsLoading } = useDepartments(unionId);
  const { data: designations, isLoading: desigsLoading } = useDesignations(departmentId);
  const { data: budgetTiers, isLoading: tiersLoading } = useBudgetTiers(unionId);
  const { data: overtimeRules } = useOvertimeRules(unionId);

  const rateLookup = useRateLookup();

  // Reset downstream selections when upstream changes
  const handleUnionChange = useCallback((id) => {
    setUnionId(id);
    setDepartmentId(null);
    setDesignationId(null);
    setBudgetTierId(null);
    rateLookup.reset();
  }, []);

  const handleDepartmentChange = useCallback((id) => {
    setDepartmentId(id);
    setDesignationId(null);
    rateLookup.reset();
  }, []);

  const handleDesignationChange = useCallback((id) => {
    setDesignationId(id);
    rateLookup.reset();
  }, []);

  const handleBudgetTierChange = useCallback((id) => {
    setBudgetTierId(id);
    rateLookup.reset();
  }, []);

  // Auto-fetch rates when all selects are filled
  useEffect(() => {
    if (unionId && departmentId && designationId && budgetTierId) {
      rateLookup.mutate({ unionId, departmentId, designationId, budgetTierId });
    }
  }, [unionId, departmentId, designationId, budgetTierId]);

  const rates = rateLookup.data;
  const ratesLoading = rateLookup.isPending;
  const ratesError = rateLookup.isError;
  const allSelected = unionId && departmentId && designationId && budgetTierId;

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Rate Cards</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Browse union rate cards by selecting a union, department, designation, and
          budget tier.
        </p>
      </div>

      {/* Cascading Selects */}
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardContent className="pt-1">
          <div className="flex flex-wrap items-end gap-4">
            <FilterSelect
              label="Country"
              placeholder="United Kingdom"
              value="uk"
              onValueChange={() => {}}
              options={[{ _id: "uk", name: "United Kingdom" }]}
              disabled
            />

            <FilterSelect
              label="Union"
              placeholder="Select union"
              value={unionId}
              onValueChange={handleUnionChange}
              options={unions}
              loading={unionsLoading}
              disabled={unionsLoading}
            />

            <FilterSelect
              label="Department"
              placeholder="Select department"
              value={departmentId}
              onValueChange={handleDepartmentChange}
              options={departments}
              loading={deptsLoading}
              disabled={!unionId || deptsLoading}
            />

            <FilterSelect
              label="Designation"
              placeholder="Select designation"
              value={designationId}
              onValueChange={handleDesignationChange}
              options={designations}
              loading={desigsLoading}
              disabled={!departmentId || desigsLoading}
            />

            <FilterSelect
              label="Budget Tier"
              placeholder="Select tier"
              value={budgetTierId}
              onValueChange={handleBudgetTierChange}
              options={budgetTiers}
              loading={tiersLoading}
              disabled={!unionId || tiersLoading}
            />
          </div>
        </CardContent>
      </Card>

      {/* Empty state */}
      {!allSelected && !rates && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-16 text-muted-foreground"
        >
          <Search className="size-10 opacity-40" />
          <p className="text-sm">
            Select all filters above to view rate card details.
          </p>
        </motion.div>
      )}

      {/* Loading state */}
      {ratesLoading && <RateCardSkeleton />}

      {/* Error state */}
      {ratesError && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
        >
          <AlertCircle className="size-5 shrink-0" />
          <p>
            Failed to load rate card. Please check your selections and try again.
          </p>
        </motion.div>
      )}

      {/* Rate Cards Display */}
      <AnimatePresence mode="wait">
        {rates && !ratesLoading && (
          <motion.div
            key="rates"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="space-y-6"
          >
            {/* Primary rates */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <StatCard
                label="Weekly Rate"
                value={formatGBP(rates.weeklyRate)}
                icon={CalendarDays}
                accent
                sourceUrl={rates.sourceUrl}
                sourceDocument={rates.sourceDocument}
              />
              <StatCard
                label="Daily Rate"
                value={formatGBP(rates.dailyRate)}
                icon={CalendarDays}
                sourceUrl={rates.sourceUrl}
                sourceDocument={rates.sourceDocument}
              />
              <StatCard
                label="Hourly Rate"
                value={formatGBP(rates.hourlyRate)}
                icon={Clock}
                sourceUrl={rates.sourceUrl}
                sourceDocument={rates.sourceDocument}
              />
            </div>

            {/* Secondary rates */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
              <SmallStatCard
                label="OT 1.5x"
                value={formatGBP(rates.overtimeRate1x5)}
                sourceUrl={rates.sourceUrl}
                sourceDocument={rates.sourceDocument}
              />
              <SmallStatCard
                label="OT 2x"
                value={formatGBP(rates.overtimeRate2x)}
                sourceUrl={rates.sourceUrl}
                sourceDocument={rates.sourceDocument}
              />
              <SmallStatCard
                label="6th Day"
                value={formatGBP(rates.sixthDayRate)}
                sourceUrl={rates.sourceUrl}
                sourceDocument={rates.sourceDocument}
              />
              <SmallStatCard
                label="7th Day"
                value={formatGBP(rates.seventhDayRate)}
                sourceUrl={rates.sourceUrl}
                sourceDocument={rates.sourceDocument}
              />
              <SmallStatCard
                label="Night Premium"
                value={formatPercent(rates.nightPremiumPct)}
                sourceUrl={rates.sourceUrl}
                sourceDocument={rates.sourceDocument}
              />
            </div>

            {/* Holiday pay & notes */}
            {(rates.holidayPayInclusive != null || rates.notes) && (
              <motion.div variants={cardVariants}>
                <Card className="bg-card/80 backdrop-blur-sm">
                  <CardContent className="flex flex-wrap gap-6 pt-1">
                    {rates.holidayPayInclusive != null && (
                      <div className="space-y-0.5">
                        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          Holiday Pay
                        </p>
                        <Badge
                          variant={
                            rates.holidayPayInclusive ? "default" : "secondary"
                          }
                        >
                          {rates.holidayPayInclusive ? "Inclusive" : "Exclusive"}
                        </Badge>
                      </div>
                    )}
                    {rates.notes && (
                      <div className="space-y-0.5">
                        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          Notes
                        </p>
                        <p className="text-sm text-foreground">{rates.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Overtime rules table */}
            <OvertimeRulesTable rules={overtimeRules} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
