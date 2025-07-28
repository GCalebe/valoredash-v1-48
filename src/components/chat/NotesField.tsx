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
  }, [selectedChat]);

  const getSessionId = async (chatId: string) => {
    const { data, error } = await supabase
      .from("conversations")
      .select("session_id")
      .eq("id", chatId)
      .single();
    if (error && error.code !== "PGRST116") throw error;
    return data?.session_id;
  };

  const getContactNotes = async (sessionId: string) => {
    const { data, error } = await supabase
      .from("contacts")
      .select("notes")
      .eq("session_id", sessionId)
      .single();
    if (error && error.code !== "PGRST116") throw error;
    return data?.notes;
  };

  const updateContactNotes = async (sessionId: string, notes: Note[]) => {
    const { error } = await supabase
      .from("contacts")
      .update({ notes: JSON.stringify(notes) })
      .eq("session_id", sessionId);
    if (error) throw error;
  };

  const parseNotes = (notesData: unknown) => {
    if (!notesData) return [];
    try {
      const parsed = typeof notesData === "string" ? JSON.parse(notesData) : notesData;
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error("Error parsing notes:", error);
      return [{ id: Date.now().toString(), content: String(notesData), timestamp: new Date().toLocaleString("pt-BR") }];
    }
  };

  const loadNotes = async () => {
    if (!selectedChat) return;
    setLoading(true);
    try {
      const sessionId = await getSessionId(selectedChat);
      if (sessionId) {
        const notesData = await getContactNotes(sessionId);
        const parsedNotes = parseNotes(notesData);
        setNotes(parsedNotes);
      } else {
        setNotes([]);
      }
    } catch (error) {
      console.error("Error loading notes:", error);
      toast({ title: "Erro ao carregar anotações", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const saveNotes = async (updatedNotes: Note[]) => {
    if (!selectedChat) return;
    setSaving(true);
    try {
      const sessionId = await getSessionId(selectedChat);
      if (sessionId) {
        await updateContactNotes(sessionId, updatedNotes);
      }
    } catch (error) {
      console.error("Error saving notes:", error);
      toast({ title: "Erro ao salvar anotações", variant: "destructive" });
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
      <AddNoteForm 
        newNote={newNote} 
        setNewNote={setNewNote} 
        addNote={addNote} 
        saving={saving} 
      />
      <NotesList 
        notes={notes} 
        removeNote={removeNote} 
      />
    </Card>
  );
};

// Sub-componente para o formulário de adicionar nota
const AddNoteForm = ({ newNote, setNewNote, addNote, saving }) => (
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
);

// Sub-componente para a lista de notas
const NotesList = ({ notes, removeNote }) => (
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
);

export default NotesField;
