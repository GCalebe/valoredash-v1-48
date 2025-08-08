// @ts-nocheck
import React from 'react';
import { Upload } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const ProcessingStep: React.FC<{ progress: number }> = ({ progress }) => {
  return (
    <div className="space-y-6 text-center">
      <div>
        <Upload className="h-16 w-16 text-primary mx-auto mb-4 animate-pulse" />
        <h3 className="text-lg font-semibold mb-2">Processando importação...</h3>
        <p className="text-muted-foreground">Aguarde enquanto importamos seus clientes</p>
      </div>
      <div className="space-y-2">
        <Progress value={progress} className="w-full" />
        <p className="text-sm text-muted-foreground">{Math.round(progress)}% concluído</p>
      </div>
    </div>
  );
};

export default ProcessingStep;


