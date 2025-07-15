import {
  useWebsitesQuery,
  useCreateWebsiteMutation,
  useUpdateWebsiteMutation,
  useDeleteWebsiteMutation,
  useCrawlWebsiteMutation,
  type Website,
} from './useWebsitesData';

export const useWebsiteManager = () => {
  const { data: websites = [], isLoading, error } = useWebsitesQuery();
  const createWebsiteMutation = useCreateWebsiteMutation();
  const updateWebsiteMutation = useUpdateWebsiteMutation();
  const deleteWebsiteMutation = useDeleteWebsiteMutation();
  const crawlWebsiteMutation = useCrawlWebsiteMutation();

  const addWebsite = async (url: string, category: string) => {
    const websiteData = await createWebsiteMutation.mutateAsync({
      url,
      title: `Website ${url}`,
      category: category || 'Geral',
    });
    setTimeout(() => {
      crawlWebsiteMutation.mutate(websiteData.id);
    }, 1000);
    return websiteData as Website;
  };

  const refreshWebsite = (id: string) => {
    updateWebsiteMutation.mutate({
      id,
      status: 'indexing',
      last_crawled: new Date().toISOString(),
    });
    setTimeout(() => {
      crawlWebsiteMutation.mutate(id);
    }, 2000);
  };

  const deleteWebsite = (id: string) => {
    deleteWebsiteMutation.mutate(id);
  };

  return {
    websites,
    isLoading,
    error,
    addWebsite,
    refreshWebsite,
    deleteWebsite,
    createWebsiteMutation,
    updateWebsiteMutation,
    deleteWebsiteMutation,
    crawlWebsiteMutation,
  };
};

export type { Website } from './useWebsitesData';
