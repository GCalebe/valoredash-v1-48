import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search, Globe } from 'lucide-react';
import WebsiteCard, { WebsiteCardSkeleton } from '@/components/knowledge/websites/WebsiteCard';
import AddWebsiteDialog from '@/components/knowledge/websites/AddWebsiteDialog';
import WebsitePreviewDialog from '@/components/knowledge/websites/WebsitePreviewDialog';
import { useWebsiteManager, Website } from '@/hooks/useWebsiteManager';

const WebsitesTab = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewWebsite, setPreviewWebsite] = useState<Website | null>(null);

  const {
    websites,
    isLoading,
    error,
    addWebsite,
    refreshWebsite,
    deleteWebsite,
    createWebsiteMutation,
    crawlWebsiteMutation,
    deleteWebsiteMutation,
  } = useWebsiteManager();

  const filteredWebsites = websites.filter((website) =>
    website.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
    website.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    website.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddWebsite = (url: string, category: string) => {
    addWebsite(url, category).catch((err) =>
      console.error('Error adding website:', err)
    );
    setAddOpen(false);
  };

  const handlePreviewWebsite = (website: Website) => {
    setPreviewWebsite(website);
    setPreviewOpen(true);
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Websites</h2>
            <p className="text-muted-foreground">
              Indexe websites para expandir a base de conhecimento
            </p>
          </div>
        </div>
        <div className="text-center text-red-600">Erro ao carregar websites: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
          Websites
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Indexe websites para expandir a base de conhecimento
        </p>
      </div>

      <div className="flex justify-between items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Buscar websites..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <AddWebsiteDialog
          open={addOpen}
          onOpenChange={setAddOpen}
          onAdd={handleAddWebsite}
          isLoading={createWebsiteMutation.isPending}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <WebsiteCardSkeleton key={i} />)
        ) : filteredWebsites.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
            <Globe className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <h3 className="text-lg font-medium mb-1">Nenhum website encontrado</h3>
            <p className="text-sm">
              {searchQuery
                ? 'Nenhum website corresponde à sua pesquisa.'
                : 'Comece adicionando websites para indexação.'}
            </p>
          </div>
        ) : (
          filteredWebsites.map((website) => (
            <WebsiteCard
              key={website.id}
              website={website}
              onPreview={handlePreviewWebsite}
              onRefresh={refreshWebsite}
              onDelete={deleteWebsite}
              isRefreshing={crawlWebsiteMutation.isPending}
              isDeleting={deleteWebsiteMutation.isPending}
            />
          ))
        )}
      </div>

      <WebsitePreviewDialog
        website={previewWebsite}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
      />
    </div>
  );
};

export default WebsitesTab;
