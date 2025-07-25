// Mock implementation for websites functionality since websites table doesn't exist
import { useState, useCallback } from 'react';

export interface Website {
  id: string;
  url: string;
  title: string;
  description: string;
  status: 'active' | 'inactive' | 'pending';
  last_crawled: string;
  metadata: unknown;
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

  const addWebsite = useCallback(async (websiteData: Omit<Website, 'id' | 'created_at' | 'updated_at'>) => {
    setLoading(true);
    try {
      console.log('Mock addWebsite called with:', websiteData);
      const newWebsite: Website = {
        ...websiteData,
        id: `mock_${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setWebsites(prev => [...prev, newWebsite]);
      return newWebsite;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateWebsite = useCallback(async (id: string, updates: Partial<Website>) => {
    setLoading(true);
    try {
      console.log('Mock updateWebsite called with:', { id, updates });
      setWebsites(prev => prev.map(website => 
        website.id === id ? { ...website, ...updates, updated_at: new Date().toISOString() } : website
      ));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteWebsite = useCallback(async (id: string) => {
    setLoading(true);
    try {
      console.log('Mock deleteWebsite called with id:', id);
      setWebsites(prev => prev.filter(website => website.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchWebsites = useCallback(async () => {
    setLoading(true);
    try {
      console.log('Mock fetchWebsites called');
      // Return empty array for now
      return [];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    websites,
    loading,
    error,
    addWebsite,
    updateWebsite,
    deleteWebsite,
    fetchWebsites
  };
}