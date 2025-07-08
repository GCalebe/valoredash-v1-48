
import React from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MetricsFiltersProps {
  selectedDate?: Date | null;
  onDateChange?: (date: Date | null) => void;
  onApplyFilters?: () => void;
}

const MetricsFilters: React.FC<MetricsFiltersProps> = ({
  selectedDate,
  onDateChange,
  onApplyFilters,
}) => {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Filtros</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Data</label>
          <Calendar
            selected={selectedDate}
            onSelect={onDateChange}
            className="rounded-md border"
          />
        </div>
        {onApplyFilters && (
          <Button onClick={onApplyFilters} className="w-full">
            Aplicar Filtros
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default MetricsFilters;
