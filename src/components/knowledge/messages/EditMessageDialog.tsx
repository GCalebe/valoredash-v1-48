import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { KanbanStage } from '@/hooks/useKanbanStages';

interface EditMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newMessage: {
    category: string;
    name: string;
    content: string;
    context: string;
  };
  setNewMessage: React.Dispatch<React.SetStateAction<any>>;
  onUpdate: () => void;
  isUpdating: boolean;
  stages: KanbanStage[];
  stagesLoading: boolean;
}

const EditMessageDialog: React.FC<EditMessageDialogProps> = ({
  open,
  onOpenChange,
  newMessage,
  setNewMessage,
  onUpdate,
  isUpdating,
  stages,
  stagesLoading,
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Editar Mensagem</DialogTitle>
        <DialogDescription>Modifique o conteúdo da mensagem.</DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="edit-name">Nome da Mensagem *</Label>
            <Input
              id="edit-name"
              value={newMessage.name}
              onChange={(e) => setNewMessage({ ...newMessage, name: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="edit-category">Etapa do Funil</Label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              value={newMessage.category}
              onChange={(e) => setNewMessage({ ...newMessage, category: e.target.value })}
            >
              {stagesLoading ? (
                <option value="">Carregando etapas...</option>
              ) : (
                stages.map((stage) => (
                  <option key={stage.id} value={stage.title}>
                    {stage.title}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        <div>
          <Label htmlFor="edit-content">Conteúdo da Mensagem *</Label>
          <Textarea
            id="edit-content"
            value={newMessage.content}
            onChange={(e) => setNewMessage({ ...newMessage, content: e.target.value })}
            rows={4}
          />
        </div>

        <div>
          <Label htmlFor="edit-context">Contexto de Uso</Label>
          <Input
            id="edit-context"
            value={newMessage.context}
            onChange={(e) => setNewMessage({ ...newMessage, context: e.target.value })}
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Cancelar
        </Button>
        <Button onClick={onUpdate} disabled={isUpdating}>
          {isUpdating ? 'Atualizando...' : 'Atualizar'}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default EditMessageDialog;

