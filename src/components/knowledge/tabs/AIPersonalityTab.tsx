import React, { useState, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAIPersonalityForm } from "@/hooks/useAIPersonalityForm";
import { useAIPersonalityQuery } from "@/hooks/useAIPersonalityQuery";
import { aiPersonalityTemplates, type AIPersonalityTemplate } from "@/data/aiPersonalityTemplates";
import { usePersonalityTemplates } from "@/hooks/usePersonalityTemplates";

import { useToast } from "@/hooks/use-toast";
import TemplateView from "@/components/knowledge/personality/TemplateView";
import ConfigurationView from "@/components/knowledge/personality/ConfigurationView";
import PersonalityHeader from "@/components/knowledge/personality/PersonalityHeader";
import PersonalityHierarchicalView from "@/components/knowledge/personality/PersonalityHierarchicalView";

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
    data: dbTemplates,
    isLoading: templatesLoading,
    isError: templatesError,
    refetch: refetchTemplates,
  } = usePersonalityTemplates();
  
  const activeTemplateId = null; // Para dados mockados, não há template ativo específico

  const [currentView, setCurrentView] = useState<'templates' | 'configuration'>('templates');
  const [selectedTemplate, setSelectedTemplate] = useState<AIPersonalityTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<AIPersonalityTemplate | null>(null);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  
  // Estados para o header
  const [searchTerm, setSearchTerm] = useState('');
  const [displayMode, setDisplayMode] = useState<'grid' | 'hierarchy'>('grid');


  const templates = dbTemplates || [];
  
  // Filtrar templates com base na busca
  const filteredTemplates = useMemo(() => {
    if (!searchTerm) return templates;
    
    return templates.filter(template => 
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [templates, searchTerm]);

  const isTemplateActive = (template: AIPersonalityTemplate) => {
    return activeTemplateId === template.id;
  };

  const handleTemplateSelect = (template: AIPersonalityTemplate) => {
    setSelectedTemplate(template);
    if (template.settings) {
      setSettings(prev => ({ ...prev, ...template.settings }));
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

  const handleCreateNew = () => {
    setSelectedTemplate(null); // Não há template selecionado para nova personalidade
    reset(); // Resetar para configurações padrão
    setCurrentView('configuration');
  };

  const onSave = () => {
    handleSave();
  };
  
  // Handlers para o header
  const handleImport = () => {
    // TODO: Implementar importação
    console.log('Importar template');
  };
  
  const handleExport = () => {
    // TODO: Implementar exportação
    console.log('Exportar configuração');
  };
  
  const handleReset = () => {
    reset();
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
      <PersonalityHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onCreateNew={currentView === 'templates' ? handleCreateNew : onSave}
        onImport={handleImport}
        onExport={handleExport}
        onReset={currentView === 'configuration' ? handleReset : undefined}
        viewMode={currentView}
        onViewModeChange={setCurrentView}
        displayMode={displayMode}
        onDisplayModeChange={setDisplayMode}
        totalTemplates={templates.length}
        filteredTemplates={filteredTemplates.length}
        hasChanges={hasChanges}
      />
      
      {currentView === 'templates' ? (
        displayMode === 'hierarchy' ? (
          <PersonalityHierarchicalView
            templates={filteredTemplates}
            onPreview={handleTemplatePreview}
            searchTerm={searchTerm}
          />
        ) : (
          <TemplateView
            templates={filteredTemplates}
            dbTemplates={dbTemplates as any || []}
            templatesLoading={templatesLoading}
            templatesError={templatesError as any}
            isTemplateActive={isTemplateActive}
            handleTemplateSelect={handleTemplateSelect}
            handleTemplatePreview={handleTemplatePreview}
            showPreviewDialog={showPreviewDialog}
            setShowPreviewDialog={setShowPreviewDialog}
            previewTemplate={previewTemplate}
            handleApplyTemplate={handleApplyTemplate}
            refetchTemplates={refetchTemplates}
            handleCreateNew={handleCreateNew}
          />
        )
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
