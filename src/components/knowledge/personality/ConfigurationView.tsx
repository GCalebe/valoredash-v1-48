import React from 'react';
import { Save, RotateCcw, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BasicInfoSection from './BasicInfoSection';
import TraitsSection from './TraitsSection';
import MessagesSection from './MessagesSection';
import InstructionsSection from './InstructionsSection';
import PreviewSection from './PreviewSection';
import { type AIPersonalityTemplate } from '@/data/aiPersonalityTemplates';
import { type AIPersonalitySettings } from '@/hooks/useAIPersonalityForm';

interface ConfigurationViewProps {
  handleBackToTemplates: () => void;
  selectedTemplate: AIPersonalityTemplate | null;
  hasChanges: boolean;
  handleReset: () => void;
  handleSave: () => void;
  isLoading: boolean;
  settings: AIPersonalitySettings;
  handleInputChange: (field: keyof AIPersonalitySettings, value: any) => void;
  handleSliderChange: (field: keyof AIPersonalitySettings, value: number[]) => void;
  getSliderLabel: (value: number) => string;
}

const ConfigurationView: React.FC<ConfigurationViewProps> = ({ handleBackToTemplates, selectedTemplate, hasChanges, handleReset, handleSave, isLoading, settings, handleInputChange, handleSliderChange, getSliderLabel }) => {
  return (
    <>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToTemplates}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar aos Modelos
          </Button>
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              {selectedTemplate ? `Configurando: ${selectedTemplate.name}` : 'Configuração de Personalidade da IA'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {selectedTemplate ? selectedTemplate.description : 'Personalize como a IA interage com seus clientes'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={!hasChanges}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Resetar
          </Button>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || isLoading}
          >
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <BasicInfoSection
            settings={settings}
            onInputChange={handleInputChange}
          />
          <TraitsSection
            settings={settings}
            onSliderChange={handleSliderChange}
            onInputChange={handleInputChange}
            getSliderLabel={getSliderLabel}
          />
        </div>
        <div className="space-y-6">
          <MessagesSection
            settings={settings}
            onInputChange={handleInputChange}
          />
          <InstructionsSection
            settings={settings}
            onInputChange={handleInputChange}
          />
          <PreviewSection settings={settings} />
        </div>
      </div>
    </>
  )
}

export default ConfigurationView;