import { Skeleton } from '@/components/ui/skeleton';
import { MemoryItem, Memory } from './MemoryItem';

interface Props {
  loading: boolean;
  memories: Memory[];
  onToggleImportance: (id: number, importance: number) => void;
}

export function MemoriesTab({ loading, memories, onToggleImportance }: Props) {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  if (memories.length === 0) {
    return (
      <p className="text-center py-8 text-muted-foreground">
        Nenhuma memória episódica encontrada.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {memories.map((memory) => (
        <MemoryItem
          key={memory.id}
          memory={memory}
          onToggleImportance={onToggleImportance}
        />
      ))}
    </div>
  );
}


