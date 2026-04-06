"use client";

import { useState, useEffect } from "react";
import { X, ArrowRight, Sparkles, Search, Star, Code } from "lucide-react";

const steps = [
  {
    title: "Network Health",
    description:
      "Monitor the overall health of the Necter Network at a glance. View TPS, gas prices, and block production in real time.",
    icon: Sparkles,
  },
  {
    title: "Search Anything",
    description:
      "Search by block, transaction, address, device, operator, or token. Press \u2318K to open the search bar from anywhere.",
    icon: Search,
  },
  {
    title: "Track Items",
    description:
      "Click the \u2b50 star on any address, token, or operator to add it to your watchlist for easy monitoring.",
    icon: Star,
  },
  {
    title: "Developer Mode",
    description:
      "Toggle DEV mode in the header to see raw calldata, storage slots, and gas traces on transaction pages.",
    icon: Code,
  },
];

export function OnboardingTour() {
  const [step, setStep] = useState(-1); // -1 means not showing

  useEffect(() => {
    if (typeof window === "undefined") return;
    const done = localStorage.getItem("necter_onboarding_done");
    if (done) return;
    const timer = setTimeout(() => setStep(0), 1000);
    return () => clearTimeout(timer);
  }, []);

  function dismiss() {
    setStep(-1);
    localStorage.setItem("necter_onboarding_done", "true");
  }

  function next() {
    if (step >= steps.length - 1) {
      dismiss();
    } else {
      setStep((s) => s + 1);
    }
  }

  if (step < 0) return null;

  const current = steps[step];
  const Icon = current.icon;
  const isLast = step === steps.length - 1;

  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) dismiss();
      }}
    >
      <div className="rounded-lg border border-primary/30 bg-card p-6 w-[320px] shadow-lg shadow-[0_0_20px_rgba(255,201,51,0.1)] animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-muted-foreground font-medium">
            {step + 1} of {steps.length}
          </span>
          <button
            onClick={dismiss}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Icon */}
        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 mb-4">
          <Icon className="h-6 w-6 text-primary" />
        </div>

        {/* Content */}
        <h3 className="text-base font-medium mb-1.5">{current.title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-5">
          {current.description}
        </p>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={dismiss}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip tour
          </button>
          <button
            onClick={next}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
          >
            {isLast ? "Get Started" : "Next"}
            {!isLast && <ArrowRight className="h-3.5 w-3.5" />}
          </button>
        </div>

        {/* Step dots */}
        <div className="flex items-center justify-center gap-1.5 mt-4">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === step
                  ? "w-4 bg-primary"
                  : i < step
                  ? "w-1.5 bg-primary/40"
                  : "w-1.5 bg-border"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
