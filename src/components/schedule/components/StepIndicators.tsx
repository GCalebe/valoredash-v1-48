import React from 'react';

type Step = 'agenda' | 'datetime' | 'form';

interface StepIndicatorsProps {
  currentStep: Step;
}

const StepIndicators: React.FC<StepIndicatorsProps> = ({ currentStep }) => {
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <div className={`w-2.5 h-2.5 rounded-full transition-colors ${currentStep === 'agenda' ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
        <span className={`text-sm font-medium ${currentStep === 'agenda' ? 'text-foreground' : 'text-muted-foreground'}`}>Agenda</span>
      </div>
      <div className="w-8 h-0.5 bg-muted-foreground/20" />
      <div className="flex items-center gap-2">
        <div className={`w-2.5 h-2.5 rounded-full transition-colors ${currentStep === 'datetime' ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
        <span className={`text-sm font-medium ${currentStep === 'datetime' ? 'text-foreground' : 'text-muted-foreground'}`}>Data/Hora</span>
      </div>
      <div className="w-8 h-0.5 bg-muted-foreground/20" />
      <div className="flex items-center gap-2">
        <div className={`w-2.5 h-2.5 rounded-full transition-colors ${currentStep === 'form' ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
        <span className={`text-sm font-medium ${currentStep === 'form' ? 'text-foreground' : 'text-muted-foreground'}`}>Dados</span>
      </div>
    </div>
  );
};

export default StepIndicators;


