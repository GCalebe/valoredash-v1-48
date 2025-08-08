import React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface Step {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface WizardStepHeaderProps {
  steps: Step[];
  currentStep: number;
  onGoTo: (index: number) => void;
}

const WizardStepHeader: React.FC<WizardStepHeaderProps> = ({ steps, currentStep, onGoTo }) => {
  return (
    <div className="flex items-center justify-between">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;
        return (
          <div key={step.id} className="flex items-center">
            <button
              onClick={() => onGoTo(index)}
              className={cn(
                'flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors',
                isActive
                  ? 'border-primary bg-primary text-primary-foreground'
                  : isCompleted
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-muted-foreground/30 bg-background text-muted-foreground hover:border-primary/50',
              )}
            >
              {isCompleted ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
            </button>
            {index < steps.length - 1 && (
              <div className={cn('w-16 h-0.5 mx-2', isCompleted ? 'bg-primary' : 'bg-muted-foreground/30')} />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default WizardStepHeader;


