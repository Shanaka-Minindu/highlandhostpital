import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils'; // Assuming you have the standard shadcn util

interface BookingStepsProps {
  currentStep?: 1|2|3|4;
}

const BookingSteps = ({ currentStep = 3 }: BookingStepsProps) => {
  const totalSteps = 4;

  return (
    <div className="flex items-center justify-center w-full py-8">
      <div className="flex items-center w-full max-w-2xl">
        {Array.from({ length: totalSteps }).map((_, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isActive = stepNumber === currentStep;

          return (
            <React.Fragment key={stepNumber}>
              {/* Step Circle */}
              <div className="relative flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-300",
                    isCompleted
                      ? "bg-blue-500 border-blue-500 text-white"
                      : isActive
                      ? "bg-slate-100 border-blue-500 text-blue-500 shadow-sm"
                      : "bg-slate-100 border-slate-200 text-slate-500"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-6 w-6 stroke-[3px]" />
                  ) : (
                    <span className="text-lg font-bold">{stepNumber}</span>
                  )}
                </div>
              </div>

              {/* Connector Line (Don't show after the last step) */}
              {stepNumber < totalSteps && (
                <div className="flex-auto px-2">
                  <div
                    className={cn(
                      "h-1.5 w-full rounded-full transition-colors duration-500",
                      stepNumber < currentStep ? "bg-blue-500" : "bg-slate-200"
                    )}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default BookingSteps;