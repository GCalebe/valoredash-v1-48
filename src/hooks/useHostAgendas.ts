// @ts-nocheck
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type HostAgendasMap = Record<string, string[]>;

export function useHostAgendas(hostIds: string[]) {
  const [agendasByHostId, setAgendasByHostId] = useState<HostAgendasMap>({});
  const [loading, setLoading] = useState(false);

  const fetchHostAgendas = useCallback(async () => {
    if (!hostIds || hostIds.length === 0) {
      setAgendasByHostId({});
      return;
    }
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("employee_agendas")
        .select("employee_id, agenda_id")
        .in("employee_id", hostIds);

      if (error) throw error;

      const agendaMap: HostAgendasMap = {};
      data?.forEach((item) => {
        if (!agendaMap[item.employee_id]) {
          agendaMap[item.employee_id] = [];
        }
        agendaMap[item.employee_id].push(item.agenda_id);
      });

      setAgendasByHostId(agendaMap);
    } catch (err) {
      console.error("Erro ao buscar agendas dos anfitriões:", err);
      setAgendasByHostId({});
    } finally {
      setLoading(false);
    }
  }, [hostIds?.join(",")]);

  useEffect(() => {
    fetchHostAgendas();
  }, [fetchHostAgendas]);

  return { agendasByHostId, loading, refetch: fetchHostAgendas };
}


