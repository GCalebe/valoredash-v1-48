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

interface NotesFieldProps {
  selectedChat: string | null;
}

const NotesField = ({ selectedChat }: NotesFieldProps) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Carregar notas do banco de dados
  useEffect(() => {
    if (selectedChat) {
      loadNotes();
    }
  }, [loadNotes]);

  const loadNotes = async () => {
    if (!selectedChat) return;
    
    setLoading(true);
    try {
      // Primeiro buscar o session_id pela conversa
      const { data: conversationData, error: conversationError } = await supabase
        .from("conversations")
        .select("session_id")
        .eq("id", selectedChat)
        .single();

      if (conversationError && conversationError.code !== "PGRST116") {
        throw conversationError;
      }

      if (conversationData?.session_id) {
        // Buscar as notas na tabela contacts
        const { data: contactData, error: contactError } = await supabase
          .from("contacts")
          .select("notes")
          .eq("session_id", conversationData.session_id)
          .single();

        if (contactError && contactError.code !== "PGRST116") {
          throw contactError;
        }

        if (contactData?.notes) {
          try {
            // Se as notas já estão em JSON, parsear
            const parsedNotes = typeof contactData.notes === "string" 
              ? JSON.parse(contactData.notes) 
              : contactData.notes;
            
            setNotes(Array.isArray(parsedNotes) ? parsedNotes : []);
          } catch (parseError) {
            console.error("Error parsing notes:", parseError);
            // Se não conseguir parsear, tratar como string simples
            setNotes([{
              id: Date.now().toString(),
              content: contactData.notes,
              timestamp: new Date().toLocaleString("pt-BR"),
            }]);
          }
        } else {
          setNotes([]);
        }
      } else {
        setNotes([]);
      }
    } catch (error) {
      console.error("Error loading notes:", error);
      toast({
        title: "Erro ao carregar anotações",
        description: "Não foi possível carregar as anotações.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveNotes = async (updatedNotes: Note[]) => {
    if (!selectedChat) return;
    
    setSaving(true);
    try {
      // Primeiro buscar o session_id pela conversa
      const { data: conversationData, error: conversationError } = await supabase
        .from("conversations")
        .select("session_id")
        .eq("id", selectedChat)
        .single();

      if (conversationError) {
        throw conversationError;
      }

      if (conversationData?.session_id) {
        // Salvar na tabela contacts
        const { error } = await supabase
          .from("contacts")
          .update({ notes: JSON.stringify(updatedNotes) })
          .eq("session_id", conversationData.session_id);

        if (error) throw error;
      }

    } catch (error) {
      console.error("Error saving notes:", error);
      toast({
        title: "Erro ao salvar anotações",
        description: "Não foi possível salvar as anotações.",
        variant: "destructive",
      });
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

    const updatedNotes = [note, ...notes];
    setNotes(updatedNotes);
    setNewNote("");
    
    await saveNotes(updatedNotes);
  };

  const removeNote = async (noteId: string) => {
    const updatedNotes = notes.filter((note) => note.id !== noteId);
    setNotes(updatedNotes);
    
    await saveNotes(updatedNotes);
  };

  if (!selectedChat) {
    return null;
  }

  return (
    <Card className="p-4">
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
        Anotações
      </h3>

      {/* Add new note */}
      <div className="mb-4">
        <Textarea
          placeholder="Adicionar nova anotação..."
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          className="min-h-[80px] mb-2"
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
                  size="xs"
                  onClick={() => removeNote(note.id)}
                  className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
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
    </Card>
  );
};

export default NotesField;
