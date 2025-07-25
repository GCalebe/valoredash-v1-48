import React, { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAIPersonalityForm } from "@/hooks/useAIPersonalityForm";
import { useAIPersonalityQuery } from "@/hooks/useAIPersonalityQuery";
import { aiPersonalityTemplates, type AIPersonalityTemplate } from "@/data/aiPersonalityTemplates";
import { usePersonalityTemplates } from "@/hooks/usePersonalityTemplates";
import { seedPersonalityTemplates } from "@/scripts/seedPersonalityTemplates";
import { useToast } from "@/hooks/use-toast";
import TemplateView from "@/components/knowledge/personality/TemplateView";
import ConfigurationView from "@/components/knowledge/personality/ConfigurationView";

const AIPersonalityTab = () => {
  const { toast } = useToast();
  const {
    settings,
    isLoading: isSaving,
    hasChanges,
    handleInputChange,
    handleSliderChange,
    handleSave,
    setSettings,
    reset,
    getSliderLabel,
  } = useAIPersonalityForm();

  const {
    templates: dbTemplates,
    isLoading: templatesLoading,
    isError: templatesError,
    refetch: refetchTemplates,
    activeTemplateId,
  } = usePersonalityTemplates();

  const [currentView, setCurrentView] = useState<'templates' | 'configuration'>('templates');
  const [selectedTemplate, setSelectedTemplate] = useState<AIPersonalityTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<AIPersonalityTemplate | null>(null);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  const templates = dbTemplates || [];

  const isTemplateActive = (template: AIPersonalityTemplate) => {
    return activeTemplateId === template.id;
  };

  const handleTemplateSelect = (template: AIPersonalityTemplate) => {
    setSelectedTemplate(template);
    if (template.settings) {
      setSettings(template.settings);
    }
    setCurrentView('configuration');
  };

  const handleTemplatePreview = (template: AIPersonalityTemplate) => {
    setPreviewTemplate(template);
    setShowPreviewDialog(true);
  };

  const handleApplyTemplate = (template: AIPersonalityTemplate) => {
    handleTemplateSelect(template);
    setShowPreviewDialog(false);
  };

  const handleBackToTemplates = () => {
    setCurrentView('templates');
    setSelectedTemplate(null);
    reset(); // Resetar as alterações ao voltar
  };

  const onSave = () => {
    handleSave(selectedTemplate?.id || null);
  };

  const handleSeedTemplates = async () => {
    setIsSeeding(true);
    try {
      await seedPersonalityTemplates();
      await refetchTemplates();
      toast({
        title: "Sucesso",
        description: "Templates de personalidade criados com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao criar templates:", error);
      toast({
        title: "Erro",
        description: "Não foi possível criar os templates.",
        variant: "destructive",
      });
    } finally {
      setIsSeeding(false);
    }
  };

  if (templatesLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-1/3" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {currentView === 'templates' ? (
        <TemplateView
          templates={templates}
          dbTemplates={dbTemplates || []}
          templatesLoading={templatesLoading}
          isSeeding={isSeeding}
          templatesError={templatesError}
          isTemplateActive={isTemplateActive}
          handleTemplateSelect={handleTemplateSelect}
          handleTemplatePreview={handleTemplatePreview}
          handleSeedTemplates={handleSeedTemplates}
          showPreviewDialog={showPreviewDialog}
          setShowPreviewDialog={setShowPreviewDialog}
          previewTemplate={previewTemplate}
          handleApplyTemplate={handleApplyTemplate}
          refetchTemplates={refetchTemplates}
        />
      ) : (
        <ConfigurationView
          settings={settings}
          hasChanges={hasChanges}
          isLoading={isSaving}
          selectedTemplate={selectedTemplate}
          handleBackToTemplates={handleBackToTemplates}
          handleReset={reset}
          handleSave={onSave}
          handleInputChange={handleInputChange}
          handleSliderChange={handleSliderChange}
          getSliderLabel={getSliderLabel}
        />
      )}
    </div>
  );
};

export default AIPersonalityTab;
