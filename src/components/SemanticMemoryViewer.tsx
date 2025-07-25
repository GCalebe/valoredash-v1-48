import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Brain, Search, RefreshCw } from 'lucide-react';

interface SemanticEntity {
  id: string;
  name: string;
  type: string;
  confidence: number;
  relationships: string[];
}

interface SemanticMemoryViewerProps {
  sessionId?: string;
}

export function SemanticMemoryViewer({ sessionId }: SemanticMemoryViewerProps) {
  const [entities, setEntities] = useState<SemanticEntity[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const mockEntities: SemanticEntity[] = [
    {
      id: '1',
      name: 'Cliente João Silva',
      type: 'PERSON',
      confidence: 0.95,
      relationships: ['empresa_abc', 'projeto_x'],
    },
    {
      id: '2',
      name: 'Empresa ABC',
      type: 'ORGANIZATION',
      confidence: 0.88,
      relationships: ['cliente_joao', 'contrato_123'],
    },
    {
      id: '3',
      name: 'Projeto X',
      type: 'PROJECT',
      confidence: 0.92,
      relationships: ['cliente_joao', 'deadline_31'],
    },
  ];

  useEffect(() => {
    loadEntities();
  }, [, loadEntities]);

  const loadEntities = async () => {
    setLoading(true);
    try {
      // Simular carregamento
      await new Promise(resolve => setTimeout(resolve, 1000));
      setEntities(mockEntities);
    } catch (error) {
      console.error('Erro ao carregar entidades:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEntities = entities.filter(entity =>
    entity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entity.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'PERSON':
        return 'bg-blue-100 text-blue-800';
      case 'ORGANIZATION':
        return 'bg-green-100 text-green-800';
      case 'PROJECT':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Memória Semântica
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={loadEntities}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar entidades..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>

          <ScrollArea className="h-96">
            <div className="space-y-4">
              {filteredEntities.map((entity) => (
                <Card key={entity.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{entity.name}</h3>
                        <Badge className={getTypeColor(entity.type)}>
                          {entity.type}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Confiança: {(entity.confidence * 100).toFixed(1)}%
                      </div>
                      {entity.relationships.length > 0 && (
                        <div className="space-y-1">
                          <div className="text-xs font-medium text-muted-foreground">
                            Relacionamentos:
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {entity.relationships.map((rel, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {rel}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}

              {filteredEntities.length === 0 && !loading && (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm 
                    ? 'Nenhuma entidade encontrada para a busca.'
                    : 'Nenhuma entidade semântica disponível.'
                  }
                </div>
              )}

              {loading && (
                <div className="text-center py-8 text-muted-foreground">
                  Carregando entidades...
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}