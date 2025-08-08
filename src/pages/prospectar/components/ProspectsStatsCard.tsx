import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

export interface ProspectsStats {
  whatsappCount: number;
  noWhatsappCount: number;
  avgRating: number;
  verifiedCount: number;
}

const ProspectsStatsCard: React.FC<{ stats: ProspectsStats }> = ({ stats }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <BarChart3 className="h-5 w-5" />
        Estatísticas da Página
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{stats.whatsappCount}</div>
          <div className="text-xs text-muted-foreground">Com WhatsApp</div>
        </div>
        <div className="text-center p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
          <div className="text-2xl font-bold text-red-600">{stats.noWhatsappCount}</div>
          <div className="text-xs text-muted-foreground">Sem WhatsApp</div>
        </div>
        <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">{stats.avgRating}</div>
          <div className="text-xs text-muted-foreground">Rating Médio</div>
        </div>
        <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{stats.verifiedCount}</div>
          <div className="text-xs text-muted-foreground">Verificados</div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default ProspectsStatsCard;


