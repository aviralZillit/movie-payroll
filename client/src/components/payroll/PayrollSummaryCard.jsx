import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function PayrollSummaryCard({
  label,
  value,
  icon: Icon,
  trend,
  trendLabel,
  className,
  delay = 0,
  variant = "default",
}) {
  const variantStyles = {
    default: "bg-card",
    primary: "bg-primary/5 ring-primary/20",
    success: "bg-emerald-50 ring-emerald-200/50 dark:bg-emerald-950/20 dark:ring-emerald-800/30",
    warning: "bg-amber-50 ring-amber-200/50 dark:bg-amber-950/20 dark:ring-amber-800/30",
    danger: "bg-red-50 ring-red-200/50 dark:bg-red-950/20 dark:ring-red-800/30",
  };

  const iconColors = {
    default: "text-muted-foreground",
    primary: "text-primary",
    success: "text-emerald-600 dark:text-emerald-400",
    warning: "text-amber-600 dark:text-amber-400",
    danger: "text-red-600 dark:text-red-400",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card className={cn("transition-shadow hover:shadow-md", variantStyles[variant], className)}>
        <CardContent className="pt-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1.5">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {label}
              </p>
              <p className="text-2xl font-bold tabular-nums tracking-tight">
                {value}
              </p>
              {trend !== undefined && (
                <div className="flex items-center gap-1">
                  <span
                    className={cn(
                      "text-xs font-medium",
                      trend > 0
                        ? "text-emerald-600 dark:text-emerald-400"
                        : trend < 0
                        ? "text-red-600 dark:text-red-400"
                        : "text-muted-foreground"
                    )}
                  >
                    {trend > 0 ? "+" : ""}
                    {trend}%
                  </span>
                  {trendLabel && (
                    <span className="text-xs text-muted-foreground">
                      {trendLabel}
                    </span>
                  )}
                </div>
              )}
            </div>
            {Icon && (
              <div
                className={cn(
                  "rounded-lg bg-background p-2 ring-1 ring-border/50",
                  iconColors[variant]
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
