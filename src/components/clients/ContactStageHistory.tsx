import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, ArrowRight } from "lucide-react";
import { useContactStageHistory } from "@/hooks/useContactStageHistory";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ContactStageHistoryProps {
  contactId: string;
}

const ContactStageHistory = ({ contactId }: ContactStageHistoryProps) => {
  const { data: history, isLoading, error } = useContactStageHistory(contactId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Histórico de Estágios
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-6 w-20" />
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-4 w-24 ml-auto" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Histórico de Estágios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Erro ao carregar histórico de estágios.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!history || history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Histórico de Estágios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Nenhuma mudança de estágio registrada ainda.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Histórico de Estágios
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {history.map((entry, index) => (
          <div
            key={entry.id}
            className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border"
          >
            <div className="flex items-center gap-2 flex-1">
              {entry.old_stage ? (
                <>
                  <Badge variant="outline" className="text-xs">
                    {entry.old_stage}
                  </Badge>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </>
              ) : (
                <span className="text-xs text-muted-foreground">Criado em:</span>
              )}
              <Badge variant="default" className="text-xs">
                {entry.new_stage}
              </Badge>
            </div>
            
            <div className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(entry.changed_at), {
                addSuffix: true,
                locale: ptBR,
              })}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default ContactStageHistory;