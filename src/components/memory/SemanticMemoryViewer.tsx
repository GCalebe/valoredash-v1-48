'use client';

import { useState, useMemo } from 'react';
import { useSemanticMemory } from '@/hooks/useSemanticMemory';
import { N8nChatMemory, SemanticEntity } from '@/types/memory';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, Star, RefreshCw, Brain } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SemanticMemoryViewerProps {
  sessionId: string;
}

/**
 * Componente para visualização e busca de memória semântica
 */
export function SemanticMemoryViewer({ sessionId }: SemanticMemoryViewerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<N8nChatMemory[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Usar o hook de memória semântica
  const {
    memories,
    entities,
    relationships,
    loading,
    error,
    refresh,
    searchBySimilarity,
    searchByEntity,
    updateImportance,
  } = useSemanticMemory({
    sessionId,
    useCache: true,
    autoRefresh: true,
    refreshInterval: 60000, // 1 minuto
  });
  
  // Agrupar entidades por tipo
  const entityGroups = useMemo(() => {
    const groups: Record<string, SemanticEntity[]> = {};
    
    entities.forEach(entity => {
      const type = entity.type || 'other';
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(entity);
    });
    
    return groups;
  }, [entities]);
  
  // Função para buscar por similaridade
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setSelectedEntity(null);
    
    try {
      const results = await searchBySimilarity(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Erro na busca:', error);
    } finally {
      setIsSearching(false);
    }
  };
  
  // Função para buscar por entidade
  const handleEntityClick = async (entityName: string) => {
    setIsSearching(true);
    setSelectedEntity(entityName);
    setSearchQuery('');
    
    try {
      const results = await searchByEntity(entityName);
      setSearchResults(results);
    } catch (error) {
      console.error('Erro na busca por entidade:', error);
    } finally {
      setIsSearching(false);
    }
  };
  
  // Função para atualizar importância
  const handleUpdateImportance = async (memoryId: number, newImportance: number) => {
    await updateImportance(memoryId, newImportance);
  };
  
  // Renderizar cartão de memória
  const renderMemoryCard = (memory: N8nChatMemory) => {
    const formattedDate = memory.created_at
      ? formatDistanceToNow(new Date(memory.created_at), { addSuffix: true, locale: ptBR })
      : '';
    
    return (
      <Card key={memory.id} className="mb-4">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-sm font-medium">
              {memory.message?.content || 'Sem conteúdo'}
            </CardTitle>
            <div className="flex items-center">
              {Array.from({ length: 10 }).map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  className={`cursor-pointer ${i < (memory.importance || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                  onClick={() => handleUpdateImportance(memory.id, i + 1)}
                />
              ))}
            </div>
          </div>
          <CardDescription>
            {formattedDate}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {memory.entities && memory.entities.length > 0 && (
            <div className="mb-2">
              <p className="text-xs text-muted-foreground mb-1">Entidades:</p>
              <div className="flex flex-wrap gap-1">
                {memory.entities.map((entity, index) => (
                  <Badge 
                    key={index} 
                    variant="outline"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                    onClick={() => handleEntityClick(entity.name)}
                  >
                    {entity.name}
                    {entity.type && <span className="ml-1 opacity-70">({entity.type})</span>}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {memory.relationships && memory.relationships.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Relacionamentos:</p>
              <ul className="text-xs">
                {memory.relationships.map((rel, index) => (
                  <li key={index}>
                    <span 
                      className="cursor-pointer hover:underline" 
                      onClick={() => handleEntityClick(rel.source)}
                    >
                      {rel.source}
                    </span>
                    {' '}<span className="text-muted-foreground">{rel.relation}</span>{' '}
                    <span 
                      className="cursor-pointer hover:underline"
                      onClick={() => handleEntityClick(rel.target)}
                    >
                      {rel.target}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="text-xs text-muted-foreground">
          <div className="flex justify-between w-full">
            <span>Nível: {memory.memory_level || 'desconhecido'}</span>
            <span>ID: {memory.id}</span>
          </div>
        </CardFooter>
      </Card>
    );
  };
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center">
          <Brain className="mr-2" /> Memória Semântica
        </h2>
        <Button variant="outline" size="sm" onClick={refresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>
      
      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-md mb-4">
          Erro ao carregar memória semântica: {error.message}
        </div>
      )}
      
      <Tabs defaultValue="search">
        <TabsList className="mb-4">
          <TabsTrigger value="search">Busca</TabsTrigger>
          <TabsTrigger value="entities">Entidades</TabsTrigger>
          <TabsTrigger value="all">Todas Memórias</TabsTrigger>
        </TabsList>
        
        <TabsContent value="search">
          <div className="mb-6">
            <div className="flex gap-2">
              <Input
                placeholder="Buscar memórias semânticas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1"
              />
              <Button onClick={handleSearch} disabled={isSearching}>
                {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </Button>
            </div>
            
            {selectedEntity && (
              <div className="mt-2">
                <Badge className="bg-primary">
                  Entidade: {selectedEntity}
                  <button 
                    className="ml-2 hover:text-primary-foreground/80"
                    onClick={() => {
                      setSelectedEntity(null);
                      setSearchResults([]);
                    }}
                  >
                    ×
                  </button>
                </Badge>
              </div>
            )}
          </div>
          
          <div>
            {isSearching ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : searchResults.length > 0 ? (
              <div>
                <h3 className="text-sm font-medium mb-4">
                  {searchResults.length} resultado(s) encontrado(s)
                </h3>
                {searchResults.map(renderMemoryCard)}
              </div>
            ) : searchQuery || selectedEntity ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum resultado encontrado.
              </div>
            ) : null}
          </div>
        </TabsContent>
        
        <TabsContent value="entities">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div>
              {Object.entries(entityGroups).map(([type, entitiesOfType]) => (
                <div key={type} className="mb-6">
                  <h3 className="text-lg font-medium mb-2 capitalize">{type}</h3>
                  <div className="flex flex-wrap gap-2">
                    {entitiesOfType.map((entity, index) => (
                      <Badge 
                        key={index}
                        variant="secondary"
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                        onClick={() => handleEntityClick(entity.name)}
                      >
                        {entity.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
              
              {entities.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma entidade encontrada.
                </div>
              )}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="all">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : memories.length > 0 ? (
            <div>
              <h3 className="text-sm font-medium mb-4">
                {memories.length} memórias encontradas
              </h3>
              {memories.map(renderMemoryCard)}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma memória semântica encontrada.
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}