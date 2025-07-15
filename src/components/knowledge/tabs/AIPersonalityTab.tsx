import React from "react";
import { Save, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAIPersonalityForm } from "@/hooks/useAIPersonalityForm";
import BasicInfoSection from "@/components/knowledge/personality/BasicInfoSection";
import TraitsSection from "@/components/knowledge/personality/TraitsSection";
import MessagesSection from "@/components/knowledge/personality/MessagesSection";
import InstructionsSection from "@/components/knowledge/personality/InstructionsSection";
import PreviewSection from "@/components/knowledge/personality/PreviewSection";

const AIPersonalityTab = () => {
  const {
    settings,
    isLoading,
    error,
    hasChanges,
    handleInputChange,
    handleSliderChange,
    handleSave,
    handleReset,
    getSliderLabel,
    createMutation,
    updateMutation,
  } = useAIPersonalityForm();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <p className="text-red-600">
            Erro ao carregar configurações da personalidade
          </p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
            Configuração da Personalidade da IA
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Defina como a IA deve se comportar e interagir com os usuários
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={
              !hasChanges ||
              createMutation.isPending ||
              updateMutation.isPending
            }
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Resetar
          </Button>
          <Button
            onClick={handleSave}
            disabled={
              !hasChanges ||
              createMutation.isPending ||
              updateMutation.isPending
            }
          >
            <Save className="h-4 w-4 mr-2" />
            {createMutation.isPending || updateMutation.isPending
              ? "Salvando..."
              : "Salvar"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
        <MessagesSection
          settings={settings}
          onInputChange={handleInputChange}
        />
        <InstructionsSection
          settings={settings}
          onInputChange={handleInputChange}
        />
      </div>

      <PreviewSection settings={settings} />
    </div>
  );
};

export default AIPersonalityTab;
