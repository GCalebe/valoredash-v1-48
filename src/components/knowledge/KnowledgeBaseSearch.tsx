import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Filter, Calendar, Tag, BookOpen, Eye, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useKnowledgeBase, useKnowledgeBaseCategories } from '@/hooks/useKnowledgeBase';
import { formatDistanceToNow } from 'date-fns';
import { ptBR, es, enUS } from 'date-fns/locale';
import { useDebounce } from '@/hooks/utils/useDebounce';
import KBSidebar from './components/KBSidebar';
import KBResultsSort from './components/KBResultsSort';

interface KnowledgeBaseSearchProps {
  onBack: () => void;
  language: 'pt' | 'en' | 'es';
  onArticleSelect: (articleId: string) => void;
}

const LANGUAGES = {
  pt: { label: 'Português', locale: ptBR },
  en: { label: 'English', locale: enUS },
  es: { label: 'Español', locale: es },
};

const CONTENT_TYPES = {
  tutorial: { label: 'Tutorial', icon: '📚', color: 'bg-blue-100 text-blue-800' },
  guide: { label: 'Guia', icon: '📖', color: 'bg-green-100 text-green-800' },
  faq: { label: 'FAQ', icon: '❓', color: 'bg-yellow-100 text-yellow-800' },
  policy: { label: 'Política', icon: '📋', color: 'bg-purple-100 text-purple-800' },
  article: { label: 'Artigo', icon: '📄', color: 'bg-gray-100 text-gray-800' },
};

const DIFFICULTY_LEVELS = ['Iniciante', 'Intermediário', 'Avançado', 'Beginner', 'Intermediate', 'Advanced', 'Principiante', 'Intermedio', 'Avanzado'];

