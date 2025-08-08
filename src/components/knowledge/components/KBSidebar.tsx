// @ts-nocheck
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

interface CategoryItem { category: string; subcategory?: string | null }

interface KBSidebarProps {
  language: 'pt' | 'en' | 'es';
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  categories: CategoryItem[];
  selectedCategories: string[];
  onToggleCategory: (category: string) => void;
  selectedContentTypes: string[];
  onToggleContentType: (type: string) => void;
  contentTypes: Record<string, { label: string; icon: string; color: string }>;
  selectedDifficulty: string;
  setSelectedDifficulty: (val: string) => void;
  difficultyLevels: string[];
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

const KBSidebar: React.FC<KBSidebarProps> = ({
  language,
  searchTerm,
  setSearchTerm,
  categories,
  selectedCategories,
  onToggleCategory,
  selectedContentTypes,
  onToggleContentType,
  contentTypes,
  selectedDifficulty,
  setSelectedDifficulty,
  difficultyLevels,
  hasActiveFilters,
  onClearFilters,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Search className="h-5 w-5 mr-2" />
          {language === 'pt' && 'Buscar'}
          {language === 'en' && 'Search'}
          {language === 'es' && 'Buscar'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="search">
            {language === 'pt' && 'Termo de busca'}
            {language === 'en' && 'Search term'}
            {language === 'es' && 'Término de búsqueda'}
          </Label>
          <Input
            id="search"
            placeholder={
              language === 'pt' ? 'Digite sua busca...' :
              language === 'en' ? 'Type your search...' :
              'Escribe tu búsqueda...'
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mt-1"
          />
        </div>

        <Separator />

        <div>
          <Label className="text-sm font-medium">
            {language === 'pt' && 'Categorias'}
            {language === 'en' && 'Categories'}
            {language === 'es' && 'Categorías'}
          </Label>
          <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
            {categories.map((cat) => (
              <div key={cat.category} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${cat.category}`}
                  checked={selectedCategories.includes(cat.category)}
                  onCheckedChange={() => onToggleCategory(cat.category)}
                />
                <Label htmlFor={`category-${cat.category}`} className="text-sm cursor-pointer">
                  {cat.category}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        <div>
          <Label className="text-sm font-medium">
            {language === 'pt' && 'Tipos de Conteúdo'}
            {language === 'en' && 'Content Types'}
            {language === 'es' && 'Tipos de Contenido'}
          </Label>
          <div className="mt-2 space-y-2">
            {Object.entries(contentTypes).map(([key, type]) => (
              <div key={key} className="flex items-center space-x-2">
                <Checkbox
                  id={`type-${key}`}
                  checked={selectedContentTypes.includes(key)}
                  onCheckedChange={() => onToggleContentType(key)}
                />
                <Label htmlFor={`type-${key}`} className="text-sm cursor-pointer flex items-center">
                  <span className="mr-1">{type.icon}</span>
                  {type.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        <div>
          <Label className="text-sm font-medium">
            {language === 'pt' && 'Nível de Dificuldade'}
            {language === 'en' && 'Difficulty Level'}
            {language === 'es' && 'Nivel de Dificultad'}
          </Label>
          <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder={
                language === 'pt' ? 'Selecionar nível' :
                language === 'en' ? 'Select level' :
                'Seleccionar nivel'
              } />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">
                {language === 'pt' && 'Todos os níveis'}
                {language === 'en' && 'All levels'}
                {language === 'es' && 'Todos los niveles'}
              </SelectItem>
              {difficultyLevels.map((level) => (
                <SelectItem key={level} value={level}>
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {hasActiveFilters && (
          <Button variant="outline" size="sm" onClick={onClearFilters} className="w-full">
            {language === 'pt' && 'Limpar Filtros'}
            {language === 'en' && 'Clear Filters'}
            {language === 'es' && 'Limpiar Filtros'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default KBSidebar;


