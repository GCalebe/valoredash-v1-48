// @ts-nocheck
import React from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";

export interface LocalAgenda {
  id: string;
  title: string;
  description: string;
  category: string;
  host: string[] | string;
  duration: number;
  breakTime: number;
}

interface SupabaseAgendaRef {
  id: string;
  price?: number | null;
  max_participants?: number | null;
}

interface AgendasGridProps {
  agendas: LocalAgenda[];
  supabaseAgendas: SupabaseAgendaRef[];
  onEdit: (agenda: LocalAgenda) => void;
  onDelete: (agendaId: string | number) => void;
}

const AgendasGrid: React.FC<AgendasGridProps> = ({ agendas, supabaseAgendas, onEdit, onDelete }) => {
  const findSupabaseAgenda = (id: string) => supabaseAgendas.find((sa) => sa.id === id);

  return (
    <div className="max-h=[800px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {agendas.map((agenda) => {
          const sa = findSupabaseAgenda(agenda.id);
          const priceText = sa?.price ? `R$ ${sa.price.toFixed(2)}` : '—';
          const maxText = sa?.max_participants && sa.max_participants > 1 ? `${sa.max_participants} pessoas` : '—';
          const hostsInfo = Array.isArray(agenda.host) && agenda.host.length > 0
            ? (agenda.host.length > 1 ? `${agenda.host.length} anfitriões associados` : `1 anfitrião associado`)
            : 'Sem anfitriões associados';

          return (
            <Card key={agenda.id} className="flex flex-col justify-between bg-background border hover:shadow-md transition-shadow duration-200">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1">
                    <CardTitle className="text-xl font-bold text-foreground">{agenda.title}</CardTitle>
                    <CardDescription className="text-base text-muted-foreground mt-1">{hostsInfo}</CardDescription>
                  </div>
                  <Badge variant="secondary" className="text-sm px-3 py-1 font-medium">{agenda.category}</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-base text-muted-foreground leading-relaxed line-clamp-2 h-12">{agenda.description}</p>
                <div className="space-y-2 mt-6">
                  <div className="flex items-center gap-6 text-sm font-medium text-foreground">
                    <span className="flex items-center gap-1.5"><span className="text-muted-foreground">Duração:</span>{agenda.duration} min</span>
                    <span className="flex items-center gap-1.5"><span className="text-muted-foreground">Intervalo:</span>{agenda.breakTime} min</span>
                  </div>
                  <div className="flex items-center gap-6 text-sm font-medium text-foreground">
                    <span className="flex items-center gap-1.5"><span className="text-muted-foreground">Preço:</span>{priceText}</span>
                    <span className="flex items-center gap-1.5"><span className="text-muted-foreground">Máx:</span>{maxText}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-4 flex justify-end gap-2 bg-muted/30 p-3 mt-4">
                <Button variant="destructive" size="icon" className="bg-destructive/10 text-destructive hover:bg-destructive/20 border-0" onClick={() => onDelete(agenda.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button variant="default" className="flex-1 font-semibold" onClick={() => onEdit(agenda)}>
                  <Edit className="h-4 w-4 mr-2" />Editar Agenda
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AgendasGrid;


