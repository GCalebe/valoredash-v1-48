import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, StarOff } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export interface Memory {
  id: number;
  message: string;
  memory_type: string;
  created_at: string;
  importance?: number;
  entities?: Array<{ name: string }>;
  context?: Record<string, unknown>;
}

interface Props {
  memory: Memory;
  onToggleImportance: (id: number, importance: number) => void;
}

export function MemoryItem({ memory, onToggleImportance }: Props) {
  return (
    <Card
      className={cn(
        'mb-4 transition-all duration-200',
        memory.importance >= 4 ? 'border-amber-400 dark:border-amber-500' : ''
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-base">
              {memory.memory_type === 'episodic' ? 'Memória Episódica' : 'Mensagem'}
            </CardTitle>
            <CardDescription className="text-xs">
              {format(new Date(memory.created_at), 'dd MMM yyyy HH:mm:ss', { locale: ptBR })}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onToggleImportance(memory.id, memory.importance || 0)}
            title={memory.importance && memory.importance >= 4 ? 'Remover importância' : 'Marcar como importante'}
          >
            {memory.importance && memory.importance >= 4 ? (
              <Star className="h-4 w-4 text-amber-500" />
            ) : (
              <StarOff className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm whitespace-pre-wrap">{memory.message}</p>
        {memory.entities && memory.entities.length > 0 && (
          <div className="mt-2">
            <p className="text-xs text-muted-foreground mb-1">Entidades:</p>
            <div className="flex flex-wrap gap-1">
              {memory.entities.map((entity, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {entity.name}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      {memory.context && Object.keys(memory.context).length > 0 && (
        <CardFooter className="pt-0">
          <div className="w-full">
            <p className="text-xs text-muted-foreground mb-1">Contexto:</p>
            <div className="text-xs bg-muted p-2 rounded-md">
              <pre className="whitespace-pre-wrap">
                {JSON.stringify(memory.context, null, 2)}
              </pre>
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}


