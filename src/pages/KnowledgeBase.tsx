// @ts-nocheck
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Grid, List, ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useKnowledgeBase, useKnowledgeBaseCategories, useKnowledgeBaseStats } from '@/hooks/useKnowledgeBase';
import { KnowledgeBaseArticle } from '@/components/knowledge/KnowledgeBaseArticle';
import { KnowledgeBaseSearch } from '@/components/knowledge/KnowledgeBaseSearch';
import KBHeader from './knowledge/components/KBHeader';
import KBStats from './knowledge/components/KBStats';
import { formatDistanceToNow } from 'date-fns';
import { ptBR, es, enUS } from 'date-fns/locale';
import { useAuth } from '@/context/AuthContext';
import { useThemeSettings } from '@/context/ThemeSettingsContext';


const LANGUAGES = {
  'pt-BR': { label: 'Português', locale: ptBR, flag: '🇧🇷' },
  'en-US': { label: 'English', locale: enUS, flag: '🇺🇸' },
  'es-ES': { label: 'Español', locale: es, flag: '🇪🇸' },
};

const CONTENT_TYPES = {
  tutorial: { label: 'Tutorial', icon: '📚', color: 'bg-blue-100 text-blue-800' },
  guide: { label: 'Guia', icon: '📖', color: 'bg-green-100 text-green-800' },
  faq: { label: 'FAQ', icon: '❓', color: 'bg-yellow-100 text-yellow-800' },
  policy: { label: 'Política', icon: '📋', color: 'bg-purple-100 text-purple-800' },
  article: { label: 'Artigo', icon: '📄', color: 'bg-gray-100 text-gray-800' },
};

