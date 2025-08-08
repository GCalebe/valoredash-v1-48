import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Brain } from 'lucide-react';
import { PersonalityConfig } from '../index';

interface PersonalityTraitsSectionProps {
  config: PersonalityConfig;
  onSliderChange: (field: keyof PersonalityConfig, value: number[]) => void;
}

const PersonalityTraitsSection: React.FC<PersonalityTraitsSectionProps> = ({ config, onSliderChange }) => {
  const traits: { key: keyof PersonalityConfig; label: string; desc: string }[] = [
    { key: 'creativity' as any, label: 'Criatividade', desc: 'Controla o quão criativa e inovadora a IA será' },
    { key: 'formality' as any, label: 'Formalidade', desc: 'Define o nível de formalidade na comunicação' },
    { key: 'empathy' as any, label: 'Empatia', desc: 'Capacidade de compreender e responder às emoções' },
    { key: 'assertiveness' as any, label: 'Assertividade', desc: 'Define o quão direta e confiante a IA será' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Traços de Personalidade
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {traits.map((t) => (
          <div key={t.label} className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <Label className="font-medium">{t.label}</Label>
                <p className="text-sm text-muted-foreground">{t.desc}</p>
              </div>
              <Badge variant="outline">{((config as any)[t.key]?.[0] ?? 50)}%</Badge>
            </div>
            <Slider value={(config as any)[t.key] || [50]} onValueChange={(value) => onSliderChange(t.key, value)} max={100} step={1} className="w-full" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default PersonalityTraitsSection;