export const KnowledgeBaseSearch: React.FC<KnowledgeBaseSearchProps> = ({
  onBack,
  language,
  onArticleSelect,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedContentTypes, setSelectedContentTypes] = useState<string[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [sortBy, setSortBy] = useState<'relevance' | 'date' | 'views' | 'title'>('relevance');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const { data: categories = [] } = useKnowledgeBaseCategories();
  
  const filters = {
    search: debouncedSearchTerm || undefined,
    is_public: true,
    language,
  };

  const { data: articles = [], isLoading } = useKnowledgeBase(filters);

  // Filtrar e ordenar artigos localmente para busca avançada
  const filteredAndSortedArticles = React.useMemo(() => {
    let filtered = articles;

    // Filtrar por categorias selecionadas
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(article => 
        selectedCategories.includes(article.category)
      );
    }

    // Filtrar por tipos de conteúdo selecionados
    if (selectedContentTypes.length > 0) {
      filtered = filtered.filter(article => 
        selectedContentTypes.includes(article.content_type)
      );
    }

    // Filtrar por dificuldade
    if (selectedDifficulty) {
      filtered = filtered.filter(article => 
        article.difficulty_level === selectedDifficulty
      );
    }

    // Ordenar
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.created_at!).getTime() - new Date(b.created_at!).getTime();
          break;
        case 'views':
          comparison = (a.view_count || 0) - (b.view_count || 0);
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'relevance':
        default:
          // Para relevância, usar uma combinação de visualizações e data
          const scoreA = (a.view_count || 0) * 0.7 + (new Date(a.created_at!).getTime() / 1000000000) * 0.3;
          const scoreB = (b.view_count || 0) * 0.7 + (new Date(b.created_at!).getTime() / 1000000000) * 0.3;
          comparison = scoreA - scoreB;
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [articles, selectedCategories, selectedContentTypes, selectedDifficulty, sortBy, sortOrder]);

  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), {
      addSuffix: true,
      locale: LANGUAGES[language].locale,
    });
  };

  const getContentTypeInfo = (type: string) => {
    return CONTENT_TYPES[type as keyof typeof CONTENT_TYPES] || CONTENT_TYPES.article;
  };

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleContentTypeToggle = (type: string) => {
    setSelectedContentTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedContentTypes([]);
    setSelectedDifficulty('');
    setSearchTerm('');
  };

  const hasActiveFilters = selectedCategories.length > 0 || selectedContentTypes.length > 0 || !!selectedDifficulty || !!searchTerm;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {language === 'pt' && 'Voltar'}
            {language === 'en' && 'Back'}
            {language === 'es' && 'Volver'}
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {language === 'pt' && 'Busca Avançada'}
              {language === 'en' && 'Advanced Search'}
              {language === 'es' && 'Búsqueda Avanzada'}
            </h1>
            <p className="text-gray-600">
              {language === 'pt' && 'Use filtros para encontrar exatamente o que precisa'}
              {language === 'en' && 'Use filters to find exactly what you need'}
              {language === 'es' && 'Usa filtros para encontrar exactamente lo que necesitas'}
            </p>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          onClick={() => setShowFilters(!showFilters)}
          className={hasActiveFilters ? 'border-primary text-primary' : ''}
        >
          <Filter className="h-4 w-4 mr-2" />
          {language === 'pt' && 'Filtros'}
          {language === 'en' && 'Filters'}
          {language === 'es' && 'Filtros'}
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-2">
              {selectedCategories.length + selectedContentTypes.length + (selectedDifficulty ? 1 : 0) + (searchTerm ? 1 : 0)}
            </Badge>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className={`lg:col-span-1 space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
          <KBSidebar
            language={language}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            categories={categories}
            selectedCategories={selectedCategories}
            onToggleCategory={handleCategoryToggle}
            selectedContentTypes={selectedContentTypes}
            onToggleContentType={handleContentTypeToggle}
            contentTypes={CONTENT_TYPES}
            selectedDifficulty={selectedDifficulty}
            setSelectedDifficulty={setSelectedDifficulty}
            difficultyLevels={DIFFICULTY_LEVELS}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={clearFilters}
          />
        </div>

        {/* Results */}
        <div className="lg:col-span-3 space-y-4">
          {/* Sort Controls */}
          <KBResultsSort
            language={language}
            sortBy={sortBy}
            setSortBy={setSortBy}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            resultsCount={filteredAndSortedArticles.length}
          />

          {/* Results List */}
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredAndSortedArticles.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {language === 'pt' && 'Nenhum resultado encontrado'}
                  {language === 'en' && 'No results found'}
                  {language === 'es' && 'No se encontraron resultados'}
                </h3>
                <p className="text-gray-600">
                  {language === 'pt' && 'Tente ajustar seus filtros ou termos de busca'}
                  {language === 'en' && 'Try adjusting your filters or search terms'}
                  {language === 'es' && 'Intenta ajustar tus filtros o términos de búsqueda'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredAndSortedArticles.map((article) => {
                const contentType = getContentTypeInfo(article.content_type);
                
                return (
                  <Card
                    key={article.id}
                    className="cursor-pointer transition-all hover:shadow-lg"
                    onClick={() => onArticleSelect(article.id)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-2 line-clamp-2">
                            {article.title}
                          </CardTitle>
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge className={contentType.color}>
                              <span className="mr-1">{contentType.icon}</span>
                              {contentType.label}
                            </Badge>
                            <Badge variant="outline">
                              {article.category}
                            </Badge>
                            {article.subcategory && (
                              <Badge variant="secondary">
                                {article.subcategory}
                              </Badge>
                            )}
                            {article.difficulty_level && (
                              <Badge variant="outline">
                                {article.difficulty_level}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      {article.summary && (
                        <CardDescription className="line-clamp-3">
                          {article.summary}
                        </CardDescription>
                      )}
                    </CardHeader>
                    
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-4">
                          {article.view_count && (
                            <div className="flex items-center space-x-1">
                              <Eye className="h-4 w-4" />
                              <span>{article.view_count}</span>
                            </div>
                          )}
                          {article.estimated_read_time && (
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>{article.estimated_read_time} min</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(article.created_at!)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};