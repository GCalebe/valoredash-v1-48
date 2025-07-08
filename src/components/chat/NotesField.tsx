import React, { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, X } from "lucide-react";

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

  const addNote = () => {
    if (!newNote.trim()) return;

    const note: Note = {
      id: Date.now().toString(),
      content: newNote.trim(),
      timestamp: new Date().toLocaleString("pt-BR"),
    };

    setNotes([note, ...notes]);
    setNewNote("");
  };

  const removeNote = (noteId: string) => {
    setNotes(notes.filter((note) => note.id !== noteId));
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
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Anotação
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
