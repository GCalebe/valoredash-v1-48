import React from "react";
import { Button } from "@/components/ui/button";

interface CalendarViewSwitcherProps {
  view: "mes" | "semana" | "dia" | "agenda";
  onChange: (view: "mes" | "semana" | "dia" | "agenda") => void;
}

export const CalendarViewSwitcher: React.FC<CalendarViewSwitcherProps> = ({
  view,
  onChange,
}) => {
  return (
    <div className="flex gap-1 bg-black/10 dark:bg-white/10 rounded-lg p-1">
      {[
        { key: "mes", label: "Mês" },
        { key: "semana", label: "Semana" },
        { key: "dia", label: "Dia" },
        { key: "agenda", label: "Agenda" },
      ].map((item) => (
        <Button
          key={item.key}
          size="sm"
          variant={view === item.key ? "default" : "ghost"}
          className={
            view === item.key
              ? "bg-white text-blue-700 shadow-md"
              : "text-white hover:bg-white/20"
          }
          style={{
            minWidth: 60,
            height: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => onChange(item.key as any)}
        >
          {item.label}
        </Button>
      ))}
    </div>
  );
};
