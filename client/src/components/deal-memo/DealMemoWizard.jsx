import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const STEP_LABELS = [
  "Production",
  "Classification",
  "Rates",
  "Fringes",
  "Overtime & Penalties",
  "Allowances",
  "Review",
];

// ---------------------------------------------------------------------------
// Stepper header
// ---------------------------------------------------------------------------
function StepIndicator({ stepIndex, currentStep, label }) {
  const isCompleted = stepIndex < currentStep;
  const isActive = stepIndex === currentStep;

  return (
    <div className="flex flex-col items-center gap-1.5 min-w-0">
      <div
        className={cn(
          "relative flex size-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all duration-300",
          isCompleted &&
            "border-emerald-500 bg-emerald-500 text-white",
          isActive &&
            "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/25",
          !isCompleted &&
            !isActive &&
            "border-muted-foreground/30 text-muted-foreground/50"
        )}
      >
        {isCompleted ? <Check className="size-4" /> : stepIndex + 1}
      </div>
      <span
        className={cn(
          "text-xs font-medium text-center leading-tight max-w-20 truncate",
          isActive && "text-foreground",
          isCompleted && "text-emerald-600 dark:text-emerald-400",
          !isActive && !isCompleted && "text-muted-foreground/60"
        )}
      >
        {label}
      </span>
    </div>
  );
}

function StepConnector({ isCompleted }) {
  return (
    <div className="relative flex-1 self-start mt-[18px] mx-1 h-0.5">
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
    x: direction > 0 ? 80 : -80,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction) => ({
    x: direction > 0 ? -80 : 80,
    opacity: 0,
  }),
};

const pageTransition = {
  type: "tween",
  ease: "easeInOut",
  duration: 0.3,
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
  isSubmitting = false,
  children,
  stepLabels = STEP_LABELS,
}) {
  const totalSteps = stepLabels.length;
  const isFirst = currentStep === 0;
  const isLast = currentStep === totalSteps - 1;

  return (
    <div className="flex flex-col gap-8">
      {/* ---- Stepper ---- */}
      <div className="flex items-start justify-center px-2">
        {stepLabels.map((label, i) => (
          <div key={label} className="flex items-start flex-1 last:flex-none">
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
      <div className="flex items-center justify-between border-t pt-5">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={isFirst}
          className={cn(isFirst && "invisible")}
        >
          Back
        </Button>

        <span className="text-xs text-muted-foreground">
          Step {currentStep + 1} of {totalSteps}
        </span>

        {isLast ? (
          <Button onClick={onSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Create Deal Memo"}
          </Button>
        ) : (
          <Button onClick={onNext}>Continue</Button>
        )}
      </div>
    </div>
  );
}

export { STEP_LABELS };
