import React, { useMemo } from "react";
import type { Contact } from "@/types/client";

interface ClientsMarketingViewProps {
  contacts: Contact[];
}

const groupBy = <T, K extends string | number>(items: T[], getKey: (item: T) => K) => {
  const map = new Map<K, T[]>();
  items.forEach((item) => {
    const key = getKey(item);
    map.set(key, [...(map.get(key) || []), item]);
  });
  return map;
};

const ClientsMarketingView: React.FC<ClientsMarketingViewProps> = ({ contacts }) => {
  const byTag = useMemo(() => {
    const all: Record<string, number> = {};
    contacts.forEach((c) => {
      (c.tags || []).forEach((t) => {
        all[t] = (all[t] || 0) + 1;
      });
    });
    return Object.entries(all).sort((a, b) => b[1] - a[1]);
  }, [contacts]);

  const bySource = useMemo(() => {
    // usa lead_source se existir; caso contrário agrupa como "Indefinido"
    const grouped = groupBy(contacts, (c) => (c as any).lead_source || "Indefinido");
    return Array.from(grouped.entries()).map(([k, list]) => ({ key: k, count: list.length }))
      .sort((a, b) => b.count - a.count);
  }, [contacts]);

  return (
    <div className="p-4 h-full overflow-auto">
      <h3 className="text-sm font-semibold mb-4">Visão de Marketing</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-xs font-medium text-muted-foreground mb-2">Distribuição por Tag</h4>
          <div className="space-y-2">
            {byTag.length === 0 ? (
              <div className="text-xs text-muted-foreground">Sem tags</div>
            ) : (
              byTag.map(([tag, count]) => (
                <div key={tag} className="flex justify-between text-xs">
                  <span className="truncate pr-2">#{tag}</span>
                  <span className="tabular-nums">{count}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <h4 className="text-xs font-medium text-muted-foreground mb-2">Origem dos Leads</h4>
          <div className="space-y-2">
            {bySource.length === 0 ? (
              <div className="text-xs text-muted-foreground">Sem dados de origem</div>
            ) : (
              bySource.map((row) => (
                <div key={row.key} className="flex justify-between text-xs">
                  <span className="truncate pr-2">{row.key}</span>
                  <span className="tabular-nums">{row.count}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientsMarketingView;


