import React, { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAIPersonalityForm } from "@/hooks/useAIPersonalityForm";
import { useAIPersonalityQuery } from "@/hooks/useAIPersonalityQuery";
import { aiPersonalityTemplates, type AIPersonalityTemplate } from "@/data/aiPersonalityTemplates";
import { usePersonalityTemplates } from "@/hooks/usePersonalityTemplates";
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
    data: templates,
    isLoading: templatesLoading,
    isError: templatesError,
    refetch: refetchTemplates,
  } = usePersonalityTemplates();

  // Para dados mockados, não há template ativo específico
  const activeTemplateId = null;

  const [currentView, setCurrentView] = useState<'templates' | 'configuration'>('templates');
  const [selectedTemplate, setSelectedTemplate] = useState<AIPersonalityTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<AIPersonalityTemplate | null>(null);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);


  const templatesData = templates || [];

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
          templates={templatesData}
          dbTemplates={templatesData}
          templatesLoading={templatesLoading}
          templatesError={templatesError}
          isTemplateActive={isTemplateActive}
          handleTemplateSelect={handleTemplateSelect}
          handleTemplatePreview={handleTemplatePreview}
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
