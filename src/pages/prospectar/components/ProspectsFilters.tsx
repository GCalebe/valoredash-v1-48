// @ts-nocheck
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface Props {
  whatsappFilter: string;
  onChangeWhatsapp: (v: string) => void;
  ratingFilter: string;
  onChangeRating: (v: string) => void;
  searchFilter: string;
  onChangeSearchFilter: (v: string) => void;
  onClear: () => void;
}

const ProspectsFilters: React.FC<Props> = ({
  whatsappFilter,
  onChangeWhatsapp,
  ratingFilter,
  onChangeRating,
  searchFilter,
  onChangeSearchFilter,
  onClear,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select value={whatsappFilter} onValueChange={onChangeWhatsapp}>
        <SelectTrigger className="w-auto">
          <SelectValue placeholder="WhatsApp" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="true">Apenas com WhatsApp</SelectItem>
          <SelectItem value="false">Sem WhatsApp</SelectItem>
        </SelectContent>
      </Select>

      <Select value={ratingFilter} onValueChange={onChangeRating}>
        <SelectTrigger className="w-auto">
          <SelectValue placeholder="Avaliação" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as avaliações</SelectItem>
          <SelectItem value="4">4+ estrelas</SelectItem>
          <SelectItem value="3">3+ estrelas</SelectItem>
        </SelectContent>
      </Select>

      <Input
        placeholder="Filtrar por nome..."
        value={searchFilter}
        onChange={(e) => onChangeSearchFilter(e.target.value)}
        className="w-auto min-w-[200px]"
      />

      <Button variant="outline" size="sm" onClick={onClear}>
        <X className="mr-1 h-4 w-4" />
        Limpar
      </Button>
    </div>
  );
};

export default ProspectsFilters;


