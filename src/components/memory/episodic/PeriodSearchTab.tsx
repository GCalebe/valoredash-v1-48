import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { MemoryItem, Memory } from './MemoryItem';
import { DateSelector } from './DateSelector';

interface Props {
  startDate: Date | undefined;
  setStartDate: (date: Date | undefined) => void;
  endDate: Date | undefined;
  setEndDate: (date: Date | undefined) => void;
  isSearching: boolean;
  periodMemories: Memory[];
  onSearch: () => void;
  onToggleImportance: (id: number, importance: number) => void;
}

export function PeriodSearchTab({
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  isSearching,
  periodMemories,
  onSearch,
  onToggleImportance,
}: Props) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <DateSelector label="Data inicial" date={startDate} onSelect={setStartDate} />
        <DateSelector label="Data final" date={endDate} onSelect={setEndDate} />
        <div className="flex items-end">
          <Button onClick={onSearch} disabled={!startDate || !endDate || isSearching}>
            {isSearching ? 'Buscando...' : 'Buscar'}
          </Button>
        </div>
      </div>
      {isSearching ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : periodMemories.length > 0 ? (
        <div className="space-y-2">
          {periodMemories.map((memory) => (
            <MemoryItem
              key={memory.id}
              memory={memory}
              onToggleImportance={onToggleImportance}
            />
          ))}
        </div>
      ) : (
        <p className="text-center py-8 text-muted-foreground">
          {startDate && endDate
            ? 'Nenhuma memória encontrada para o período selecionado.'
            : 'Selecione um período para buscar memórias.'}
        </p>
      )}
    </div>
  );
}


