import React, { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useFilterableFields } from "@/hooks/useFilterableFields";
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";

interface FieldPickerProps {
  onPick: (fieldId: string) => void;
}

/**
 * Combobox simples para pesquisar e selecionar campos filtráveis
 */
export const FieldPicker: React.FC<FieldPickerProps> = ({ onPick }) => {
  const { fields } = useFilterableFields();
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return fields;
    return fields.filter((f) => f.name.toLowerCase().includes(q));
  }, [fields, query]);

  return (
    <div className="space-y-2">
      <Input placeholder="Buscar campo..." value={query} onChange={(e) => setQuery(e.target.value)} />
      <Command className="rounded-md border">
        <CommandList className="max-h-44">
          {/* Grupos por categoria conforme as abas de criação do cliente */}
          {(["basic","commercial","personalized","documents"] as const).map((cat) => {
            const groupItems = results.filter((f) => (f.category || "basic") === cat);
            if (groupItems.length === 0) return null;
            const titleMap: Record<string, string> = {
              basic: "Básico",
              commercial: "Comercial",
              personalized: "Personalizados",
              documents: "Documentos",
            };
            return (
              <CommandGroup key={cat} heading={titleMap[cat] || cat}>
                {groupItems.map((f) => (
                  <CommandItem key={f.id} onSelect={() => onPick(f.id)}>
                    {f.name}
                    {(f as any).isCustom && (
                      <span className="ml-2 text-xs text-muted-foreground">(custom)</span>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            );
          })}
        </CommandList>
      </Command>
    </div>
  );
};


