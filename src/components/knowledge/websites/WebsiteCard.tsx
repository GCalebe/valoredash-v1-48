import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Globe, Eye, RefreshCw, Trash2, ExternalLink } from 'lucide-react';
import { type Website } from '@/hooks/useWebsiteManager';

export const getStatusBadge = (status: Website['status']) => {
  switch (status) {
    case 'indexed':
      return (
        <Badge variant="default" className="bg-green-100 text-green-800">
          Indexado
        </Badge>
      );
    case 'pending':
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
          Pendente
        </Badge>
      );
    case 'indexing':
      return (
        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          Indexando
        </Badge>
      );
    case 'error':
      return (
        <Badge variant="destructive" className="bg-red-100 text-red-800">
          Erro
        </Badge>
      );
    default:
      return <Badge variant="outline">Desconhecido</Badge>;
  }
};

interface WebsiteCardProps {
  website: Website;
  onPreview: (website: Website) => void;
  onRefresh: (id: string) => void;
  onDelete: (id: string) => void;
  isRefreshing?: boolean;
  isDeleting?: boolean;
}

const WebsiteCard: React.FC<WebsiteCardProps> = ({
  website,
  onPreview,
  onRefresh,
  onDelete,
  isRefreshing,
  isDeleting,
}) => (
  <Card className="hover:shadow-md transition-shadow">
    <CardHeader className="pb-2">
      <div className="flex justify-between items-start">
        <CardTitle className="text-base flex items-center">
          <Globe className="h-4 w-4 mr-2 text-blue-500" />
          <span className="truncate">{website.title || website.url}</span>
        </CardTitle>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={() => onPreview(website)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRefresh(website.id)}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(website.id)}
            className="text-red-500 hover:text-red-600"
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
        {website.description || 'Sem descrição'}
      </p>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          {getStatusBadge(website.status)}
          <Badge variant="outline">{website.category || 'Geral'}</Badge>
        </div>
        <div className="text-xs text-gray-500">
          <div>Páginas: {website.pages_indexed || 0}</div>
          <div>
            Última atualização:{' '}
            {website.last_crawled
              ? new Date(website.last_crawled).toLocaleDateString('pt-BR')
              : 'Nunca'}
          </div>
        </div>
        <a
          href={website.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center text-blue-500 hover:text-blue-600 text-xs"
        >
          <ExternalLink className="h-3 w-3 mr-1" />
          Visitar site
        </a>
      </div>
    </CardContent>
  </Card>
);

export const WebsiteCardSkeleton = () => (
  <Card>
    <CardContent className="p-4">
      <div className="flex items-center justify-between mb-2">
        <Skeleton className="h-5 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
      </div>
      <Skeleton className="h-4 w-full mb-2" />
      <div className="flex gap-2 mb-2">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-20" />
      </div>
      <div className="flex justify-between text-sm">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-32" />
      </div>
    </CardContent>
  </Card>
);

export default WebsiteCard;
