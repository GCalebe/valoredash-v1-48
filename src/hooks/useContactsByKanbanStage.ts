
import { useMemo } from "react";
import { Contact } from "@/types/client";
import { KanbanStage } from "@/hooks/useKanbanStages";

/**
 * Agrupa os contatos por estágio do Kanban.
 * Retorna um objeto { [kanbanStageTitle]: Contact[] }.
 * Também loga para diagnóstico.
 */
export function useContactsByKanbanStage(
  contacts: Contact[],
  stages: KanbanStage[],
): Record<string, Contact[]> {
  return useMemo(() => {
    const stageMap = new Map(stages.map(stage => [stage.id, stage.title]));
    const contactsByStage: Record<string, Contact[]> = {};

    // Inicializa com arrays vazios para todos os estágios
    for (const stage of stages) {
      contactsByStage[stage.title] = [];
    }

    // Agrupa contatos por estágio
    for (const contact of contacts) {
      // Usa kanban_stage_id se disponível, senão usa kanbanStage como fallback
      let stageId = contact.kanban_stage_id || contact.kanbanStage;
      let stageTitle = stageMap.get(stageId) || stageId;
      
      // Se não encontrar o estágio nas stages configuradas, usa o primeiro como fallback
      if (!stageTitle || !contactsByStage[stageTitle]) {
        console.warn(
          `[useContactsByKanbanStage] Cliente "${contact.name}" (ID ${contact.id}) está com stage "${stageId}" não encontrado. Realocando para "${stages[0]?.title}"`
        );
        stageTitle = stages[0]?.title || "Entraram";
      }
      
      if (stageTitle && contactsByStage[stageTitle]) {
        contactsByStage[stageTitle].push(contact);
      }
    }

    // Diagnóstico: mostra o agrupamento resultante
    console.log(
      "[useContactsByKanbanStage] Resultado agrupamento:",
      Object.entries(contactsByStage).map(([stage, contacts]) => ({
        stage,
        count: contacts.length,
        contactIds: contacts.map(c => c.id)
      }))
    );

    return contactsByStage;
  }, [contacts, stages]);
}
