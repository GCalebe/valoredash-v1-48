import React, { useState, useMemo } from 'react';
import { Search, BookOpen, Filter, Grid, List, Eye, Clock, Tag, Globe } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useKnowledgeBase, useKnowledgeBaseCategories, useKnowledgeBaseStats } from '@/hooks/useKnowledgeBase';
import { KnowledgeBaseArticle } from './KnowledgeBaseArticle';
import { KnowledgeBaseSearch } from './KnowledgeBaseSearch';
import { formatDistanceToNow } from 'date-fns';
import { ptBR, es, enUS } from 'date-fns/locale';

interface KnowledgeBaseProps {
  className?: string;
}

const LANGUAGES = {
  pt: { label: 'Português', locale: ptBR, flag: '🇧🇷' },
  en: { label: 'English', locale: enUS, flag: '🇺🇸' },
  es: { label: 'Español', locale: es, flag: '🇪🇸' },
};

const CONTENT_TYPES = {
  tutorial: { label: 'Tutorial', icon: '📚', color: 'bg-blue-100 text-blue-800' },
  guide: { label: 'Guia', icon: '📖', color: 'bg-green-100 text-green-800' },
  faq: { label: 'FAQ', icon: '❓', color: 'bg-yellow-100 text-yellow-800' },
  policy: { label: 'Política', icon: '📋', color: 'bg-purple-100 text-purple-800' },
  article: { label: 'Artigo', icon: '📄', color: 'bg-gray-100 text-gray-800' },
};

