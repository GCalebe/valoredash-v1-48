import { useMemo } from "react";
import { Contact } from "@/types/client";
import { KanbanStage } from "@/hooks/useKanbanStages";

/**
 * Agrupa os contatos por estágio do Kanban.
 * Retorna um objeto { [kanbanStage]: Contact[] }.
 * Também loga para diagnóstico.
 */
export function useContactsByKanbanStage(
  contacts: Contact[],
  stages: KanbanStage[],
): Record<string, Contact[]> {
  return useMemo(() => {
    const stageTitles = stages.map((s) => s.title);
    const contactsByStage: Record<string, Contact[]> = {};

    // Inicializa com arrays vazios
    for (const stage of stages) {
      contactsByStage[stage.title] = [];
    }

    // Agrupa, usando fallback se necessário
    for (const contact of contacts) {
      let assignedStage = contact.kanbanStage;
      if (!stageTitles.includes(assignedStage)) {
        console.warn(
          `[useContactsByKanbanStage] Cliente "${contact.name}" (ID ${contact.id}) está com kanbanStage="${assignedStage}" não encontrado. Realocando para "${stageTitles[0]}"`,
        );
        assignedStage = stageTitles[0] || "";
      }
      if (assignedStage) {
        if (!contactsByStage[assignedStage]) {
          contactsByStage[assignedStage] = []; // fallback, embora não deva ocorrer
        }
        contactsByStage[assignedStage].push(contact);
      }
    }

    // Diagnóstico: mostra o agrupamento resultante
    console.log(
      "[useContactsByKanbanStage] Resultado agrupamento:",
      contactsByStage,
    );

    return contactsByStage;
  }, [contacts, stages]);
}
