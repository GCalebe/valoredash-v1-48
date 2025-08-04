import React, { useEffect } from 'react';
import { ArrowLeft, Eye, Clock, Calendar, User, Tag, Share2, BookOpen, ThumbsUp, ThumbsDown, Printer } from 'lucide-react';
import DOMPurify from 'dompurify';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useKnowledgeBaseItem, useUpdateKnowledgeBaseViews } from '@/hooks/useKnowledgeBase';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR, es, enUS } from 'date-fns/locale';
import { toast } from 'sonner';

interface KnowledgeBaseArticleProps {
  articleId: string;
  onBack: () => void;
  language: 'pt' | 'en' | 'es';
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

export const KnowledgeBaseArticle: React.FC<KnowledgeBaseArticleProps> = ({
  articleId,
  onBack,
  language,
}) => {
  const { data: article, isLoading, error } = useKnowledgeBaseItem(articleId);
  const updateViews = useUpdateKnowledgeBaseViews();

  useEffect(() => {
    if (article) {
      // Incrementar visualizações após 3 segundos (tempo suficiente para considerar uma leitura)
      const timer = setTimeout(() => {
        updateViews.mutate(articleId);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [article, articleId, updateViews]);

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'PPP', {
      locale: LANGUAGES[language].locale,
    });
  };

  const formatRelativeDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), {
      addSuffix: true,
      locale: LANGUAGES[language].locale,
    });
  };

  const getContentTypeInfo = (type: string) => {
    return CONTENT_TYPES[type as keyof typeof CONTENT_TYPES] || CONTENT_TYPES.article;
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article?.title,
          text: article?.summary || '',
          url: window.location.href,
        });
      } catch (error) {
        console.error('Erro ao compartilhar:', error);
      }
    } else {
      // Fallback: copiar URL para clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success(
          language === 'pt' ? 'Link copiado para a área de transferência!' :
          language === 'en' ? 'Link copied to clipboard!' :
          '¡Enlace copiado al portapapeles!'
        );
      } catch (error) {
        console.error('Erro ao copiar link:', error);
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {language === 'pt' && 'Voltar'}
            {language === 'en' && 'Back'}
            {language === 'es' && 'Volver'}
          </Button>
        </div>
        
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="flex space-x-2 mb-4">
              <div className="h-6 bg-gray-200 rounded w-20"></div>
              <div className="h-6 bg-gray-200 rounded w-24"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {language === 'pt' && 'Voltar'}
            {language === 'en' && 'Back'}
            {language === 'es' && 'Volver'}
          </Button>
        </div>
        
        <Card>
          <CardContent className="p-8 text-center">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {language === 'pt' && 'Artigo não encontrado'}
              {language === 'en' && 'Article not found'}
              {language === 'es' && 'Artículo no encontrado'}
            </h3>
            <p className="text-gray-600">
              {language === 'pt' && 'O artigo que você está procurando não existe ou foi removido.'}
              {language === 'en' && 'The article you are looking for does not exist or has been removed.'}
              {language === 'es' && 'El artículo que buscas no existe o ha sido eliminado.'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const contentType = getContentTypeInfo(article.content_type);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {language === 'pt' && 'Voltar'}
          {language === 'en' && 'Back'}
          {language === 'es' && 'Volver'}
        </Button>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-2" />
            {language === 'pt' && 'Compartilhar'}
            {language === 'en' && 'Share'}
            {language === 'es' && 'Compartir'}
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            {language === 'pt' && 'Imprimir'}
            {language === 'en' && 'Print'}
            {language === 'es' && 'Imprimir'}
          </Button>
        </div>
      </div>

      {/* Article */}
      <Card>
        <CardHeader>
          <div className="space-y-4">
            {/* Title */}
            <CardTitle className="text-3xl font-bold leading-tight">
              {article.title}
            </CardTitle>

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
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
                  {language === 'pt' && 'Nível: '}
                  {language === 'en' && 'Level: '}
                  {language === 'es' && 'Nivel: '}
                  {article.difficulty_level}
                </Badge>
              )}
            </div>

            {/* Summary */}
            {article.summary && (
              <p className="text-lg text-gray-600 leading-relaxed">
                {article.summary}
              </p>
            )}

            {/* Meta information */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
              {article.created_at && (
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(article.created_at)}</span>
                </div>
              )}
              
              {article.updated_at && article.updated_at !== article.created_at && (
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>
                    {language === 'pt' && 'Atualizado '}
                    {language === 'en' && 'Updated '}
                    {language === 'es' && 'Actualizado '}
                    {formatRelativeDate(article.updated_at)}
                  </span>
                </div>
              )}
              
              {article.view_count && (
                <div className="flex items-center space-x-1">
                  <Eye className="h-4 w-4" />
                  <span>
                    {article.view_count} 
                    {language === 'pt' && ' visualizações'}
                    {language === 'en' && ' views'}
                    {language === 'es' && ' visualizaciones'}
                  </span>
                </div>
              )}
              
              {article.estimated_read_time && (
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>
                    {article.estimated_read_time} 
                    {language === 'pt' && ' min de leitura'}
                    {language === 'en' && ' min read'}
                    {language === 'es' && ' min de lectura'}
                  </span>
                </div>
              )}
            </div>

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <Tag className="h-4 w-4 text-gray-400" />
                {article.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardHeader>

        <Separator />

        <CardContent className="pt-6">
          {/* Content */}
          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ 
              __html: DOMPurify.sanitize(article.content, {
                ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre', 'a', 'img'],
                ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'target', 'rel']
              })
            }}
          />

          {/* Source URL */}
          {article.source_url && (
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">
                {language === 'pt' && 'Fonte:'}
                {language === 'en' && 'Source:'}
                {language === 'es' && 'Fuente:'}
              </p>
              <a 
                href={article.source_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline break-all"
              >
                {article.source_url}
              </a>
            </div>
          )}

          {/* Rating */}
          <div className="mt-8 pt-6 border-t">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-medium mb-2">
                  {language === 'pt' && 'Este artigo foi útil?'}
                  {language === 'en' && 'Was this article helpful?'}
                  {language === 'es' && '¿Te resultó útil este artículo?'}
                </h4>
                {article.average_rating && article.total_ratings && (
                  <p className="text-sm text-gray-600">
                    {language === 'pt' && `Avaliação média: ${article.average_rating.toFixed(1)} (${article.total_ratings} avaliações)`}
                    {language === 'en' && `Average rating: ${article.average_rating.toFixed(1)} (${article.total_ratings} ratings)`}
                    {language === 'es' && `Calificación promedio: ${article.average_rating.toFixed(1)} (${article.total_ratings} calificaciones)`}
                  </p>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <ThumbsUp className="h-4 w-4 mr-2" />
                  {article.like_count || 0}
                </Button>
                <Button variant="outline" size="sm">
                  <ThumbsDown className="h-4 w-4 mr-2" />
                  {article.dislike_count || 0}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};