import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFilterableFields } from "@/hooks/useFilterableFields";
import { fieldCategories } from "@/components/clients/filters/filterConstants";
import { User, Columns, DollarSign, Calendar, FileText, Settings } from "lucide-react";

interface FilterSuggestionsTabsProps {
  onPick: (fieldId: string) => void;
  context?: "clients" | "conversations";
}

type TabType = "basic" | "kanban" | "commercial" | "temporal";

const ICON_MAP = {
  User,
  Columns,
  DollarSign,
  Calendar,
  FileText,
  Settings,
};

const TABS: { id: TabType; label: string; description: string; icon: keyof typeof ICON_MAP }[] = [
  { id: "basic", label: "Básico", description: "Informações básicas do contato", icon: "User" },
  { id: "kanban", label: "Kanban", description: "Status e etapas do processo", icon: "Columns" },
  { id: "commercial", label: "Comercial", description: "Dados comerciais e vendas", icon: "DollarSign" },
  { id: "temporal", label: "Temporal", description: "Datas e histórico temporal", icon: "Calendar" },
];

export const FilterSuggestionsTabs: React.FC<FilterSuggestionsTabsProps> = ({ 
  onPick, 
  context = "clients" 
}) => {
  const { fields } = useFilterableFields();
  const [activeTab, setActiveTab] = useState<TabType>("kanban");

  const groups = useMemo(() => {
    const groupedFields: Record<TabType, string[]> = {
      basic: [],
      kanban: [],
      commercial: [],
      temporal: [],
    };

    fields.forEach((field) => {
      const category = field.category as TabType;
      if (category && groupedFields[category]) {
        groupedFields[category].push(field.id);
      }
    });

    // Limitar a 15 campos por categoria e ordenar por relevância
    const priorities: Record<string, number> = {
      // Kanban (mais importantes para filtro de kanban)
      kanban_stage_id: 100,
      consultation_stage: 95,
      tags: 90,
      responsible_hosts: 85,
      // Básico
      name: 80,
      email: 75,
      phone: 70,
      status: 65,
      // Comercial
      sales: 60,
      budget: 55,
      client_name: 50,
      client_size: 45,
      // Temporal
      last_contact: 40,
      last_message_time: 35,
      created_at: 30,
      contract_date: 25,
    };

    Object.keys(groupedFields).forEach(category => {
      groupedFields[category as TabType] = groupedFields[category as TabType]
        .sort((a, b) => (priorities[b] || 0) - (priorities[a] || 0))
        .slice(0, 15);
    });

    return groupedFields;
  }, [fields]);

  const getLabel = (id: string) => fields.find((f) => f.id === id)?.name || id;

  const currentFields = groups[activeTab];

  return (
    <div className="space-y-3">
      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 bg-muted rounded-lg">
        {TABS.map((tab) => {
          const IconComponent = ICON_MAP[tab.icon];
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-colors flex items-center justify-center gap-1 ${
                activeTab === tab.id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <IconComponent className="h-3 w-3" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="min-h-[120px]">
        <div className="mb-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {TABS.find(t => t.id === activeTab)?.label}
            </span>
            <Badge variant="secondary" className="text-xs">
              {currentFields.length}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {TABS.find(t => t.id === activeTab)?.description}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {currentFields.length === 0 ? (
            <div className="text-xs text-muted-foreground w-full text-center py-4">
              Nenhum campo disponível nesta categoria
            </div>
          ) : (
            currentFields.map((fieldId) => (
              <Button
                key={fieldId}
                size="sm"
                variant="secondary"
                className="h-7 text-xs"
                onClick={() => onPick(fieldId)}
              >
                {getLabel(fieldId)}
              </Button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default FilterSuggestionsTabs;