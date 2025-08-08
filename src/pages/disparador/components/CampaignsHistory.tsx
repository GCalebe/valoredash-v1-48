import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, MessageSquare } from "lucide-react";
import { Campaign } from "../types";

const CampaignsHistory: React.FC<{ campaigns: Campaign[] }> = ({ campaigns }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Histórico de Campanhas
        </CardTitle>
      </CardHeader>
      <CardContent>
        {campaigns.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma campanha enviada ainda</p>
          </div>
        ) : (
          <div className="space-y-4">
            {campaigns.map((campaign) => {
              let badgeVariant: any = 'outline';
              let badgeText = 'Pendente';
              if (campaign.status === 'completed') {
                badgeVariant = 'default';
                badgeText = 'Concluída';
              } else if (campaign.status === 'sending') {
                badgeVariant = 'secondary';
                badgeText = 'Enviando';
              } else if (campaign.status === 'failed') {
                badgeVariant = 'destructive';
                badgeText = 'Falhou';
              }
              const showProgress = campaign.status === 'sending';
              const pct = Math.min(100, Math.round((campaign.sent / Math.max(campaign.total, 1)) * 100));
              return (
                <Card key={campaign.id} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{campaign.name}</h4>
                    <Badge variant={badgeVariant}>{badgeText}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {campaign.message.substring(0, 100)}...
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span>Progresso: {campaign.sent}/{campaign.total}</span>
                    <span>{campaign.createdAt.toLocaleString()}</span>
                  </div>
                  {showProgress && (
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CampaignsHistory;


