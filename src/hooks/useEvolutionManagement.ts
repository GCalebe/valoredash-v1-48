import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Evolution {
  id: string;
  client_id: string;
  date: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

interface EvolutionFormData {
  title: string;
  description: string;
  date: string;
  status: string;
}

interface UseEvolutionManagementProps {
  clientId?: string;
}

// NOTE: The 'evolutions' table doesn't exist in the database.
// This hook is disabled until the table is created.
export const useEvolutionManagement = ({ clientId }: UseEvolutionManagementProps) => {
  const [evolutions, setEvolutions] = useState<Evolution[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>('The evolutions table does not exist in the database');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentEvolution, setCurrentEvolution] = useState<Evolution | null>(null);
  const [formData, setFormData] = useState<EvolutionFormData>({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    status: 'active',
  });

  // Disabled functionality - return empty functions
  const resetFormData = useCallback(() => {
    setFormData({
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      status: 'active',
    });
    setCurrentEvolution(null);
  }, []);

  const openCreateForm = useCallback(() => {
    console.warn('Evolution management is disabled - evolutions table does not exist');
  }, []);

  const openEditForm = useCallback((evolution: Evolution) => {
    console.warn('Evolution management is disabled - evolutions table does not exist');
  }, []);

  const closeForm = useCallback(() => {
    setIsFormOpen(false);
    resetFormData();
  }, [resetFormData]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const fetchEvolutions = useCallback(async () => {
    console.warn('Evolution management is disabled - evolutions table does not exist');
    return [];
  }, []);

  const createEvolution = useCallback(async () => {
    console.warn('Evolution management is disabled - evolutions table does not exist');
    return null;
  }, []);

  const updateEvolution = useCallback(async () => {
    console.warn('Evolution management is disabled - evolutions table does not exist');
    return null;
  }, []);

  const deleteEvolution = useCallback(async (evolutionId: string) => {
    console.warn('Evolution management is disabled - evolutions table does not exist');
    return false;
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    console.warn('Evolution management is disabled - evolutions table does not exist');
    return null;
  }, []);

  // Fetch evolutions when clientId changes - disabled
  useEffect(() => {
    // Evolution management is disabled since table doesn't exist
    setEvolutions([]);
  }, [clientId]);

  // Sort evolutions by date (most recent first)
  const sortedEvolutions = [...evolutions].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  // Filter evolutions by status
  const filterEvolutionsByStatus = useCallback((status: string) => {
    return sortedEvolutions.filter(ev => ev.status === status);
  }, [sortedEvolutions]);

  // Get active evolutions
  const activeEvolutions = filterEvolutionsByStatus('active');
  
  // Get archived evolutions
  const archivedEvolutions = filterEvolutionsByStatus('archived');

  return {
    // State
    evolutions: sortedEvolutions,
    activeEvolutions,
    archivedEvolutions,
    loading,
    error,
    isFormOpen,
    currentEvolution,
    formData,
    
    // Form handlers
    setFormData,
    handleInputChange,
    handleSubmit,
    openCreateForm,
    openEditForm,
    closeForm,
    
    // CRUD operations
    fetchEvolutions,
    createEvolution,
    updateEvolution,
    deleteEvolution,
  };
};

export default useEvolutionManagement;