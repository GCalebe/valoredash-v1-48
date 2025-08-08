// @ts-nocheck
import { useCallback, useMemo, useState } from "react";
import { toast } from "@/hooks/use-toast";

export function useKanbanDragAndDrop(stages: any[], contacts: any[], onStageChange: (id: string, newStage: string) => Promise<void> | void) {
  const [draggedContactId, setDraggedContactId] = useState<string | null>(null);
  const [isUpdatingStage, setIsUpdatingStage] = useState(false);
  const [optimisticContacts, setOptimisticContacts] = useState<any[]>(contacts);

  const memoizedStages = useMemo(() => stages, [stages]);

  const handleDragStart = useCallback((start: any) => {
    setDraggedContactId(start.draggableId);
    document.body.style.userSelect = 'none';
    document.body.style.pointerEvents = 'none';
    document.body.classList.add('dragging');
  }, []);

  const handleDragEnd = useCallback(async (result: any) => {
    // opcional: medir duração se necessário
    setDraggedContactId(null);
    document.body.style.userSelect = '';
    document.body.style.pointerEvents = '';
    document.body.classList.remove('dragging');

    if (!result?.destination) return;
    const { source, destination, draggableId } = result;
    if (source.droppableId === destination.droppableId) return;

    const sourceStage = memoizedStages.find((s: any) => s.id === source.droppableId);
    const destinationStage = memoizedStages.find((s: any) => s.id === destination.droppableId);
    if (!sourceStage || !destinationStage) {
      toast({ title: 'Erro', description: 'Não foi possível encontrar os estágios.', variant: 'destructive' });
      return;
    }

    setOptimisticContacts(prev => prev.map(c => c.id === draggableId ? { ...c, kanban_stage_id: destination.droppableId } : c));
    setIsUpdatingStage(true);
    try {
      await onStageChange(draggableId, destination.droppableId);
      toast({ title: 'Cliente movido', description: `Cliente movido para ${destinationStage.title} com sucesso`, duration: 2000 });
    } catch (e) {
      console.error('useKanbanDragAndDrop: failed to update stage', e);
      setOptimisticContacts(contacts);
      toast({ title: 'Erro ao mover cliente', description: 'Tente novamente.', variant: 'destructive' });
    } finally {
      setIsUpdatingStage(false);
    }
  }, [memoizedStages, onStageChange, contacts]);

  return { draggedContactId, isUpdatingStage, optimisticContacts, setOptimisticContacts, handleDragStart, handleDragEnd } as const;
}


