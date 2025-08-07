// @ts-nocheck
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, CheckSquare, Square } from 'lucide-react';

interface Prospect {
  id: string;
  name: string;
  endereco: string;
  telefone?: string;
  email?: string;
  rating?: number;
  reviews?: number;
  website?: string;
  hasWhatsApp: boolean;
  verified?: boolean;
}

interface Props {
  prospect: Prospect;
  selected: boolean;
  onToggle: (id: string) => void;
}

const ProspectCard: React.FC<Props> = ({ prospect, selected, onToggle }) => {
  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${selected ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950/20' : ''}`}
      onClick={() => onToggle(prospect.id)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-semibold">{prospect.name}</h4>
              {prospect.hasWhatsApp && (
                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">WhatsApp</Badge>
              )}
              {prospect.verified && <Badge variant="secondary">Verificado</Badge>}
            </div>
            <p className="text-sm text-muted-foreground mb-1">
              <MapPin className="inline h-3 w-3 mr-1" />
              {prospect.endereco}
            </p>
            {prospect.telefone && <p className="text-sm text-muted-foreground mb-1">📞 {prospect.telefone}</p>}
            {prospect.email && <p className="text-sm text-muted-foreground mb-1">✉️ {prospect.email}</p>}
            <div className="flex items-center gap-4 mt-2">
              {prospect.rating && (
                <div className="flex items-center gap-1">
                  <span className="text-yellow-500">⭐</span>
                  <span className="text-sm font-medium">{prospect.rating}</span>
                  {prospect.reviews && <span className="text-xs text-muted-foreground">({prospect.reviews} avaliações)</span>}
                </div>
              )}
              {prospect.website && (
                <a href={prospect.website} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline" onClick={(e) => e.stopPropagation()}>
                  🌐 Website
                </a>
              )}
            </div>
          </div>
          <div className="ml-4">{selected ? <CheckSquare className="h-5 w-5 text-blue-600" /> : <Square className="h-5 w-5 text-muted-foreground" />}</div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProspectCard;


