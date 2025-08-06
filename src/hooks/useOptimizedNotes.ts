import { useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Note {
  id: string;
  content: string;
  timestamp: string;
}

export const useOptimizedNotes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Cache para evitar requests duplicados
  const loadingRef = useRef<Map<string, Promise<Note[]>>>(new Map());
  
  const parseNotes = useCallback((notesData: any): Note[] => {
    if (!notesData) return [];
    
    try {
      // Se for string, tentar fazer parse JSON
      if (typeof notesData === 'string') {
        const parsed = JSON.parse(notesData);
        return Array.isArray(parsed) ? parsed : [];
      }
      
      // Se já for array, retornar diretamente
      if (Array.isArray(notesData)) {
        return notesData.filter(note => note && typeof note === 'object' && note.content);
      }
      
      return [];
    } catch (error) {
      console.warn("Erro ao fazer parse das notas:", error);
      return [];
    }
  }, []);

  const loadNotes = useCallback(async (contactId: string) => {
    if (!contactId) {
      setNotes([]);
      return [];
    }

    // Verificar se já está carregando para evitar requests duplicados
    if (loadingRef.current.has(contactId)) {
      try {
        const result = await loadingRef.current.get(contactId)!;
        setNotes(result);
        return result;
      } catch (err) {
        loadingRef.current.delete(contactId);
        throw err;
      }
    }

    setIsLoading(true);
    setError(null);

    const loadPromise = (async () => {
      try {
        const { data, error } = await supabase
          .from("contacts")
          .select("notes")
          .eq("id", contactId)
          .maybeSingle();

        if (error) {
          throw new Error(`Erro na consulta: ${error.message}`);
        }

        const parsedNotes = parseNotes(data?.notes);
        setNotes(parsedNotes);
        return parsedNotes;
      } catch (error) {
        console.error("Erro ao carregar notas:", error);
        const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
        setError(`Falha ao carregar notas: ${errorMessage}`);
        
        toast({
          title: "Erro ao carregar notas",
          description: "Não foi possível carregar as notas. Tente novamente.",
        });
        
        throw error;
      } finally {
        setIsLoading(false);
        loadingRef.current.delete(contactId);
      }
    })();

    loadingRef.current.set(contactId, loadPromise);
    return loadPromise;
  }, [parseNotes]);

  const saveNotes = useCallback(async (contactId: string, notesToSave: Note[]) => {
    if (!contactId) {
      throw new Error("ID do contato é obrigatório");
    }

    setIsSaving(true);
    setError(null);

    try {
      // Validar notas antes de salvar
      const validatedNotes = notesToSave.filter(note => 
        note && 
        typeof note === 'object' && 
        note.content && 
        note.content.trim() !== ""
      );

      const { error } = await supabase
        .from("contacts")
        .update({ 
          notes: JSON.stringify(validatedNotes),
          updated_at: new Date().toISOString() 
        })
        .eq("id", contactId);

      if (error) {
        throw new Error(`Erro ao salvar: ${error.message}`);
      }

      setNotes(validatedNotes);
      
      toast({
        title: "Notas salvas",
        description: "As notas foram salvas com sucesso.",
      });

      return true;
    } catch (error) {
      console.error("Erro ao salvar notas:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      setError(`Falha ao salvar notas: ${errorMessage}`);
      
        toast({
          title: "Erro ao salvar notas",
          description: `Não foi possível salvar as notas: ${errorMessage}`,
        });
      
      return false;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const addNote = useCallback(async (contactId: string, content: string) => {
    if (!content?.trim()) {
      toast({
        title: "Erro",
        description: "O conteúdo da nota não pode estar vazio.",
      });
      return false;
    }

    const newNote: Note = {
      id: crypto.randomUUID(),
      content: content.trim(),
      timestamp: new Date().toISOString(),
    };

    const optimisticNotes = [...notes, newNote];
    setNotes(optimisticNotes);

    try {
      const success = await saveNotes(contactId, optimisticNotes);
      if (!success) {
        // Rollback em caso de erro
        setNotes(notes);
      }
      return success;
    } catch (error) {
      // Rollback em caso de erro
      setNotes(notes);
      return false;
    }
  }, [notes, saveNotes]);

  const removeNote = useCallback(async (contactId: string, noteId: string) => {
    const optimisticNotes = notes.filter(note => note.id !== noteId);
    setNotes(optimisticNotes);

    try {
      const success = await saveNotes(contactId, optimisticNotes);
      if (!success) {
        // Rollback em caso de erro
        setNotes(notes);
      }
      return success;
    } catch (error) {
      // Rollback em caso de erro
      setNotes(notes);
      return false;
    }
  }, [notes, saveNotes]);

  const clearCache = useCallback(() => {
    loadingRef.current.clear();
    setNotes([]);
    setError(null);
  }, []);

  const retry = useCallback((contactId: string) => {
    clearCache();
    return loadNotes(contactId);
  }, [clearCache, loadNotes]);

  return {
    notes,
    isLoading,
    isSaving,
    error,
    loadNotes,
    saveNotes,
    addNote,
    removeNote,
    clearCache,
    retry,
  };
};