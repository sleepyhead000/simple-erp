"use client";

import { useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTutorialStore } from "@/store/tutorial-store";
import { tutorialSteps } from "./tutorial-steps";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function TutorialModal() {
  const { isOpen, currentStep, next, prev, skip } = useTutorialStore();
  const step = tutorialSteps[currentStep];
  const Icon = step.icon;
  const isLast = currentStep === tutorialSteps.length - 1;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") {
        skip();
      } else if (e.key === "ArrowRight" || e.key === "Enter") {
        e.preventDefault();
        next();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
      }
    },
    [isOpen, next, prev, skip]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && skip()}>
      <DialogContent className="sm:max-w-[480px] p-0 gap-0 overflow-hidden">
        {/* Progress bar */}
        <div className="h-1 bg-muted w-full">
          <div
            className="h-full bg-primary transition-all duration-300 ease-in-out"
            style={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
          />
        </div>

        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle className="text-xl">{step.title}</DialogTitle>
        </DialogHeader>

        {/* Content */}
        <div className="px-6 py-6">
          {/* Illustration */}
          <div className={`w-full h-32 rounded-lg ${step.bgColor} flex items-center justify-center mb-6`}>
            <div className={`p-4 rounded-full bg-white/80 shadow-sm`}>
              <Icon className={`h-10 w-10 ${step.color}`} />
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground leading-relaxed">
            {step.description}
          </p>
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 pb-6 pt-0 flex-row items-center justify-between border-t">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {currentStep + 1} of {tutorialSteps.length}
            </span>
            {/* Step dots */}
            <div className="flex gap-1 ml-2">
              {tutorialSteps.map((_, i) => (
                <button
                  key={i}
                  onClick={() => useTutorialStore.getState().goTo(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    i === currentStep
                      ? "w-4 bg-primary"
                      : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  }`}
                  aria-label={`Go to step ${i + 1}`}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={skip}>
              Skip
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={prev}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button size="sm" onClick={next}>
              {isLast ? "Get Started" : "Next"}
              {!isLast && <ChevronRight className="h-4 w-4 ml-1" />}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
