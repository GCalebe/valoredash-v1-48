import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFilterableFields } from "@/hooks/useFilterableFields";

interface FilterSuggestionsTabsProps {
  onPick: (fieldId: string) => void;
  context?: "clients" | "conversations";
}

type TabType = "principal" | "utm" | "midia" | "produtos";

const TABS: { id: TabType; label: string; description: string }[] = [
  { id: "principal", label: "Principal", description: "Campos básicos do cliente" },
  { id: "utm", label: "UTM", description: "Dados de origem e tracking" },
  { id: "midia", label: "Mídia", description: "Tags e classificações" },
  { id: "produtos", label: "Produtos", description: "Informações comerciais" },
];

export const FilterSuggestionsTabs: React.FC<FilterSuggestionsTabsProps> = ({ 
  onPick, 
  context = "clients" 
}) => {
  const { fields } = useFilterableFields();
  const [activeTab, setActiveTab] = useState<TabType>("principal");

  const groups = useMemo(() => {
    const byId: Record<string, boolean> = {};
    const add = (arr: any[], id: string) => {
      if (!byId[id]) {
        byId[id] = true;
        arr.push(id);
      }
    };

    const principal: string[] = [];
    const utm: string[] = [];
    const midia: string[] = [];
    const produtos: string[] = [];

    fields.forEach((f) => {
      const id = f.id;
      const name = f.name?.toLowerCase?.() || "";
      const idLower = id.toLowerCase();

      // Heurísticas por aba
      if (["name", "email", "phone", "status", "kanban_stage_id", "created_at", "updated_at"].includes(id)) {
        add(principal, id);
        return;
      }
      if (idLower.includes("utm") || name.includes("utm") || id === "session_id") {
        add(utm, id);
        return;
      }
      if (name.includes("tag") || idLower.includes("tag") || idLower.includes("segment") || 
          idLower.includes("midia") || idLower.includes("consultation") || idLower.includes("last_message")) {
        add(midia, id);
        return;
      }
      if (idLower.includes("product") || idLower.includes("client_type") || 
          idLower.includes("client_size") || idLower.includes("asaas") || 
          (f as any).category === "produtos") {
        add(produtos, id);
        return;
      }
      
      // Fallback por categoria
      const cat = (f as any).category;
      if (cat === "basic" && principal.length < 12) add(principal, id);
      else if (cat === "commercial" && midia.length < 12) add(midia, id);
      else if (cat === "documents" && produtos.length < 12) add(produtos, id);
    });

    return {
      principal: principal.slice(0, 12),
      utm: utm.slice(0, 12),
      midia: midia.slice(0, 12),
      produtos: produtos.slice(0, 12),
    };
  }, [fields]);

  const getLabel = (id: string) => fields.find((f) => f.id === id)?.name || id;

  const currentFields = groups[activeTab];

  return (
    <div className="space-y-3">
      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 bg-muted rounded-lg">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
              activeTab === tab.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
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