export const KnowledgeBase: React.FC<KnowledgeBaseProps> = ({ className }) => {
  const [selectedLanguage, setSelectedLanguage] = useState<keyof typeof LANGUAGES>('pt');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all');
  const [selectedContentType, setSelectedContentType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);

  const filters = useMemo(() => ({
    category: selectedCategory === 'all' ? undefined : selectedCategory,
    subcategory: selectedSubcategory === 'all' ? undefined : selectedSubcategory,
    content_type: selectedContentType === 'all' ? undefined : selectedContentType,
    is_public: true,
    search: searchTerm || undefined,
    language: selectedLanguage,
  }), [selectedCategory, selectedSubcategory, selectedContentType, searchTerm, selectedLanguage]);

  const { data: articles = [], isLoading } = useKnowledgeBase(filters);
  const { data: categories = [] } = useKnowledgeBaseCategories();
  const { data: stats } = useKnowledgeBaseStats();

  const selectedCategoryData = categories.find(cat => cat.category === selectedCategory);

  const handleClearFilters = () => {
    setSelectedCategory('all');
    setSelectedSubcategory('all');
    setSelectedContentType('all');
    setSearchTerm('');
  };

  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), {
      addSuffix: true,
      locale: LANGUAGES[selectedLanguage].locale,
    });
  };

  const getContentTypeInfo = (type: string) => {
    return CONTENT_TYPES[type as keyof typeof CONTENT_TYPES] || CONTENT_TYPES.article;
  };

  if (selectedArticle) {
    return (
      <KnowledgeBaseArticle
        articleId={selectedArticle}
        onBack={() => setSelectedArticle(null)}
        language={selectedLanguage}
      />
    );
  }

  if (showSearch) {
    return (
      <KnowledgeBaseSearch
        onBack={() => setShowSearch(false)}
        language={selectedLanguage}
        onArticleSelect={setSelectedArticle}
      />
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <BookOpen className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {selectedLanguage === 'pt' && 'Base de Conhecimento'}
              {selectedLanguage === 'en' && 'Knowledge Base'}
              {selectedLanguage === 'es' && 'Base de Conocimiento'}
            </h1>
            <p className="text-gray-600">
              {selectedLanguage === 'pt' && 'Encontre respostas e aprenda sobre nossos produtos'}
              {selectedLanguage === 'en' && 'Find answers and learn about our products'}
              {selectedLanguage === 'es' && 'Encuentra respuestas y aprende sobre nuestros productos'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Select value={selectedLanguage} onValueChange={(value: keyof typeof LANGUAGES) => setSelectedLanguage(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(LANGUAGES).map(([key, lang]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center space-x-2">
                    <span>{lang.flag}</span>
                    <span>{lang.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-sm text-gray-600">
                    {selectedLanguage === 'pt' && 'Artigos'}
                    {selectedLanguage === 'en' && 'Articles'}
                    {selectedLanguage === 'es' && 'Artículos'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Tag className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{Object.keys(stats.by_category).length}</p>
                  <p className="text-sm text-gray-600">
                    {selectedLanguage === 'pt' && 'Categorias'}
                    {selectedLanguage === 'en' && 'Categories'}
                    {selectedLanguage === 'es' && 'Categorías'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Eye className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.total_views}</p>
                  <p className="text-sm text-gray-600">
                    {selectedLanguage === 'pt' && 'Visualizações'}
                    {selectedLanguage === 'en' && 'Views'}
                    {selectedLanguage === 'es' && 'Visualizaciones'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Globe className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold">3</p>
                  <p className="text-sm text-gray-600">
                    {selectedLanguage === 'pt' && 'Idiomas'}
                    {selectedLanguage === 'en' && 'Languages'}
                    {selectedLanguage === 'es' && 'Idiomas'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder={
                selectedLanguage === 'pt' ? 'Buscar artigos...' :
                selectedLanguage === 'en' ? 'Search articles...' :
                'Buscar artículos...'
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder={
                selectedLanguage === 'pt' ? 'Categoria' :
                selectedLanguage === 'en' ? 'Category' :
                'Categoría'
              } />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {selectedLanguage === 'pt' && 'Todas'}
                {selectedLanguage === 'en' && 'All'}
                {selectedLanguage === 'es' && 'Todas'}
              </SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.category} value={cat.category}>
                  {cat.category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedCategoryData && selectedCategoryData.subcategories.length > 0 && (
            <Select value={selectedSubcategory} onValueChange={setSelectedSubcategory}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder={
                  selectedLanguage === 'pt' ? 'Subcategoria' :
                  selectedLanguage === 'en' ? 'Subcategory' :
                  'Subcategoría'
                } />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {selectedLanguage === 'pt' && 'Todas'}
                  {selectedLanguage === 'en' && 'All'}
                  {selectedLanguage === 'es' && 'Todas'}
                </SelectItem>
                {selectedCategoryData.subcategories.map((subcat) => (
                  <SelectItem key={subcat} value={subcat}>
                    {subcat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Select value={selectedContentType} onValueChange={setSelectedContentType}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {selectedLanguage === 'pt' && 'Todos'}
                {selectedLanguage === 'en' && 'All'}
                {selectedLanguage === 'es' && 'Todos'}
              </SelectItem>
              {Object.entries(CONTENT_TYPES).map(([key, type]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center space-x-2">
                    <span>{type.icon}</span>
                    <span>{type.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          <Button variant="outline" size="sm" onClick={() => setShowSearch(true)}>
            <Search className="h-4 w-4 mr-2" />
            {selectedLanguage === 'pt' && 'Busca Avançada'}
            {selectedLanguage === 'en' && 'Advanced Search'}
            {selectedLanguage === 'es' && 'Búsqueda Avanzada'}
          </Button>

          {(selectedCategory || selectedSubcategory || selectedContentType || searchTerm) && (
            <Button variant="ghost" size="sm" onClick={handleClearFilters}>
              <Filter className="h-4 w-4 mr-2" />
              {selectedLanguage === 'pt' && 'Limpar'}
              {selectedLanguage === 'en' && 'Clear'}
              {selectedLanguage === 'es' && 'Limpiar'}
            </Button>
          )}
        </div>
      </div>

      {/* Articles */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : articles.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {selectedLanguage === 'pt' && 'Nenhum artigo encontrado'}
              {selectedLanguage === 'en' && 'No articles found'}
              {selectedLanguage === 'es' && 'No se encontraron artículos'}
            </h3>
            <p className="text-gray-600">
              {selectedLanguage === 'pt' && 'Tente ajustar os filtros ou termos de busca'}
              {selectedLanguage === 'en' && 'Try adjusting your filters or search terms'}
              {selectedLanguage === 'es' && 'Intenta ajustar los filtros o términos de búsqueda'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {articles.map((article) => {
            const contentType = getContentTypeInfo(article.content_type);
            
            return (
              <Card
                key={article.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  viewMode === 'list' ? 'flex flex-row' : ''
                }`}
                onClick={() => setSelectedArticle(article.id)}
              >
                <CardHeader className={viewMode === 'list' ? 'flex-1' : ''}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2 line-clamp-2">
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
                      </div>
                    </div>
                  </div>
                  {article.summary && (
                    <CardDescription className="line-clamp-3">
                      {article.summary}
                    </CardDescription>
                  )}
                </CardHeader>
                
                {viewMode === 'grid' && (
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
                        <Clock className="h-4 w-4" />
                        <span>{formatDate(article.created_at!)}</span>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};