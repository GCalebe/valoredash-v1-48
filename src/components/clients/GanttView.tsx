import React, { useMemo } from "react";
import { addDays, differenceInCalendarDays, format, isAfter, isBefore, isValid, max as dfMax, min as dfMin, parseISO } from "date-fns";
import type { Contact } from "@/types/client";
import type { KanbanStage } from "@/hooks/useKanbanStagesSupabase";

interface GanttViewProps {
  contacts: Contact[];
  onContactClick: (contact: Contact) => void;
  searchTerm?: string;
  stages?: KanbanStage[];
}

// Helper to safely parse ISO or return undefined
function safeParse(dateStr?: string | null): Date | undefined {
  if (!dateStr) return undefined;
  try {
    const d = parseISO(dateStr);
    return isValid(d) ? d : undefined;
  } catch {
    return undefined;
  }
}

const dayWidth = 40; // px per day
const rowHeight = 40; // px per row

const GanttView: React.FC<GanttViewProps> = ({ contacts, onContactClick, searchTerm = "", stages = [] }) => {
  // Filter by search term (name/email/phone)
  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return contacts;
    return contacts.filter((c) =>
      (c.name && c.name.toLowerCase().includes(term)) ||
      (c.email && c.email.toLowerCase().includes(term)) ||
      (c.phone && c.phone.toLowerCase().includes(term))
    );
  }, [contacts, searchTerm]);

  // Build timeline bounds
  const { startDate, endDate, rows } = useMemo(() => {
    const today = new Date();
    let minStart: Date | undefined;
    let maxEnd: Date | undefined;

    const computedRows = filtered.map((c) => {
      const start = safeParse(c.contractDate) || safeParse(c.created_at) || today;
      // Prefer last_interaction or updated_at as end, fallback +7d
      const suggestedEnd = safeParse(c.last_interaction) || safeParse(c.updated_at) || addDays(start, 7);
      const end = isBefore(suggestedEnd, start) ? addDays(start, 1) : suggestedEnd;

      minStart = minStart ? dfMin([minStart, start]) : start;
      maxEnd = maxEnd ? dfMax([maxEnd, end]) : end;

      return { contact: c, start, end };
    });

    // Default range when no contacts
    if (!minStart || !maxEnd) {
      minStart = addDays(today, -7);
      maxEnd = addDays(today, 21);
    }

    // Ensure at least 14 days span
    if (differenceInCalendarDays(maxEnd, minStart) < 14) {
      maxEnd = addDays(minStart, 14);
    }

    return { startDate: minStart, endDate: maxEnd, rows: computedRows };
  }, [filtered]);

  // Build date columns (by day)
  const dateCols = useMemo(() => {
    const days: Date[] = [];
    let d = startDate;
    while (isBefore(d, endDate) || d.getTime() === endDate.getTime()) {
      days.push(d);
      d = addDays(d, 1);
    }
    return days;
  }, [startDate, endDate]);

  const totalWidth = dateCols.length * dayWidth;

  const getStageColor = (stageId?: string) => {
    if (!stageId) return "var(--chart-3, hsl(210 40% 40%))"; // fallback semantic token
    const st = stages.find((s) => s.id === stageId);
    return st?.settings?.color || "var(--chart-4, hsl(280 40% 40%))";
  };

  const getLeftPx = (d: Date) => differenceInCalendarDays(d, startDate) * dayWidth;
  const getWidthPx = (s: Date, e: Date) => Math.max(8, (differenceInCalendarDays(e, s) + 1) * dayWidth - 6);

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between pb-2">
        <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">Visão Gantt</h2>
        <div className="text-xs text-gray-500 dark:text-gray-400">{filtered.length} leads</div>
      </div>

      <div className="flex-1 flex overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        {/* Left sticky column */}
        <div className="w-64 min-w-64 border-r border-gray-200 dark:border-gray-800 overflow-y-auto">
          {/* Spacer for header height */}
          <div className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-800/60 backdrop-blur supports-[backdrop-filter]:bg-gray-800/50 text-xs text-gray-600 dark:text-gray-300 px-3 py-2 border-b border-gray-200 dark:border-gray-700">Lead</div>
          <div style={{ maxHeight: "100%" }}>
            {rows.map(({ contact }, idx) => (
              <button
                key={contact.id}
                onClick={() => onContactClick(contact)}
                className="w-full h-[40px] flex items-center gap-2 px-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors"
              >
                <div className="flex-1 truncate text-sm text-gray-800 dark:text-gray-100">{contact.name || "Sem nome"}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Timeline area */}
        <div className="flex-1 overflow-auto">
          {/* Timeline header */}
          <div className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-800/60 backdrop-blur supports-[backdrop-filter]:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
            <div className="relative" style={{ width: totalWidth }}>
              <div className="flex">
                {dateCols.map((d, i) => (
                  <div
                    key={i}
                    className="h-10 flex items-center justify-center text-xs text-gray-600 dark:text-gray-300 border-r border-gray-200 dark:border-gray-800"
                    style={{ width: dayWidth }}
                  >
                    <div className="text-[10px] leading-none">
                      <div className="font-medium">{format(d, "dd")}</div>
                      <div className="opacity-70">{format(d, "MMM").toUpperCase()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Rows */}
          <div className="relative" style={{ width: totalWidth }}>
            {rows.map(({ contact, start, end }, rIdx) => (
              <div key={contact.id} className="relative" style={{ height: rowHeight }}>
                {/* Grid background lines */}
                <div className="absolute inset-0 pointer-events-none flex">
                  {dateCols.map((_, i) => (
                    <div key={i} className="h-full border-r border-gray-100 dark:border-gray-800" style={{ width: dayWidth }} />
                  ))}
                </div>

                {/* Bar */}
                <div
                  className="absolute top-2 h-6 rounded-md shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  style={{
                    left: getLeftPx(start),
                    width: getWidthPx(start, end),
                    background: getStageColor(contact.kanban_stage_id),
                  }}
                  title={`${contact.name || "Sem nome"} — ${format(start, "dd/MM")} → ${format(end, "dd/MM")}`}
                  onClick={() => onContactClick(contact)}
                >
                  <div className="px-2 text-xs text-white/90 truncate" style={{ lineHeight: "24px" }}>
                    {contact.name}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GanttView;
