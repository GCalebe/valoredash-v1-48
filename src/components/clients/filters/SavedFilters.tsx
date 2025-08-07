import React, { useState, useEffect } from "react";
import { Button } from "../../ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { FilterGroup } from "./filterConstants";
import { AdvancedFiltersService } from "../../../services/advancedFiltersService";
import { supabase } from "../../../integrations/supabase/client";

interface SavedFilter {
  id: string;
  name: string;
  filter_data: FilterGroup;
  created_at: string;
}

interface SavedFiltersProps {
  onApplyFilter: (filters: FilterGroup) => void;
  onFilterDeleted?: () => void;
}

export function SavedFilters({ onApplyFilter, onFilterDeleted }: SavedFiltersProps) {
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Carrega filtros salvos ao montar o componente
  useEffect(() => {
    loadSavedFilters();
  }, []);

  const loadSavedFilters = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.warn('Usuário não autenticado');
        return;
      }

      const { data, error } = await AdvancedFiltersService.loadSavedFilters(user.id);
      
      if (error) {
        toast.error('Erro ao carregar filtros salvos: ' + error);
        return;
      }

      setSavedFilters(data);
    } catch (error) {
      console.error('Erro ao carregar filtros salvos:', error);
      toast.error('Erro inesperado ao carregar filtros salvos');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilter = (filter: FilterGroup) => {
    onApplyFilter(filter);
    toast.success('Filtro aplicado com sucesso!');
  };

  const handleDeleteFilter = async (filterId: string) => {
    try {
      setDeletingId(filterId);
      const { success, error } = await AdvancedFiltersService.deleteSavedFilter(filterId);
      
      if (!success) {
        toast.error('Erro ao deletar filtro: ' + error);
        return;
      }

      setSavedFilters(prev => prev.filter(f => f.id !== filterId));
      toast.success('Filtro deletado com sucesso!');
      onFilterDeleted?.();
    } catch (error) {
      console.error('Erro ao deletar filtro:', error);
      toast.error('Erro inesperado ao deletar filtro');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="ml-2 text-sm text-muted-foreground">Carregando filtros...</span>
      </div>
    );
  }

  if (savedFilters.length === 0) {
    return (
      <div className="text-sm text-muted-foreground text-center py-4">
        Nenhum filtro salvo encontrado.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium text-foreground">
        Filtros Salvos ({savedFilters.length})
      </div>
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {savedFilters.map((savedFilter) => (
          <div
            key={savedFilter.id}
            className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{savedFilter.name}</div>
              <div className="text-xs text-muted-foreground">
                {new Date(savedFilter.created_at).toLocaleDateString('pt-BR')}
              </div>
            </div>
            <div className="flex items-center gap-2 ml-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleApplyFilter(savedFilter.filter_data)}
                className="text-xs"
              >
                Aplicar
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDeleteFilter(savedFilter.id)}
                disabled={deletingId === savedFilter.id}
                className="text-xs text-destructive hover:text-destructive"
              >
                {deletingId === savedFilter.id ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Trash2 className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}