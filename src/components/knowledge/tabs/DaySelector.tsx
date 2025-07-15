
import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface DaySelectorProps {
  selectedDays: string[];
  onSelectionChange: (days: string[]) => void;
  label: string;
}

const DaySelector: React.FC<DaySelectorProps> = ({ selectedDays, onSelectionChange, label }) => {
  const daysOfWeek = [
    "Segunda-feira",
    "Terça-feira", 
    "Quarta-feira",
    "Quinta-feira",
    "Sexta-feira",
    "Sábado",
    "Domingo"
  ];

  const toggleDay = (day: string) => {
    const newSelection = selectedDays.includes(day)
      ? selectedDays.filter(d => d !== day)
      : [...selectedDays, day];
    onSelectionChange(newSelection);
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="grid grid-cols-2 gap-2">
        {daysOfWeek.map((day) => (
          <Button
            key={day}
            type="button"
            variant={selectedDays.includes(day) ? "default" : "outline"}
            size="sm"
            onClick={() => toggleDay(day)}
            className="text-xs"
          >
            {day}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default DaySelector;
