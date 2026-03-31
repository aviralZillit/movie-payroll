import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import {
  Film,
  FileText,
  Clock,
  Banknote,
  Plus,
  ArrowRight,
  ClipboardList,
  Calculator,
  Activity,
  Users,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import useAuthStore from "@/store/authStore";
import api from "@/lib/axios";

// ── Dashboard data hook ───────────────────────────────────────────────
function useDashboardData() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const { data } = await api.get("/dashboard/overview");
      return data.data;
    },
    staleTime: 1000 * 60 * 3,
  });
}

// ── Stat Card ─────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, description, variant = "default", delay = 0, onClick }) {
  const variants = {
    default: "bg-card",
    primary: "bg-primary/5 ring-primary/20",
    success: "bg-emerald-50 ring-emerald-200/50 dark:bg-emerald-950/20 dark:ring-emerald-800/30",
    warning: "bg-amber-50 ring-amber-200/50 dark:bg-amber-950/20 dark:ring-amber-800/30",
    info: "bg-blue-50 ring-blue-200/50 dark:bg-blue-950/20 dark:ring-blue-800/30",
  };

  const iconColors = {
    default: "text-muted-foreground",
    primary: "text-primary",
    success: "text-emerald-600 dark:text-emerald-400",
    warning: "text-amber-600 dark:text-amber-400",
    info: "text-blue-600 dark:text-blue-400",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card
        className={cn(
          "transition-all hover:shadow-md",
          variants[variant],
          onClick && "cursor-pointer hover:ring-2 hover:ring-primary/30"
        )}
        onClick={onClick}
      >
        <CardContent className="pt-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1.5">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {label}
              </p>
              <p className="text-2xl font-bold tabular-nums tracking-tight">
                {value}
              </p>
              {description && (
                <p className="text-xs text-muted-foreground">{description}</p>
              )}
            </div>
            {Icon && (
              <div className={cn("rounded-lg bg-background p-2 ring-1 ring-border/50", iconColors[variant])}>
                <Icon className="h-5 w-5" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Quick Action Button ───────────────────────────────────────────────
function QuickAction({ icon: Icon, label, description, onClick, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <button
        onClick={onClick}
        className="group flex w-full items-center gap-4 rounded-lg border border-border bg-card p-4 text-left transition-all hover:border-primary/30 hover:bg-muted/50 hover:shadow-sm"
      >
        <div className="rounded-lg bg-primary/10 p-2.5 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground/40 transition-transform group-hover:translate-x-1 group-hover:text-primary" />
      </button>
    </motion.div>
  );
}

// ── Activity Item ─────────────────────────────────────────────────────
function ActivityItem({ activity, index }) {
  const iconMap = {
    timecard_submitted: Clock,
    timecard_approved: Clock,
    payroll_created: Banknote,
    payroll_approved: Banknote,
    deal_memo_created: FileText,
    production_created: Film,
  };
  const Icon = iconMap[activity.type] || Activity;

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-start gap-3 py-2.5"
    >
      <div className="mt-0.5 rounded-full bg-muted p-1.5">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm">
          <span className="font-medium">{activity.user}</span>{" "}
          <span className="text-muted-foreground">{activity.action}</span>
        </p>
        <p className="text-xs text-muted-foreground">
          {activity.timestamp ? formatDate(activity.timestamp) : ""}
        </p>
      </div>
    </motion.div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { data: dashboard, isLoading } = useDashboardData();

  const stats = dashboard ? {
    activeProductions: dashboard.productions?.active ?? 0,
    openDealMemos: dashboard.dealMemos?.total ?? 0,
    pendingTimecards: dashboard.timecards?.pendingApproval ?? 0,
    thisWeekPayroll: dashboard.payroll?.totalGross ?? 0,
  } : {};
  const recentActivity = dashboard?.recentActivity || [];
  const payrollTrend = dashboard?.payrollTrend || [];

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 p-6"
    >
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {greeting}, {user?.firstName || user?.fullName?.split(" ")[0] || "there"}
        </h1>
        <p className="text-sm text-muted-foreground">
          Here is an overview of your production payroll
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))
        ) : (
          <>
            <StatCard
              label="Active Productions"
              value={stats.activeProductions ?? 0}
              icon={Film}
              variant="primary"
              delay={0}
              onClick={() => navigate("/productions")}
            />
            <StatCard
              label="Open Deal Memos"
              value={stats.openDealMemos ?? 0}
              icon={FileText}
              variant="info"
              description="Pending approval"
              delay={0.05}
              onClick={() => navigate("/deal-memos")}
            />
            <StatCard
              label="Pending Timecards"
              value={stats.pendingTimecards ?? 0}
              icon={Clock}
              variant="warning"
              description="Awaiting review"
              delay={0.1}
              onClick={() => navigate("/timecards")}
            />
            <StatCard
              label="This Week's Payroll"
              value={formatCurrency(stats.thisWeekPayroll || 0)}
              icon={Banknote}
              variant="success"
              delay={0.15}
              onClick={() => navigate("/payroll")}
            />
          </>
        )}
      </div>

      {/* Main content grid */}
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Left column */}
        <div className="space-y-6">
          {/* Weekly payroll trend */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Weekly Payroll Trend
              </CardTitle>
              <CardDescription>Gross payroll over the past weeks</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {isLoading ? (
                <Skeleton className="h-[260px] w-full" />
              ) : payrollTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={payrollTrend}>
                    <defs>
                      <linearGradient id="payrollGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                      opacity={0.5}
                    />
                    <XAxis
                      dataKey="week"
                      tick={{ fontSize: 12 }}
                      stroke="hsl(var(--muted-foreground))"
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      stroke="hsl(var(--muted-foreground))"
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                    />
                    <RechartsTooltip
                      formatter={(value) => formatCurrency(value)}
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid hsl(var(--border))",
                        backgroundColor: "hsl(var(--popover))",
                        color: "hsl(var(--popover-foreground))",
                        fontSize: "12px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="gross"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      fill="url(#payrollGradient)"
                      dot={{ fill: "hsl(var(--primary))", r: 3, strokeWidth: 0 }}
                      activeDot={{ r: 5, strokeWidth: 0 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
                  No payroll data yet
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              {isLoading ? (
                <div className="space-y-3 py-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : recentActivity.length > 0 ? (
                <div className="divide-y divide-border/50">
                  {recentActivity.slice(0, 8).map((activity, i) => (
                    <ActivityItem
                      key={activity._id || i}
                      activity={activity}
                      index={i}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
                  No recent activity
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column - Quick Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              <QuickAction
                icon={FileText}
                label="Create Deal Memo"
                description="Set up a new crew deal"
                onClick={() => navigate("/deal-memos/new")}
                delay={0.1}
              />
              <QuickAction
                icon={ClipboardList}
                label="Enter Timecard"
                description="Log weekly hours"
                onClick={() => navigate("/timecards")}
                delay={0.15}
              />
              <QuickAction
                icon={Calculator}
                label="Run Payroll"
                description="Process weekly payments"
                onClick={() => navigate("/payroll")}
                delay={0.2}
              />
            </CardContent>
          </Card>

          {/* Summary breakdown */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-6 w-full" />
                  ))}
                </div>
              ) : (
                <dl className="space-y-3">
                  <div className="flex items-center justify-between">
                    <dt className="text-sm text-muted-foreground">Total Crew</dt>
                    <dd className="text-sm font-semibold tabular-nums">
                      {stats.totalCrew ?? 0}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-sm text-muted-foreground">Timecards This Week</dt>
                    <dd className="text-sm font-semibold tabular-nums">
                      {stats.timecardsThisWeek ?? 0}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-sm text-muted-foreground">Avg. Weekly Hours</dt>
                    <dd className="text-sm font-semibold tabular-nums">
                      {stats.avgWeeklyHours?.toFixed(1) ?? "-"}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-sm text-muted-foreground">OT Rate This Week</dt>
                    <dd className="text-sm font-semibold tabular-nums">
                      {stats.otRate != null ? `${stats.otRate.toFixed(0)}%` : "-"}
                    </dd>
                  </div>
                </dl>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
