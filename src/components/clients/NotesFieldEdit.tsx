import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Plus, AlertCircle, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useOptimizedNotes } from "@/hooks/useOptimizedNotes";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface NotesFieldEditProps {
  contactId: string | null;
}

const NotesFieldEdit: React.FC<NotesFieldEditProps> = ({ contactId }) => {
  const [newNote, setNewNote] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<
    { type: "add" } | { type: "remove"; noteId: string } | null
  >(null);
  
  const {
    notes,
    isLoading,
    isSaving,
    error,
    loadNotes,
    addNote,
    removeNote,
    retry,
  } = useOptimizedNotes();

  const confirmAdd = () => {
    if (!newNote.trim()) return;
    setPendingAction({ type: "add" });
    setIsConfirmOpen(true);
  };

  const handleAddNote = async () => {
    if (!contactId || !newNote.trim()) return;

    const success = await addNote(contactId, newNote.trim());
    if (success) {
      setNewNote("");
    }
  };

  const requestRemove = (noteId: string) => {
    setPendingAction({ type: "remove", noteId });
    setIsConfirmOpen(true);
  };

  const handleRemoveNote = async (noteId: string) => {
    if (!contactId) return;
    await removeNote(contactId, noteId);
  };

  const handleRetry = () => {
    if (contactId) {
      retry(contactId);
    }
  };

  useEffect(() => {
    if (contactId) {
      loadNotes(contactId);
    }
  }, [contactId, loadNotes]);

  if (!contactId) {
    return null;
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <AlertCircle className="w-4 h-4 text-destructive" />
            Erro ao carregar notas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button variant="outline" size="sm" onClick={handleRetry}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Tentar novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Notas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-8 w-full" />
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Notas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Input para nova nota */}
          <div className="flex gap-2">
              <Input
              placeholder="Adicione uma nova nota..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  confirmAdd();
                }
              }}
              disabled={isSaving}
              className="flex-1"
            />
            <Button
              onClick={confirmAdd}
              disabled={!newNote.trim() || isSaving}
              size="sm"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Lista de notas */}
          {notes.length > 0 ? (
            <ScrollArea className="max-h-60">
              <div className="space-y-2">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className="p-3 bg-muted rounded-md group relative"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1">
                        <p className="text-sm text-foreground break-words">
                          {note.content}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(note.timestamp).toLocaleString("pt-BR")}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => requestRemove(note.id)}
                        disabled={isSaving}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">
                Nenhuma nota adicionada ainda.
              </p>
            </div>
          )}

          {/* Indicador de salvamento */}
          {isSaving && (
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Salvando...</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
    
    {/* Confirmação de alteração para notas */}
    <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar alteração?</AlertDialogTitle>
          <AlertDialogDescription>
            {pendingAction?.type === "add"
              ? "Deseja adicionar esta nota?"
              : "Deseja remover esta nota?"}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => { setPendingAction(null); setIsConfirmOpen(false); }}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={async () => {
            if (!pendingAction) { setIsConfirmOpen(false); return; }
            if (pendingAction.type === "add") {
              await handleAddNote();
            } else if (pendingAction.type === "remove") {
              await handleRemoveNote(pendingAction.noteId);
            }
            setPendingAction(null);
            setIsConfirmOpen(false);
          }}>Confirmar</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
};

export default NotesFieldEdit;