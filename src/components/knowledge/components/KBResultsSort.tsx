// @ts-nocheck
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface KBResultsSortProps {
  language: 'pt' | 'en' | 'es';
  sortBy: 'relevance' | 'date' | 'views' | 'title';
  setSortBy: (v: 'relevance' | 'date' | 'views' | 'title') => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (v: 'asc' | 'desc') => void;
  resultsCount: number;
}

const KBResultsSort: React.FC<KBResultsSortProps> = ({ language, sortBy, setSortBy, sortOrder, setSortOrder, resultsCount }) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <span className="text-sm text-gray-600">
          {resultsCount}
          {language === 'pt' && ' resultados'}
          {language === 'en' && ' results'}
          {language === 'es' && ' resultados'}
        </span>
      </div>
      <div className="flex items-center space-x-2">
        <Label className="text-sm">
          {language === 'pt' && 'Ordenar por:'}
          {language === 'en' && 'Sort by:'}
          {language === 'es' && 'Ordenar por:'}
        </Label>
        <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="relevance">
              {language === 'pt' && 'Relevância'}
              {language === 'en' && 'Relevance'}
              {language === 'es' && 'Relevancia'}
            </SelectItem>
            <SelectItem value="date">
              {language === 'pt' && 'Data'}
              {language === 'en' && 'Date'}
              {language === 'es' && 'Fecha'}
            </SelectItem>
            <SelectItem value="views">
              {language === 'pt' && 'Visualizações'}
              {language === 'en' && 'Views'}
              {language === 'es' && 'Visualizaciones'}
            </SelectItem>
            <SelectItem value="title">
              {language === 'pt' && 'Título'}
              {language === 'en' && 'Title'}
              {language === 'es' && 'Título'}
            </SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortOrder} onValueChange={(value: any) => setSortOrder(value)}>
          <SelectTrigger className="w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">
              {language === 'pt' && 'Desc'}
              {language === 'en' && 'Desc'}
              {language === 'es' && 'Desc'}
            </SelectItem>
            <SelectItem value="asc">
              {language === 'pt' && 'Asc'}
              {language === 'en' && 'Asc'}
              {language === 'es' && 'Asc'}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default KBResultsSort;


