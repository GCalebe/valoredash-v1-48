// @ts-nocheck
import React, { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Note {
  id: string;
  content: string;
  timestamp: string;
}

interface NotesFieldEditProps {
  contactId: string | null;
}

const NotesFieldEdit = ({ contactId }: NotesFieldEditProps) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Carregar notas do banco de dados
  useEffect(() => {
    if (contactId) {
      loadNotes();
    }
  }, [contactId]);

  const loadNotes = async () => {
    if (!contactId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("contacts")
        .select("notes")
        .eq("id", contactId)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      
      const parsedNotes = parseNotes(data?.notes);
      setNotes(parsedNotes);
    } catch (error) {
      console.error("Error loading notes:", error);
      toast({ 
        title: "Erro ao carregar anotações", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const parseNotes = (notesData: unknown): Note[] => {
    if (!notesData) return [];
    
    // Se for string, verifica se é JSON válido
    if (typeof notesData === "string") {
      const trimmed = notesData.trim();
      if (!trimmed) return [];
      
      // Verifica se parece com JSON (começa com [ ou {)
      if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
        try {
          const parsed = JSON.parse(trimmed);
          return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
          console.error("Error parsing JSON notes:", error);
          // Se falhar o parse do JSON, converte em nota simples
          return [{
            id: Date.now().toString(),
            content: trimmed,
            timestamp: new Date().toLocaleString("pt-BR")
          }];
        }
      } else {
        // Se não parece JSON, trata como texto simples
        return [{
          id: Date.now().toString(),
          content: trimmed,
          timestamp: new Date().toLocaleString("pt-BR")
        }];
      }
    }
    
    // Se já for objeto/array, retorna diretamente
    if (Array.isArray(notesData)) {
      return notesData;
    }
    
    return [];
  };

  const saveNotes = async (updatedNotes: Note[]) => {
    if (!contactId) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("contacts")
        .update({ notes: JSON.stringify(updatedNotes) })
        .eq("id", contactId);

      if (error) throw error;
    } catch (error) {
      console.error("Error saving notes:", error);
      toast({ 
        title: "Erro ao salvar anotações", 
        variant: "destructive" 
      });
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const addNote = async () => {
    if (!newNote.trim()) return;

    const note: Note = {
      id: Date.now().toString(),
      content: newNote.trim(),
      timestamp: new Date().toLocaleString("pt-BR"),
    };

    const updatedNotes = [note, ...notes]; // Adiciona no início
    setNotes(updatedNotes);
    setNewNote("");

    try {
      await saveNotes(updatedNotes);
      toast({ 
        title: "Anotação adicionada com sucesso" 
      });
    } catch (error) {
      // Reverter em caso de erro
      setNotes(notes);
      setNewNote(note.content);
    }
  };

  const removeNote = async (noteId: string) => {
    const updatedNotes = notes.filter((note) => note.id !== noteId);
    const originalNotes = [...notes];
    setNotes(updatedNotes);

    try {
      await saveNotes(updatedNotes);
      toast({ 
        title: "Anotação removida com sucesso" 
      });
    } catch (error) {
      // Reverter em caso de erro
      setNotes(originalNotes);
    }
  };

  if (!contactId) {
    return null;
  }

  if (loading) {
    return (
      <Card className="p-4 mb-4">
        <div className="flex items-center justify-center py-4">
          <div className="h-4 w-4 border-2 border-t-transparent border-blue-600 rounded-full animate-spin"></div>
          <span className="ml-2 text-sm text-gray-500">Carregando anotações...</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 mb-4">
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
        Anotações
      </h3>

      {/* Add new note form */}
      <div className="mb-4">
        <Textarea
          placeholder="Adicionar nova anotação..."
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          className="min-h-[80px] mb-2"
          disabled={saving}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={addNote}
          className="w-full"
          disabled={saving || !newNote.trim()}
        >
          <Plus className="h-4 w-4 mr-2" />
          {saving ? "Salvando..." : "Adicionar Anotação"}
        </Button>
      </div>

      {/* Notes list */}
      <ScrollArea className="h-64">
        <div className="space-y-3">
          {notes.map((note) => (
            <div
              key={note.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-800"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {note.timestamp}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeNote(note.id)}
                  className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                  disabled={saving}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <p className="text-sm whitespace-pre-wrap break-words">
                {note.content}
              </p>
            </div>
          ))}

          {notes.length === 0 && (
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-8">
              Nenhuma anotação ainda
            </p>
          )}
        </div>
      </ScrollArea>

      {saving && (
        <div className="mt-2 text-xs text-gray-500 flex items-center">
          <div className="h-3 w-3 border border-t-transparent border-blue-600 rounded-full animate-spin mr-1"></div>
          Salvando...
        </div>
      )}
    </Card>
  );
};

export default NotesFieldEdit;