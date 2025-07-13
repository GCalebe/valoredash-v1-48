
import { useMemo } from 'react';
import { Contact } from '@/types/client';
import { KanbanStage } from '@/hooks/useKanbanStagesSupabase';

export const useContactsByKanbanStage = (
  contacts: Contact[],
  stages: KanbanStage[]
) => {
  return useMemo(() => {
    console.log("[useContactsByKanbanStage] Processing contacts:", contacts.length);
    console.log("[useContactsByKanbanStage] Available stages:", stages.map(s => ({ id: s.id, title: s.title })));

    const contactsByStage: Record<string, Contact[]> = {};

    // Initialize all stages with empty arrays
    stages.forEach(stage => {
      contactsByStage[stage.title] = [];
    });

    // Group contacts by stage
    contacts.forEach(contact => {
      console.log(`[useContactsByKanbanStage] Processing contact ${contact.name} with stage_id: ${contact.kanban_stage_id}`);
      
      // Find the stage by ID
      const stage = stages.find(s => s.id === contact.kanban_stage_id);
      
      if (stage) {
        console.log(`[useContactsByKanbanStage] Found stage "${stage.title}" for contact ${contact.name}`);
        contactsByStage[stage.title].push(contact);
      } else {
        console.warn(`[useContactsByKanbanStage] No stage found for contact ${contact.name} with stage_id: ${contact.kanban_stage_id}`);
        // Default to first stage if no stage is found
        if (stages.length > 0) {
          contactsByStage[stages[0].title].push(contact);
        }
      }
    });

    console.log("[useContactsByKanbanStage] Final grouping:", 
      Object.entries(contactsByStage).map(([stage, contacts]) => ({ stage, count: contacts.length }))
    );

    return contactsByStage;
  }, [contacts, stages]);
};
