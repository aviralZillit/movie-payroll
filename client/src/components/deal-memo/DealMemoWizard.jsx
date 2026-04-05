import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const STEP_LABELS = [
  "Entity & Territory",
  "Crew Details",
  "Deal Structure",
  "Rates",
  "Allowances",
  "Nominal Coding",
  "Compliance",
  "Documents",
  "Payroll Start",
  "Preview & Issue",
];

// Short labels for the stepper (avoids truncation)
const STEP_SHORT = [
  "Entity",
  "Crew",
  "Deal",
  "Rates",
  "Allow.",
  "Codes",
  "Comply",
  "Docs",
  "Payroll",
  "Issue",
];

// ---------------------------------------------------------------------------
// Stepper header — compact for 10 steps
// ---------------------------------------------------------------------------
function StepIndicator({ stepIndex, currentStep, label }) {
  const isCompleted = stepIndex < currentStep;
  const isActive = stepIndex === currentStep;

  return (
    <div className="flex flex-col items-center gap-1 min-w-0">
      <div
        className={cn(
          "relative flex size-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold transition-all duration-300",
          isCompleted && "border-emerald-500 bg-emerald-500 text-white",
          isActive && "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/25",
          !isCompleted && !isActive && "border-muted-foreground/30 text-muted-foreground/50"
        )}
      >
        {isCompleted ? <Check className="size-3.5" /> : stepIndex + 1}
      </div>
      <span
        className={cn(
          "text-[10px] font-medium text-center leading-tight",
          isActive && "text-foreground",
          isCompleted && "text-emerald-600 dark:text-emerald-400",
          !isActive && !isCompleted && "text-muted-foreground/50"
        )}
      >
        {label}
      </span>
    </div>
  );
}

function StepConnector({ isCompleted }) {
  return (
    <div className="relative flex-1 self-start mt-[14px] mx-0.5 h-0.5">
      <div className="absolute inset-0 rounded-full bg-muted-foreground/15" />
      <motion.div
        className="absolute inset-y-0 left-0 rounded-full bg-emerald-500"
        initial={{ width: "0%" }}
        animate={{ width: isCompleted ? "100%" : "0%" }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Animated content wrapper
// ---------------------------------------------------------------------------
const pageVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 60 : -60,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction) => ({
    x: direction > 0 ? -60 : 60,
    opacity: 0,
  }),
};

const pageTransition = {
  type: "tween",
  ease: "easeInOut",
  duration: 0.25,
};

// ---------------------------------------------------------------------------
// Main wizard component
// ---------------------------------------------------------------------------
export default function DealMemoWizard({
  currentStep,
  direction = 1,
  onNext,
  onBack,
  onSubmit,
  onSaveDraft,
  draftSaved = false,
  isSubmitting = false,
  children,
  stepLabels = STEP_LABELS,
}) {
  const totalSteps = stepLabels.length;
  const isFirst = currentStep === 0;
  const isLast = currentStep === totalSteps - 1;
  const shortLabels = stepLabels === STEP_LABELS ? STEP_SHORT : stepLabels;

  return (
    <div className="flex flex-col gap-6">
      {/* ---- Compact stepper ---- */}
      <div className="flex items-start justify-between px-1">
        {shortLabels.map((label, i) => (
          <div key={label} className="flex items-start flex-1 last:flex-none min-w-0">
            <StepIndicator
              stepIndex={i}
              currentStep={currentStep}
              label={label}
            />
            {i < totalSteps - 1 && <StepConnector isCompleted={i < currentStep} />}
          </div>
        ))}
      </div>

      {/* ---- Step content with animation ---- */}
      <div className="relative overflow-hidden min-h-[360px]">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={pageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={pageTransition}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ---- Navigation ---- */}
      <div className="flex items-center justify-between border-t pt-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            disabled={isFirst}
            className={cn(isFirst && "invisible")}
          >
            Back
          </Button>
          {onSaveDraft && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onSaveDraft}
              className="text-muted-foreground"
            >
              {draftSaved ? (
                <><Check className="size-3.5 mr-1 text-emerald-500" /> Saved</>
              ) : (
                "Save Draft"
              )}
            </Button>
          )}
        </div>

        <span className="text-xs text-muted-foreground">
          Step {currentStep + 1} of {totalSteps}
        </span>

        {isLast ? (
          <Button size="sm" onClick={onSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Create Deal Memo"}
          </Button>
        ) : (
          <Button size="sm" onClick={onNext}>Continue</Button>
        )}
      </div>
    </div>
  );
}

export { STEP_LABELS };
