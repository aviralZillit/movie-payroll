import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Plus,
  Minus,
  Equal,
  DollarSign,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn, formatCurrency } from "@/lib/utils";

function BreakdownStep({ label, amount, type = "add", delay = 0 }) {
  const icons = {
    add: <Plus className="h-3 w-3" />,
    subtract: <Minus className="h-3 w-3" />,
    equals: <Equal className="h-3 w-3" />,
    base: <DollarSign className="h-3 w-3" />,
  };

  const colors = {
    add: "bg-emerald-50 text-emerald-700 ring-emerald-200/50 dark:bg-emerald-950/30 dark:text-emerald-400 dark:ring-emerald-800/30",
    subtract: "bg-red-50 text-red-700 ring-red-200/50 dark:bg-red-950/30 dark:text-red-400 dark:ring-red-800/30",
    equals: "bg-primary/10 text-primary ring-primary/20",
    base: "bg-muted text-foreground ring-border",
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="flex items-center gap-3"
    >
      <div
        className={cn(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full ring-1",
          colors[type]
        )}
      >
        {icons[type]}
      </div>
      <div className="flex flex-1 items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span
          className={cn(
            "text-sm font-semibold tabular-nums",
            type === "subtract" && "text-red-600 dark:text-red-400",
            type === "add" && "text-emerald-600 dark:text-emerald-400",
            type === "equals" && "text-foreground"
          )}
        >
          {type === "subtract" ? "-" : type === "add" ? "+" : ""}
          {formatCurrency(Math.abs(amount))}
        </span>
      </div>
    </motion.div>
  );
}

function Connector() {
  return (
    <div className="flex justify-center py-0.5">
      <div className="h-4 w-px bg-border" />
    </div>
  );
}

export default function GrossToNetBreakdown({
  basePay = 0,
  overtimePay = 0,
  penalties = 0,
  allowances = 0,
  grossPay = 0,
  tax = 0,
  employeeNI = 0,
  pension = 0,
  otherDeductions = 0,
  netPay = 0,
  // Employer fringes
  holidayPay = 0,
  employerNI = 0,
  employerPension = 0,
  totalCost = 0,
}) {
  const steps = useMemo(
    () => [
      { label: "Base Pay", amount: basePay, type: "base" },
      ...(overtimePay > 0
        ? [{ label: "Overtime Pay", amount: overtimePay, type: "add" }]
        : []),
      ...(penalties > 0
        ? [{ label: "Penalties", amount: penalties, type: "add" }]
        : []),
      ...(allowances > 0
        ? [{ label: "Allowances", amount: allowances, type: "add" }]
        : []),
      { label: "Gross Pay", amount: grossPay, type: "equals" },
      { label: "Income Tax (PAYE)", amount: tax, type: "subtract" },
      ...(employeeNI > 0
        ? [{ label: "Employee NI", amount: employeeNI, type: "subtract" }]
        : []),
      ...(pension > 0
        ? [{ label: "Pension", amount: pension, type: "subtract" }]
        : []),
      ...(otherDeductions > 0
        ? [{ label: "Other Deductions", amount: otherDeductions, type: "subtract" }]
        : []),
      { label: "Net Pay", amount: netPay, type: "equals" },
    ],
    [basePay, overtimePay, penalties, allowances, grossPay, tax, employeeNI, pension, otherDeductions, netPay]
  );

  const hasEmployerFringes = holidayPay > 0 || employerNI > 0 || employerPension > 0;

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle className="text-sm">Gross to Net Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-0">
          {steps.map((step, i) => (
            <div key={`${step.label}-${i}`}>
              {i > 0 && <Connector />}
              <BreakdownStep
                label={step.label}
                amount={step.amount}
                type={step.type}
                delay={i * 0.05}
              />
            </div>
          ))}
        </div>

        {/* Visual bar */}
        <div className="mt-6 space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Gross</span>
            <span>Net</span>
          </div>
          <div className="relative h-3 overflow-hidden rounded-full bg-muted">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: grossPay > 0 ? `${(netPay / grossPay) * 100}%` : "0%",
              }}
              transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary to-emerald-500"
            />
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium tabular-nums">
              {formatCurrency(grossPay)}
            </span>
            <span className="font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
              {formatCurrency(netPay)}
            </span>
          </div>
        </div>
        {/* Employer fringes breakdown */}
        {hasEmployerFringes && (
          <div className="mt-6 pt-4 border-t space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Employer On-Costs</p>
            {holidayPay > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Holiday Pay</span>
                <span className="font-medium tabular-nums">{formatCurrency(holidayPay)}</span>
              </div>
            )}
            {employerNI > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Employer NI / FICA</span>
                <span className="font-medium tabular-nums">{formatCurrency(employerNI)}</span>
              </div>
            )}
            {employerPension > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Employer Pension</span>
                <span className="font-medium tabular-nums">{formatCurrency(employerPension)}</span>
              </div>
            )}
            {totalCost > 0 && (
              <div className="flex justify-between text-sm font-semibold pt-1 border-t">
                <span>Total Cost to Production</span>
                <span className="tabular-nums">{formatCurrency(totalCost)}</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
