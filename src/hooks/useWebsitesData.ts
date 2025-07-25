// Mock implementation for websites functionality since websites table doesn't exist
import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';

export interface Website {
  id: string;
  url: string;
  title: string;
  description: string;
  status: 'active' | 'inactive' | 'pending' | 'indexed' | 'indexing' | 'error';
  last_crawled: string;
  metadata: unknown;
  created_at: string;
  updated_at: string;
  tags: string[];
  category: string;
  language: string;
  pages_indexed?: number;
}

export function useWebsitesData() {
  const [websites, setWebsites] = useState<Website[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWebsites = useCallback(async () => {
    console.log('Mock fetchWebsites called');
    return [];
  }, []);

  const addWebsite = useCallback(async (websiteData: unknown) => {
    console.log('Mock addWebsite called with:', websiteData);
    return { id: 'mock', ...websiteData };
  }, []);

  const updateWebsite = useCallback(async (id: string, updates: unknown) => {
    console.log('Mock updateWebsite called');
    return true;
  }, []);

  const deleteWebsite = useCallback(async (id: string) => {
    console.log('Mock deleteWebsite called');
    return true;
  }, []);

  return {
    websites,
    loading,
    error,
    fetchWebsites,
    addWebsite,
    updateWebsite,
    deleteWebsite
  };
}

// Mock query hook for React Query compatibility
export const useWebsitesQuery = () => {
  return useQuery({
    queryKey: ['websites'],
    queryFn: async () => [] as Website[],
    initialData: [],
  });
};

// Mock mutation hooks with full React Query mutation interface
export const useCreateWebsiteMutation = () => ({
  mutateAsync: async (websiteData: unknown) => ({ id: 'mock', ...websiteData }),
  mutate: (websiteData: unknown) => console.log('Creating website:', websiteData),
  isPending: false,
  isLoading: false,
  error: null,
  data: undefined,
  isError: false,
  isSuccess: false,
  reset: () => {},
});

export const useUpdateWebsiteMutation = () => ({
  mutateAsync: async (updates: unknown) => ({ success: true }),
  mutate: (updates: unknown) => console.log('Updating website:', updates),
  isPending: false,
  isLoading: false,
  error: null,
  data: undefined,
  isError: false,
  isSuccess: false,
  reset: () => {},
});

export const useDeleteWebsiteMutation = () => ({
  mutateAsync: async (id: string) => ({ success: true }),
  mutate: (id: string) => console.log('Deleting website:', id),
  isPending: false,
  isLoading: false,
  error: null,
  data: undefined,
  isError: false,
  isSuccess: false,
  reset: () => {},
});

export const useCrawlWebsiteMutation = () => ({
  mutateAsync: async (id: string) => ({ success: true }),
  mutate: (id: string) => console.log('Crawling website:', id),
  isPending: false,
  isLoading: false,
  error: null,
  data: undefined,
  isError: false,
  isSuccess: false,
  reset: () => {},
});