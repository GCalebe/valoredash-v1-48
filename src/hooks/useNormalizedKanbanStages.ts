
import { useMemo } from "react";
import { Contact } from "@/types/client";
import { KanbanStage } from "@/hooks/useKanbanStages";

/**
 * Normaliza contatos para garantir que tenham estágios válidos do Kanban
 */
export function useNormalizedKanbanStages(
  contacts: Contact[],
  stages: KanbanStage[]
): Contact[] {
  return useMemo(() => {
    if (!contacts || !stages || stages.length === 0) {
      return contacts || [];
    }

    const defaultStage = stages[0];
    const stageMap = new Map(stages.map(stage => [stage.id, stage]));

    return contacts.map((contact) => {
      // Check if the contact's stage exists in the available stages
      const currentStageId = contact.kanban_stage_id;
      const hasValidStage = currentStageId && stageMap.has(currentStageId);

      if (!hasValidStage) {
        console.warn(
          `[useNormalizedKanbanStages] Contact "${contact.name}" (ID: ${contact.id}) has invalid stage "${currentStageId}". Using default stage "${defaultStage.title}".`
        );

        return {
          ...contact,
          kanban_stage_id: defaultStage.id,
          kanbanStage: defaultStage.title,
        };
      }

      // If stage is valid, ensure both fields are set correctly
      const stage = stageMap.get(currentStageId);
      return {
        ...contact,
        kanbanStage: stage?.title || contact.kanbanStage,
      };
    });
  }, [contacts, stages]);
}
