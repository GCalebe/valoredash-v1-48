import React, { useMemo } from "react";
import type { Contact } from "@/types/client";
import type { KanbanStage } from "@/hooks/useKanbanStagesSupabase";

interface ClientsFunnelViewProps {
  contacts: Contact[];
  stages: KanbanStage[];
}

const ClientsFunnelView: React.FC<ClientsFunnelViewProps> = ({ contacts, stages }) => {
  const countsByStage = useMemo(() => {
    const map = new Map<string, number>();
    contacts.forEach((c) => {
      const key = c.kanban_stage_id || "__none__";
      map.set(key, (map.get(key) || 0) + 1);
    });
    return map;
  }, [contacts]);

  const ordered = useMemo(() => {
    // Keep incoming stages order
    const list = stages.map((s) => ({ id: s.id, title: s.title, count: countsByStage.get(s.id) || 0 }));
    return list;
  }, [stages, countsByStage]);

  const max = useMemo(() => Math.max(1, ...ordered.map((x) => x.count)), [ordered]);

  return (
    <div className="p-4 h-full overflow-auto">
      <h3 className="text-sm font-semibold mb-4">Funil por Etapas</h3>
      <div className="space-y-3">
        {ordered.map((s) => {
          const pct = Math.max(6, Math.round((s.count / max) * 100));
          return (
            <div key={s.id} className="flex items-center gap-3">
              <div className="w-40 text-xs text-muted-foreground truncate" title={s.title}>{s.title}</div>
              <div className="flex-1">
                <div className="h-6 rounded-md bg-muted relative overflow-hidden">
                  <div
                    className="h-full bg-primary/70"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
              <div className="w-12 text-right text-xs tabular-nums">{s.count}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ClientsFunnelView;


