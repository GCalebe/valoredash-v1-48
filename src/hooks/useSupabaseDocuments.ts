import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface Document {
  id: number;
  titulo: string;
  content: string;
  metadata: {
    type: string;
    size: number;
    uploadedAt: string;
    tags?: string[];
    category?: string;
    description?: string;
  };
  user_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface DocumentFormData {
  titulo: string;
  content: string;
  type: string;
  tags?: string[];
  category?: string;
  description?: string;
}

export const useSupabaseDocuments = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch documents from Supabase
  const fetchDocuments = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching documents:', error);
        toast({
          title: 'Erro ao carregar documentos',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }

      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast({
        title: 'Erro ao carregar documentos',
        description: 'Ocorreu um erro inesperado',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id, toast]);

  // Add new document
  const addDocument = useCallback(async (documentData: DocumentFormData) => {
    if (!user?.id) return false;

    setUploading(true);
    try {
      const metadata = {
        type: documentData.type,
        size: documentData.content.length,
        uploadedAt: new Date().toISOString(),
        tags: documentData.tags || [],
        category: documentData.category,
        description: documentData.description,
      };

      const { data, error } = await supabase
        .from('documents')
        .insert({
          titulo: documentData.titulo,
          content: documentData.content,
          metadata,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding document:', error);
        toast({
          title: 'Erro ao adicionar documento',
          description: error.message,
          variant: 'destructive',
        });
        return false;
      }

      setDocuments(prev => [data, ...prev]);
      toast({
        title: 'Documento adicionado',
        description: 'O documento foi adicionado com sucesso',
      });
      return true;
    } catch (error) {
      console.error('Error adding document:', error);
      toast({
        title: 'Erro ao adicionar documento',
        description: 'Ocorreu um erro inesperado',
        variant: 'destructive',
      });
      return false;
    } finally {
      setUploading(false);
    }
  }, [user?.id, toast]);

  // Update document
  const updateDocument = useCallback(async (id: number, documentData: Partial<DocumentFormData>) => {
    if (!user?.id) return false;

    setUploading(true);
    try {
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      if (documentData.titulo) updateData.titulo = documentData.titulo;
      if (documentData.content) updateData.content = documentData.content;
      
      if (documentData.tags || documentData.category || documentData.description) {
        const currentDoc = documents.find(doc => doc.id === id);
        if (currentDoc) {
          updateData.metadata = {
            ...currentDoc.metadata,
            tags: documentData.tags || currentDoc.metadata.tags,
            category: documentData.category || currentDoc.metadata.category,
            description: documentData.description || currentDoc.metadata.description,
          };
        }
      }

      const { data, error } = await supabase
        .from('documents')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating document:', error);
        toast({
          title: 'Erro ao atualizar documento',
          description: error.message,
          variant: 'destructive',
        });
        return false;
      }

      setDocuments(prev => prev.map(doc => doc.id === id ? data : doc));
      toast({
        title: 'Documento atualizado',
        description: 'O documento foi atualizado com sucesso',
      });
      return true;
    } catch (error) {
      console.error('Error updating document:', error);
      toast({
        title: 'Erro ao atualizar documento',
        description: 'Ocorreu um erro inesperado',
        variant: 'destructive',
      });
      return false;
    } finally {
      setUploading(false);
    }
  }, [user?.id, documents, toast]);

  // Delete document
  const deleteDocument = useCallback(async (id: number) => {
    if (!user?.id) return false;

    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting document:', error);
        toast({
          title: 'Erro ao excluir documento',
          description: error.message,
          variant: 'destructive',
        });
        return false;
      }

      setDocuments(prev => prev.filter(doc => doc.id !== id));
      toast({
        title: 'Documento excluído',
        description: 'O documento foi excluído com sucesso',
      });
      return true;
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: 'Erro ao excluir documento',
        description: 'Ocorreu um erro inesperado',
        variant: 'destructive',
      });
      return false;
    }
  }, [user?.id, toast]);

  // Upload file and create document
  const uploadFile = useCallback(async (file: File, metadata?: { category?: string; description?: string; tags?: string[] }) => {
    if (!user?.id) return false;

    setUploading(true);
    try {
      // Read file content
      const content = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsText(file);
      });

      const documentData: DocumentFormData = {
        titulo: file.name,
        content,
        type: file.type || 'text/plain',
        tags: metadata?.tags || [],
        category: metadata?.category,
        description: metadata?.description,
      };

      return await addDocument(documentData);
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: 'Erro ao fazer upload',
        description: 'Não foi possível ler o arquivo',
        variant: 'destructive',
      });
      return false;
    } finally {
      setUploading(false);
    }
  }, [user?.id, addDocument, toast]);

  // Search documents
  const searchDocuments = useCallback(async (query: string) => {
    if (!user?.id || !query.trim()) {
      await fetchDocuments();
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        .or(`titulo.ilike.%${query}%,content.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error searching documents:', error);
        toast({
          title: 'Erro na busca',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }

      setDocuments(data || []);
    } catch (error) {
      console.error('Error searching documents:', error);
      toast({
        title: 'Erro na busca',
        description: 'Ocorreu um erro inesperado',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id, fetchDocuments, toast]);

  // Get documents by category
  const getDocumentsByCategory = useCallback(async (category: string) => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        .contains('metadata', { category })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching documents by category:', error);
        toast({
          title: 'Erro ao filtrar documentos',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }

      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents by category:', error);
      toast({
        title: 'Erro ao filtrar documentos',
        description: 'Ocorreu um erro inesperado',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id, toast]);

  // Initialize documents on mount
  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  return {
    documents,
    loading,
    uploading,
    fetchDocuments,
    addDocument,
    updateDocument,
    deleteDocument,
    uploadFile,
    searchDocuments,
    getDocumentsByCategory,
  };
};