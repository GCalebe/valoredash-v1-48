// Mock implementation for websites functionality since websites table doesn't exist
import { useState, useCallback } from 'react';

export interface Website {
  id: string;
  url: string;
  title: string;
  description: string;
  status: 'active' | 'inactive' | 'pending';
  last_crawled: string;
  metadata: any;
  created_at: string;
  updated_at: string;
  tags: string[];
  category: string;
  language: string;
}

export function useWebsitesData() {
  const [websites, setWebsites] = useState<Website[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWebsites = useCallback(async () => {
    console.log('Mock fetchWebsites called');
    return [];
  }, []);

  const addWebsite = useCallback(async (websiteData: any) => {
    console.log('Mock addWebsite called with:', websiteData);
    return { id: 'mock', ...websiteData };
  }, []);

  const updateWebsite = useCallback(async (id: string, updates: any) => {
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

// Mock exports for mutation hooks
export const useCreateWebsiteMutation = () => ({
  mutateAsync: async () => ({}),
  isPending: false
});

export const useUpdateWebsiteMutation = () => ({
  mutateAsync: async () => ({}),
  isPending: false
});

export const useDeleteWebsiteMutation = () => ({
  mutateAsync: async () => ({}),
  isPending: false
});

export const useCrawlWebsiteMutation = () => ({
  mutateAsync: async () => ({}),
  isPending: false
});