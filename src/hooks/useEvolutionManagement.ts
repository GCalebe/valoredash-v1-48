import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';

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

export const useEvolutionManagement = ({ clientId }: UseEvolutionManagementProps) => {
  const [evolutions, setEvolutions] = useState<Evolution[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentEvolution, setCurrentEvolution] = useState<Evolution | null>(null);
  const [formData, setFormData] = useState<EvolutionFormData>({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    status: 'active',
  });

  // Reset form data to default values
  const resetFormData = useCallback(() => {
    setFormData({
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      status: 'active',
    });
    setCurrentEvolution(null);
  }, []);

  // Open form for creating a new evolution
  const openCreateForm = useCallback(() => {
    resetFormData();
    setIsFormOpen(true);
  }, [resetFormData]);

  // Open form for editing an existing evolution
  const openEditForm = useCallback((evolution: Evolution) => {
    setFormData({
      title: evolution.title,
      description: evolution.description,
      date: evolution.date,
      status: evolution.status,
    });
    setCurrentEvolution(evolution);
    setIsFormOpen(true);
  }, []);

  // Close the form
  const closeForm = useCallback(() => {
    setIsFormOpen(false);
    resetFormData();
  }, [resetFormData]);

  // Handle form input changes
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  // Fetch evolutions for a client
  const fetchEvolutions = useCallback(async () => {
    if (!clientId) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('evolutions')
        .select('*')
        .eq('client_id', clientId)
        .order('date', { ascending: false });

      if (error) throw error;

      setEvolutions(data || []);
    } catch (err) {
      setError('Failed to fetch evolutions');
      console.error('Error fetching evolutions:', err);
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  // Create a new evolution
  const createEvolution = useCallback(async () => {
    if (!clientId) return;

    try {
      setLoading(true);
      setError(null);

      const newEvolution = {
        client_id: clientId,
        ...formData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('evolutions')
        .insert([newEvolution])
        .select();

      if (error) throw error;

      // Add the new evolution to the state
      if (data && data.length > 0) {
        setEvolutions(prev => [data[0], ...prev]);
      }

      closeForm();
      return data?.[0];
    } catch (err) {
      setError('Failed to create evolution');
      console.error('Error creating evolution:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [clientId, formData, closeForm]);

  // Update an existing evolution
  const updateEvolution = useCallback(async () => {
    if (!clientId || !currentEvolution) return;

    try {
      setLoading(true);
      setError(null);

      const updatedEvolution = {
        ...formData,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('evolutions')
        .update(updatedEvolution)
        .eq('id', currentEvolution.id)
        .select();

      if (error) throw error;

      // Update the evolution in the state
      if (data && data.length > 0) {
        setEvolutions(prev =>
          prev.map(ev => (ev.id === currentEvolution.id ? data[0] : ev))
        );
      }

      closeForm();
      return data?.[0];
    } catch (err) {
      setError('Failed to update evolution');
      console.error('Error updating evolution:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [clientId, currentEvolution, formData, closeForm]);

  // Delete an evolution
  const deleteEvolution = useCallback(async (evolutionId: string) => {
    if (!clientId) return;

    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('evolutions')
        .delete()
        .eq('id', evolutionId);

      if (error) throw error;

      // Remove the evolution from the state
      setEvolutions(prev => prev.filter(ev => ev.id !== evolutionId));

      return true;
    } catch (err) {
      setError('Failed to delete evolution');
      console.error('Error deleting evolution:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.title.trim() || !formData.date) {
      setError('Title and date are required');
      return null;
    }
    
    if (currentEvolution) {
      return await updateEvolution();
    } else {
      return await createEvolution();
    }
  }, [formData, currentEvolution, updateEvolution, createEvolution]);

  // Fetch evolutions when clientId changes
  useEffect(() => {
    if (clientId) {
      fetchEvolutions();
    } else {
      setEvolutions([]);
    }
  }, [clientId, fetchEvolutions]);

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