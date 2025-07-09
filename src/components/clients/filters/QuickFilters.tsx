import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { availableTags } from "./filterConstants";

interface QuickFiltersProps {
  statusFilter: string;
  segmentFilter: string;
  lastContactFilter: string;
  onStatusFilterChange: (value: string) => void;
  onSegmentFilterChange: (value: string) => void;
  onLastContactFilterChange: (value: string) => void;
}

export const QuickFilters: React.FC<QuickFiltersProps> = ({
  statusFilter,
  segmentFilter,
  lastContactFilter,
  onStatusFilterChange,
  onSegmentFilterChange,
  onLastContactFilterChange,
}) => {
  const [tagInput, setTagInput] = useState("");

  // Filtrar tags com base na pesquisa
  const filteredTags =
    tagInput.trim() !== ""
      ? availableTags.filter((tag) =>
          tag.toLowerCase().includes(tagInput.toLowerCase()),
        )
      : [];

  // Adicionar tag como filtro
  const handleAddTag = (tag: string) => {
    onSegmentFilterChange(tag);
    setTagInput("");
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="status-filter" className="text-sm font-medium">
            Status
          </Label>
          <Select
            value={statusFilter}
            onValueChange={onStatusFilterChange}
          >
            <SelectTrigger id="status-filter">
              <SelectValue placeholder="Todos os status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="Ganhos">Ganhos</SelectItem>
              <SelectItem value="Perdidos">Perdidos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="segment-filter" className="text-sm font-medium">
            Segmento
          </Label>
          <Select
            value={segmentFilter}
            onValueChange={onSegmentFilterChange}
          >
            <SelectTrigger id="segment-filter">
              <SelectValue placeholder="Todos os segmentos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os segmentos</SelectItem>
              {availableTags.map((tag) => (
                <SelectItem key={tag} value={tag}>
                  {tag}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="last-contact-filter" className="text-sm font-medium">
            Último Contato
          </Label>
          <Select
            value={lastContactFilter}
            onValueChange={onLastContactFilterChange}
          >
            <SelectTrigger id="last-contact-filter">
              <SelectValue placeholder="Todos os períodos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os períodos</SelectItem>
              <SelectItem value="today">Hoje</SelectItem>
              <SelectItem value="yesterday">Ontem</SelectItem>
              <SelectItem value="this-week">Esta semana</SelectItem>
              <SelectItem value="last-week">Semana passada</SelectItem>
              <SelectItem value="this-month">Este mês</SelectItem>
              <SelectItem value="last-month">Mês passado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium mb-2 block">
          Pesquisar Tags
        </Label>
        <div className="flex gap-2">
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="Digite para pesquisar tags..."
            className="flex-1"
          />
        </div>
        {filteredTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {filteredTags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="cursor-pointer hover:bg-secondary/80"
                onClick={() => handleAddTag(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};