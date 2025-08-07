// @ts-nocheck
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

interface Props {
  searchTerm: string;
  onChangeSearchTerm: (v: string) => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  resultsLimit: string;
  onChangeResultsLimit: (v: string) => void;
  isLoading: boolean;
  isConfigured: boolean;
  onSearch: () => void;
}

const ProspectsSearchForm: React.FC<Props> = ({
  searchTerm,
  onChangeSearchTerm,
  onKeyPress,
  resultsLimit,
  onChangeResultsLimit,
  isLoading,
  isConfigured,
  onSearch,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
      <div className="md:col-span-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Ex: Petshop em Salvador, Dentista em São Paulo..."
            value={searchTerm}
            onChange={(e) => onChangeSearchTerm(e.target.value)}
            onKeyPress={onKeyPress}
            className="pl-10"
          />
        </div>
      </div>
      <div className="md:col-span-3">
        <Select value={resultsLimit} onValueChange={onChangeResultsLimit}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="20">20 resultados</SelectItem>
            <SelectItem value="40">40 resultados</SelectItem>
            <SelectItem value="60">60 resultados</SelectItem>
            <SelectItem value="100">100 resultados</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="md:col-span-3">
        <Button
          onClick={onSearch}
          disabled={isLoading || !isConfigured}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
          ) : (
            <Search className="mr-2 h-4 w-4" />
          )}
          {isLoading ? 'Buscando...' : isConfigured ? 'Buscar' : 'Configure APIs'}
        </Button>
      </div>
    </div>
  );
};

export default ProspectsSearchForm;


