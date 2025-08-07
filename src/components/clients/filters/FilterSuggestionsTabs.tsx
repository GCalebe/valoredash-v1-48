import React, { useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useFilterableFields } from "@/hooks/useFilterableFields";

interface FilterSuggestionsTabsProps {
  onPick: (fieldId: string) => void;
  context?: "clients" | "conversations";
}

const SUGGESTION_ORDER = ["principal", "utm", "midia", "produtos"] as const;

export const FilterSuggestionsTabs: React.FC<FilterSuggestionsTabsProps> = ({ onPick, context = "clients" }) => {
  const { fields } = useFilterableFields();

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

      // Heurísticas por aba (espelhando as abas do cadastro: Principal, UTM, Mídia, Produtos)
      if (["name", "email", "phone", "status", "kanban_stage_id", "created_at", "updated_at"].includes(id)) {
        add(principal, id);
        return;
      }
      if (idLower.includes("utm") || name.includes("utm") || id === "session_id") {
        add(utm, id);
        return;
      }
      if (name.includes("tag") || idLower.includes("tag") || idLower.includes("segment") || idLower.includes("midia") || idLower.includes("consultation") || idLower.includes("last_message")) {
        add(midia, id);
        return;
      }
      if (idLower.includes("product") || idLower.includes("client_type") || idLower.includes("client_size") || idLower.includes("asaas") || (f as any).category === "produtos") {
        add(produtos, id);
        return;
      }
      // Fallback por categoria vinda do hook
      const cat = (f as any).category;
      if (cat === "basic" && principal.length < 12) add(principal, id);
      else if (cat === "commercial" && midia.length < 12) add(midia, id);
      else if (cat === "documents" && produtos.length < 12) add(produtos, id);
    });

    // Limitar a 12 sugestões por aba
    return {
      principal: principal.slice(0, 12),
      utm: utm.slice(0, 12),
      midia: midia.slice(0, 12),
      produtos: produtos.slice(0, 12),
    };
  }, [fields]);

  const getLabel = (id: string) => fields.find((f) => f.id === id)?.name || id;

  return (
    <div className="border rounded-md">
      <div className="px-3 py-2 border-b text-sm font-medium">Sugestões por aba</div>
      <div className="p-3">
        <Tabs defaultValue="principal" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="principal">Principal</TabsTrigger>
            <TabsTrigger value="utm">UTM</TabsTrigger>
            <TabsTrigger value="midia">Mídia</TabsTrigger>
            <TabsTrigger value="produtos">Produtos</TabsTrigger>
          </TabsList>

          {SUGGESTION_ORDER.map((key) => (
            <TabsContent key={key} value={key} className="mt-3">
              <div className="flex flex-wrap gap-2">
                {(groups as any)[key].length === 0 ? (
                  <div className="text-xs text-muted-foreground">Sem sugestões para esta aba.</div>
                ) : (
                  (groups as any)[key].map((fid: string) => (
                    <Button
                      key={fid}
                      size="sm"
                      variant="secondary"
                      className="h-7"
                      onClick={() => onPick(fid)}
                    >
                      {getLabel(fid)}
                    </Button>
                  ))
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default FilterSuggestionsTabs;


