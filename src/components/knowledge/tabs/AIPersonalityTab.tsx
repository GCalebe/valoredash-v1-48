import React, { useState } from "react";
import { Save, RotateCcw, ArrowLeft, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAIPersonalityForm } from "@/hooks/useAIPersonalityForm";
import BasicInfoSection from "@/components/knowledge/personality/BasicInfoSection";
import TraitsSection from "@/components/knowledge/personality/TraitsSection";
import MessagesSection from "@/components/knowledge/personality/MessagesSection";
import InstructionsSection from "@/components/knowledge/personality/InstructionsSection";
import PreviewSection from "@/components/knowledge/personality/PreviewSection";
import PersonalityTemplateCard from "@/components/knowledge/personality/PersonalityTemplateCard";
import PersonalityPreviewDialog from "@/components/knowledge/personality/PersonalityPreviewDialog";
import { aiPersonalityTemplates, type AIPersonalityTemplate } from "@/data/aiPersonalityTemplates";
import { usePersonalityTemplates } from "@/hooks/usePersonalityTemplates";
import { seedPersonalityTemplates } from "@/scripts/seedPersonalityTemplates";
import { RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AIPersonalityTab = () => {
  const { toast } = useToast();
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
  } = useAIPersonalityForm();

  const {
    data: dbTemplates,
    isLoading: templatesLoading,
    error: templatesError,
    refetch: refetchTemplates
  } = usePersonalityTemplates();

  const [currentView, setCurrentView] = useState<'templates' | 'configuration'>('templates');
  const [selectedTemplate, setSelectedTemplate] = useState<AIPersonalityTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<AIPersonalityTemplate | null>(null);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  // Usar templates do banco se disponíveis, senão usar os estáticos
  const templates = dbTemplates && dbTemplates.length > 0 ? dbTemplates : aiPersonalityTemplates;

   const handleTemplateSelect = (template: AIPersonalityTemplate) => {
     setSelectedTemplate(template);
     setCurrentView('configuration');
     // Aplicar as configurações do template
     handleInputChange('name', template.name);
     handleInputChange('description', template.description);
     handleInputChange('tone', template.settings.tone);
     handleInputChange('personality', template.settings.personality_type);
     handleInputChange('formality', template.settings.temperature);
     handleInputChange('greeting', template.settings.greeting_message);
     handleInputChange('specialInstructions', template.settings.custom_instructions);
     handleInputChange('maxResponses', template.settings.max_tokens);
   };

   const handleTemplatePreview = (template: AIPersonalityTemplate) => {
     setPreviewTemplate(template);
     setShowPreviewDialog(true);
   };

   const handleApplyTemplate = (template: AIPersonalityTemplate) => {
     handleTemplateSelect(template);
   };

   const handleBackToTemplates = () => {
      setCurrentView('templates');
      setSelectedTemplate(null);
    };

    const handleSeedTemplates = async () => {
      setIsSeeding(true);
      try {
        await seedPersonalityTemplates();
        await refetchTemplates();
        toast({
          title: "Templates criados",
          description: "Os modelos de personalidade foram adicionados ao banco de dados!",
        });
      } catch (error) {
        console.error('Erro ao criar templates:', error);
        toast({
          title: "Erro ao criar templates",
          description: "Ocorreu um erro ao adicionar os modelos. Tente novamente.",
          variant: "destructive",
        });
      } finally {
        setIsSeeding(false);
      }
    };

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
      <div className="text-center py-8">
        <p className="text-red-500">Erro ao carregar configurações da IA</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {currentView === 'templates' ? (
        // Visualização de Templates
        <>
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Modelos de Personalidade da IA
              </h3>
              <p className="text-sm text-muted-foreground">
                Escolha um modelo pré-configurado ou personalize sua própria IA
              </p>
            </div>
            <div className="flex gap-2">
              {(!dbTemplates || dbTemplates.length === 0) && (
                <Button
                  onClick={handleSeedTemplates}
                  disabled={isSeeding}
                  variant="outline"
                  size="sm"
                >
                  {isSeeding ? (
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  {isSeeding ? 'Criando...' : 'Criar Templates'}
                </Button>
              )}
              <Button
                onClick={() => refetchTemplates()}
                disabled={templatesLoading}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${templatesLoading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
            </div>
          </div>

          {templatesLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Carregando templates...</span>
            </div>
          ) : templatesError ? (
            <div className="text-center py-12">
              <p className="text-destructive mb-4">Erro ao carregar templates</p>
              <Button onClick={() => refetchTemplates()} variant="outline">
                Tentar novamente
              </Button>
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">Nenhum template encontrado</p>
              <Button onClick={handleSeedTemplates} disabled={isSeeding}>
                {isSeeding ? 'Criando...' : 'Criar Templates Padrão'}
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {templates.map((template) => (
                 <PersonalityTemplateCard
                   key={template.id}
                   template={template}
                   onSelect={() => handleTemplateSelect(template)}
                   onPreview={() => handleTemplatePreview(template)}
                 />
               ))}
             </div>
          )}

          <PersonalityPreviewDialog
            template={previewTemplate}
            open={showPreviewDialog}
            onOpenChange={setShowPreviewDialog}
            onApply={handleApplyTemplate}
          />
        </>
      ) : (
        // Visualização de Configuração
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
      )}
    </div>
  );
};

export default AIPersonalityTab;
