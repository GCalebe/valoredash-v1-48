import React from "react";
import { Filter, Search } from "lucide-react";
import { Command, CommandInput, CommandList, CommandEmpty } from "@/components/ui/command";

interface FilterHeaderProps {
  onFieldSearch?: (query: string) => void;
}

export const FilterHeader: React.FC<FilterHeaderProps> = ({ onFieldSearch }) => {
  return (
    <div className="px-6 pt-6 pb-4 border-b bg-gradient-to-r from-background to-muted/30">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-primary/10">
          <Filter className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Filtros Avançados</h2>
          <p className="text-sm text-muted-foreground">
            Configure filtros personalizados para encontrar clientes específicos
          </p>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Search className="h-4 w-4" />
          <span>Busque por qualquer campo para começar</span>
        </div>
        <Command className="rounded-lg border border-border/50 bg-background/50">
          <CommandInput 
            placeholder="Digite o nome de um campo (ex.: email, status, telefone)..." 
            onChange={(e) => onFieldSearch?.(e.target.value)}
          />
          <CommandList className="max-h-0">
            <CommandEmpty />
          </CommandList>
        </Command>
      </div>
    </div>
  );
};