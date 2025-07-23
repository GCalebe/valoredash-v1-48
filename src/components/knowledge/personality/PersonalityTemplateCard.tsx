import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Settings, Eye } from "lucide-react";
import type { AIPersonalityTemplate } from "@/data/aiPersonalityTemplates";

interface PersonalityTemplateCardProps {
  template: AIPersonalityTemplate;
  onSelect: (template: AIPersonalityTemplate) => void;
  onPreview: (template: AIPersonalityTemplate) => void;
  isSelected?: boolean;
}

const PersonalityTemplateCard = ({
  template,
  onSelect,
  onPreview,
  isSelected = false,
}: PersonalityTemplateCardProps) => {
  return (
    <Card 
      className={`hover:shadow-md transition-all cursor-pointer ${
        isSelected ? 'ring-2 ring-primary border-primary' : ''
      }`}
      onClick={() => onSelect(template)}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{template.icon}</div>
            <div>
              <CardTitle className="text-base">{template.name}</CardTitle>
              <Badge variant="secondary" className="text-xs mt-1">
                {template.category}
              </Badge>
            </div>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onPreview(template);
              }}
              title="Visualizar configurações"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(template);
              }}
              title="Configurar personalidade"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {template.description}
        </p>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Tom:</span>
            <Badge variant="outline" className="text-xs">
              {template.settings.tone}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Estilo:</span>
            <Badge variant="outline" className="text-xs">
              {template.settings.response_style}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PersonalityTemplateCard;