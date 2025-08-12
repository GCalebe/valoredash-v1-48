import { useMemo } from "react";
import { Contact } from "@/types/client";
import { KanbanStage } from "@/hooks/useKanbanStagesSupabase";

export type GroupedContacts = {
  stageId: string;
  stageTitle: string;
  color?: string | null;
  totalCount: number;
  tags: Array<{
    tag: string;
    contacts: Contact[];
  }>;
};

export function useGroupedContactsByStageTag(
  contacts: Contact[],
  stages: KanbanStage[]
) {
  return useMemo<GroupedContacts[]>(() => {
    if (!contacts || contacts.length === 0) return [];

    const stageMap: Record<string, { title: string; color?: string | null }> = {};
    stages.forEach((s) => {
      stageMap[s.id] = { title: s.title, color: s.settings?.color ?? null };
    });

    // Group by stageId -> tag -> contacts
    const byStage: Record<string, { stageTitle: string; color?: string | null; tags: Record<string, Contact[]> }> = {};

    contacts.forEach((c) => {
      const stageId = c.kanban_stage_id || c.kanbanStage || "unknown";
      const stageInfo = stageMap[stageId] || { title: "Sem estágio", color: null };
      if (!byStage[stageId]) {
        byStage[stageId] = { stageTitle: stageInfo.title, color: stageInfo.color, tags: {} };
      }
      const tags = (c.tags && c.tags.length > 0 ? c.tags : ["Sem tag"]) as string[];
      tags.forEach((t) => {
        if (!byStage[stageId].tags[t]) byStage[stageId].tags[t] = [];
        byStage[stageId].tags[t].push(c);
      });
    });

    // Order stages by provided ordering from stages array, fallback alpha
    const stageOrder: Record<string, number> = {};
    stages.forEach((s, idx) => {
      stageOrder[s.id] = s.ordering ?? idx;
    });

    const result: GroupedContacts[] = Object.entries(byStage)
      .map(([stageId, data]) => {
        const tags = Object.entries(data.tags)
          .map(([tag, list]) => ({ tag, contacts: list }))
          .sort((a, b) => a.tag.localeCompare(b.tag));
        const totalCount = tags.reduce((acc, g) => acc + g.contacts.length, 0);
        return {
          stageId,
          stageTitle: data.stageTitle,
          color: data.color ?? null,
          totalCount,
          tags,
        } as GroupedContacts;
      })
      .sort((a, b) => {
        const ao = stageOrder[a.stageId] ?? 9999;
        const bo = stageOrder[b.stageId] ?? 9999;
        if (ao !== bo) return ao - bo;
        return a.stageTitle.localeCompare(b.stageTitle);
      });

    return result;
  }, [contacts, stages]);
}
