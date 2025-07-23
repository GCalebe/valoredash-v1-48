import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Separator } from "@/components/ui/separator";
import type { AIPersonalityTemplate } from "@/data/aiPersonalityTemplates";

interface PersonalityPreviewDialogProps {
  template: AIPersonalityTemplate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: (template: AIPersonalityTemplate) => void;
}

const PersonalityPreviewDialog = ({
  template,
  open,
  onOpenChange,
  onApply,
}: PersonalityPreviewDialogProps) => {
  if (!template) return null;

  const handleApply = () => {
    onApply(template);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{template.icon}</span>
            <div>
              <DialogTitle>{template.name}</DialogTitle>
              <DialogDescription className="mt-1">
                {template.description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{template.category}</Badge>
            <Badge variant="outline">{template.settings.language}</Badge>
          </div>

          <hr className="border-border" />

          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Configurações Básicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-sm font-medium">Tom:</span>
                  <p className="text-sm text-muted-foreground mt-1">
                    {template.settings.tone}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium">Estilo de Resposta:</span>
                  <p className="text-sm text-muted-foreground mt-1">
                    {template.settings.response_style}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium">Criatividade (Temperature):</span>
                  <p className="text-sm text-muted-foreground mt-1">
                    {template.settings.temperature} (0 = Conservador, 1 = Criativo)
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium">Máximo de Tokens:</span>
                  <p className="text-sm text-muted-foreground mt-1">
                    {template.settings.max_tokens} tokens
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Personalidade</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {template.settings.personality_type}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Mensagem de Saudação</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-sm">{template.settings.greeting_message}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Instruções Especiais</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {template.settings.custom_instructions}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleApply}>
            Aplicar Esta Personalidade
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PersonalityPreviewDialog;