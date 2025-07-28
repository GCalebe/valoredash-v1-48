import React from 'react';
import { Palette, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PersonalityCards from './PersonalityCards';
import PersonalityPreviewDialog from './PersonalityPreviewDialog';
import { type AIPersonalityTemplate } from '@/data/aiPersonalityTemplates';
import { predefinedPersonalities } from './ideas/PersonalityConfigDemo';
import { PersonalityConfig } from './ideas';

interface DatabaseTemplate {
  id: string;
  name: string;
  description?: string;
  personality_type: string;
  [key: string]: unknown;
}

interface TemplateError {
  message: string;
  code?: string;
  [key: string]: unknown;
}

interface TemplateViewProps {
  dbTemplates: DatabaseTemplate[];
  templatesLoading: boolean;
  refetchTemplates: () => void;
  templatesError: TemplateError | null;
  templates: AIPersonalityTemplate[];
  isTemplateActive: (template: AIPersonalityTemplate) => boolean;
  handleTemplateSelect: (template: AIPersonalityTemplate) => void;
  handleTemplatePreview: (template: AIPersonalityTemplate) => void;
  showPreviewDialog: boolean;
  setShowPreviewDialog: (show: boolean) => void;
  previewTemplate: AIPersonalityTemplate | null;
  handleApplyTemplate: (template: AIPersonalityTemplate) => void;
  handleCreateNew: () => void;
}

const TemplateView: React.FC<TemplateViewProps> = ({ dbTemplates, templatesLoading, refetchTemplates, templatesError, templates, isTemplateActive, handleTemplateSelect, handleTemplatePreview, showPreviewDialog, setShowPreviewDialog, previewTemplate, handleApplyTemplate, handleCreateNew }) => {
  return (
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
          <Button
            onClick={() => refetchTemplates()}
            disabled={templatesLoading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${templatesLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button
            onClick={handleCreateNew}
            variant="default"
            size="sm"
          >
            <Palette className="h-4 w-4 mr-2" />
            Criar Nova Personalidade
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
          <p className="text-muted-foreground">Nenhum template encontrado</p>
        </div>
      ) : (
        <PersonalityCards
          personalities={predefinedPersonalities}
          onSelect={(personality) => {
            // Converter PersonalityConfig para AIPersonalityTemplate
            const template: AIPersonalityTemplate = {
              id: personality.name.toLowerCase().replace(/\s+/g, '-'),
              name: personality.name,
              description: personality.description,
              category: personality.category,
              settings: personality
            };
            handleTemplateSelect(template);
          }}
          onPreview={(personality) => {
            const template: AIPersonalityTemplate = {
              id: personality.name.toLowerCase().replace(/\s+/g, '-'),
              name: personality.name,
              description: personality.description,
              category: personality.category,
              settings: personality
            };
            handleTemplatePreview(template);
          }}
          onActivate={(personality) => {
            // Implementar lógica de ativação da personalidade
            console.log('Ativando personalidade:', personality.name);
          }}
        />
      )}

      <PersonalityPreviewDialog
        template={previewTemplate}
        open={showPreviewDialog}
        onOpenChange={setShowPreviewDialog}
        onApply={handleApplyTemplate}
      />
    </>
  )
}

export default TemplateView;