const KnowledgeBasePage = () => {
  const { user, signOut, isLoading: authLoading } = useAuth();
  const { settings } = useThemeSettings();
  const navigate = useNavigate();
  
  const [selectedLanguage, setSelectedLanguage] = useState<keyof typeof LANGUAGES>('pt-BR');
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

  const { data: articles = [], isLoading, error } = useKnowledgeBase(filters);
  const { data: categories = [] } = useKnowledgeBaseCategories();
  const { data: stats } = useKnowledgeBaseStats();

  const handleClearFilters = () => {
    setSelectedCategory('all');
    setSelectedSubcategory('all');
    setSelectedContentType('all');
    setSearchTerm('');
    setSelectedLanguage('pt-BR');
  };

  const getUniqueSubcategories = () => {
    if (selectedCategory === 'all') return [];
    return categories
      .filter(cat => cat.category === selectedCategory)
      .map(cat => cat.subcategory)
      .filter((sub, index, arr) => sub && arr.indexOf(sub) === index);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div
          className="h-16 w-16 border-4 border-t-transparent rounded-full animate-spin"
          style={{
            borderColor: `${settings.secondaryColor} transparent ${settings.secondaryColor} ${settings.secondaryColor}`,
          }}
        ></div>
      </div>
    );
  }

  if (selectedArticle) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
        <KBHeader
          brandName={settings.brandName}
          logoUrl={settings.logo}
          primaryColor={settings.primaryColor}
          secondaryColor={settings.secondaryColor}
          userDisplayName={user?.user_metadata?.name || user?.email}
          onBack={() => setSelectedArticle(null)}
          onSignOut={signOut}
        />
        <main className="container mx-auto px-4 py-8">
          <KnowledgeBaseArticle articleId={selectedArticle} onBack={() => setSelectedArticle(null)} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      <KBHeader
        brandName={settings.brandName}
        logoUrl={settings.logo}
        primaryColor={settings.primaryColor}
        secondaryColor={settings.secondaryColor}
        userDisplayName={user?.user_metadata?.name || user?.email}
        onBack={() => navigate('/dashboard')}
        onSignOut={signOut}
      />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            Base de Conhecimento
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Explore nossa base de conhecimento com artigos, tutoriais e guias
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <Tabs value="knowledge-base" className="w-full">
            <TabsList className="grid w-full grid-cols-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-t-lg">
              <TabsTrigger value="knowledge-base" className="text-sm">
                Base de Conhecimento
              </TabsTrigger>
            </TabsList>

            <div className="p-6">
              <TabsContent value="knowledge-base" className="mt-0">
                {showSearch ? (
                  <KnowledgeBaseSearch
                    onClose={() => setShowSearch(false)}
                    onSelectArticle={setSelectedArticle}
                  />
                ) : (
                  <div className="space-y-6">
                    <KBStats stats={stats} />

                    {/* Filters and Search */}
                    <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                      <div className="flex flex-wrap gap-3 items-center">
                        {/* Language Filter */}
                        <Select value={selectedLanguage} onValueChange={(value: keyof typeof LANGUAGES) => setSelectedLanguage(value)}>
                          <SelectTrigger className="w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(LANGUAGES).map(([key, lang]) => (
                              <SelectItem key={key} value={key}>
                                <span className="flex items-center gap-2">
                                  <span>{lang.flag}</span>
                                  <span>{lang.label}</span>
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {/* Category Filter */}
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                          <SelectTrigger className="w-[160px]">
                            <SelectValue placeholder="Categoria" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todas</SelectItem>
                            {categories.map((cat) => (
                              <SelectItem key={cat.category} value={cat.category}>
                                {cat.category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {/* Subcategory Filter */}
                        {selectedCategory !== 'all' && (
                          <Select value={selectedSubcategory} onValueChange={setSelectedSubcategory}>
                            <SelectTrigger className="w-[160px]">
                              <SelectValue placeholder="Subcategoria" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Todas</SelectItem>
                              {getUniqueSubcategories().map((sub) => (
                                <SelectItem key={sub} value={sub}>
                                  {sub}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}

                        {/* Content Type Filter */}
                        <Select value={selectedContentType} onValueChange={setSelectedContentType}>
                          <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            {Object.entries(CONTENT_TYPES).map(([key, type]) => (
                              <SelectItem key={key} value={key}>
                                <span className="flex items-center gap-2">
                                  <span>{type.icon}</span>
                                  <span>{type.label}</span>
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex gap-2 items-center">
                        <Button
                          variant="outline"
                          onClick={() => setShowSearch(true)}
                          className="flex items-center gap-2"
                        >
                          <Search className="h-4 w-4" />
                          Busca Avançada
                        </Button>
                        <Button
                          variant="outline"
                          onClick={handleClearFilters}
                          className="flex items-center gap-2"
                        >
                          <Filter className="h-4 w-4" />
                          Limpar
                        </Button>
                        <div className="flex border rounded-md">
                          <Button
                            variant={viewMode === 'grid' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('grid')}
                            className="rounded-r-none"
                          >
                            <Grid className="h-4 w-4" />
                          </Button>
                          <Button
                            variant={viewMode === 'list' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('list')}
                            className="rounded-l-none"
                          >
                            <List className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Search Input */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Pesquisar artigos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    {/* Articles */}
                    {isLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    ) : error ? (
                      <div className="text-center py-12">
                        <p className="text-red-600 dark:text-red-400">Erro no carregamento dos dados</p>
                      </div>
                    ) : articles.length === 0 ? (
                      <div className="text-center py-12">
                        <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">Nenhum artigo encontrado</p>
                      </div>
                    ) : (
                      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                        {articles.map((article) => (
                          <Card
                            key={article.id}
                            className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
                            onClick={() => setSelectedArticle(article.id)}
                          >
                            <CardHeader className="pb-3">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <CardTitle className="text-lg font-semibold line-clamp-2 mb-2">
                                    {article.title}
                                  </CardTitle>
                                  <div className="flex items-center gap-2 mb-2">
                                    {article.content_type && CONTENT_TYPES[article.content_type as keyof typeof CONTENT_TYPES] && (
                                      <Badge className={CONTENT_TYPES[article.content_type as keyof typeof CONTENT_TYPES].color}>
                                        <span className="mr-1">
                                          {CONTENT_TYPES[article.content_type as keyof typeof CONTENT_TYPES].icon}
                                        </span>
                                        {CONTENT_TYPES[article.content_type as keyof typeof CONTENT_TYPES].label}
                                      </Badge>
                                    )}
                                    {article.language && LANGUAGES[article.language as keyof typeof LANGUAGES] && (
                                      <Badge variant="outline">
                                        <span className="mr-1">
                                          {LANGUAGES[article.language as keyof typeof LANGUAGES].flag}
                                        </span>
                                        {LANGUAGES[article.language as keyof typeof LANGUAGES].label}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                              {article.summary && (
                                <CardDescription className="line-clamp-3 mb-3">
                                  {article.summary}
                                </CardDescription>
                              )}
                              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                                <div className="flex items-center gap-4">
                                  {article.view_count !== undefined && (
                                    <div className="flex items-center gap-1">
                                      <Eye className="h-3 w-3" />
                                      <span>{article.view_count}</span>
                                    </div>
                                  )}
                                  {article.estimated_read_time && (
                                    <div className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      <span>{article.estimated_read_time} min</span>
                                    </div>
                                  )}
                                </div>
                                {article.created_at && (
                                  <span>
                                    {formatDistanceToNow(new Date(article.created_at), {
                                      addSuffix: true,
                                      locale: LANGUAGES[selectedLanguage].locale,
                                    })}
                                  </span>
                                )}
                              </div>
                              {article.tags && article.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-3">
                                  {article.tags.slice(0, 3).map((tag, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                      <Tag className="h-2 w-2 mr-1" />
                                      {tag}
                                    </Badge>
                                  ))}
                                  {article.tags.length > 3 && (
                                    <Badge variant="secondary" className="text-xs">
                                      +{article.tags.length - 3}
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default KnowledgeBasePage;