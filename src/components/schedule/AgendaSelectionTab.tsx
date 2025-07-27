import React from 'react';
import { useAgendas } from '@/hooks/useAgendas';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Users, DollarSign, Calendar } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface AgendaSelectionTabProps {
  onAgendaSelect: (agendaId: string, agendaName: string) => void;
  selectedAgendaId?: string;
}

export function AgendaSelectionTab({ onAgendaSelect, selectedAgendaId }: AgendaSelectionTabProps) {
  const { agendas, agendasLoading } = useAgendas();

  const getCategoryColor = (category: string | null) => {
    switch (category?.toLowerCase()) {
      case 'consulta':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'evento':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'classes':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'recorrente':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatPrice = (price: number | null) => {
    if (!price) return 'Gratuito';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  if (agendasLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-foreground">Selecione a Agenda</h2>
          <p className="text-muted-foreground">Escolha qual agendamento deseja criar</p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="flex flex-col">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                <Skeleton className="h-12 w-full" />
                <div className="flex items-center gap-6">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </CardContent>
              <CardFooter className="pt-4">
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (agendas.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-foreground">Selecione sua Agenda</h2>
          <p className="text-muted-foreground">Escolha em qual agenda deseja continuar</p>
        </div>
        
        <div className="border-2 border-dashed border-muted rounded-xl p-12 text-center bg-background">
          <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Nenhuma agenda disponível</p>
          <p className="text-base text-muted-foreground mt-2">
            Configure tipos de agenda no Gerenciador de Conhecimento primeiro.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Selecione sua Agenda</h2>
        <p className="text-muted-foreground">Escolha em qual agenda deseja continuar</p>
      </div>
      
      <div className="max-h-[700px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {agendas.map((agenda) => (
          <Card 
            key={agenda.id} 
            className={`flex flex-col justify-between bg-background border hover:shadow-md transition-all duration-200 cursor-pointer ${
              selectedAgendaId === agenda.id 
                ? 'ring-2 ring-primary border-primary shadow-md' 
                : 'hover:border-primary/50'
            }`}
            onClick={() => onAgendaSelect(agenda.id, agenda.name)}
          >
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1">
                  <CardTitle className="text-xl font-bold text-foreground line-clamp-2">
                    {agenda.name}
                  </CardTitle>
                  {agenda.category && (
                    <CardDescription className="text-base text-muted-foreground mt-1">
                      {agenda.category.charAt(0).toUpperCase() + agenda.category.slice(1)}
                    </CardDescription>
                  )}
                </div>
                {agenda.category && (
                  <Badge 
                    variant="secondary" 
                    className={`text-sm px-3 py-1 font-medium ${getCategoryColor(agenda.category)}`}
                  >
                    {agenda.category}
                  </Badge>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="pt-0 flex-1">
              {agenda.description && (
                <p className="text-base text-muted-foreground leading-relaxed line-clamp-3 mb-4">
                  {agenda.description}
                </p>
              )}
              
              <div className="space-y-3">
                <div className="flex items-center gap-6 text-sm font-medium text-foreground">
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Duração:</span>
                    {agenda.duration_minutes || 0} min
                  </span>
                  
                  <span className="flex items-center gap-1.5">
                    <span className="text-muted-foreground">Intervalo:</span>
                    {agenda.buffer_time_minutes ? `${agenda.buffer_time_minutes} min` : '—'}
                  </span>
                </div>
                
                <div className="flex items-center gap-6 text-sm font-medium text-foreground">
                  <span className="flex items-center gap-1.5">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Preço:</span>
                    {formatPrice(agenda.price)}
                  </span>
                  
                  <span className="flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Máx:</span>
                    {agenda.max_participants && agenda.max_participants > 1 ? `${agenda.max_participants} pessoas` : '—'}
                  </span>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="pt-4">
              <Button 
                variant={selectedAgendaId === agenda.id ? "default" : "outline"}
                className="w-full font-semibold"
                onClick={(e) => {
                  e.stopPropagation();
                  onAgendaSelect(agenda.id, agenda.name);
                }}
              >
                {selectedAgendaId === agenda.id ? 'Selecionado' : 'Selecionar'}
              </Button>
            </CardFooter>
          </Card>
        ))}
        </div>
      </div>
      
    </div>
  );
}