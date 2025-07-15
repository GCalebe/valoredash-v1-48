import React from 'react';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { KanbanStage } from '@/hooks/useKanbanStages';

interface AddMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newMessage: {
    category: string;
    name: string;
    content: string;
    context: string;
  };
  setNewMessage: React.Dispatch<React.SetStateAction<any>>;
  onAdd: () => void;
  isAdding: boolean;
  stages: KanbanStage[];
  stagesLoading: boolean;
}

const AddMessageDialog: React.FC<AddMessageDialogProps> = ({
  open,
  onOpenChange,
  newMessage,
  setNewMessage,
  onAdd,
  isAdding,
  stages,
  stagesLoading,
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogTrigger asChild>
      <Button>
        <Plus className="h-4 w-4 mr-2" />
        Adicionar Mensagem
      </Button>
    </DialogTrigger>
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Adicionar Nova Mensagem</DialogTitle>
        <DialogDescription>
          Crie uma nova mensagem para a IA utilizar em situações específicas.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Nome da Mensagem *</Label>
            <Input
              id="name"
              value={newMessage.name}
              onChange={(e) => setNewMessage({ ...newMessage, name: e.target.value })}
              placeholder="Ex: Saudação Matinal"
            />
          </div>
          <div>
            <Label htmlFor="category">Etapa do Funil</Label>
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
          <Label htmlFor="content">Conteúdo da Mensagem *</Label>
          <Textarea
            id="content"
            value={newMessage.content}
            onChange={(e) => setNewMessage({ ...newMessage, content: e.target.value })}
            placeholder="Digite a mensagem... Use {variavel} para inserir variáveis"
            rows={4}
          />
          <p className="text-xs text-gray-500 mt-1">
            Use {`{nomeVariavel}`} para inserir variáveis dinâmicas na mensagem
          </p>
        </div>

        <div>
          <Label htmlFor="context">Contexto de Uso</Label>
          <Input
            id="context"
            value={newMessage.context}
            onChange={(e) => setNewMessage({ ...newMessage, context: e.target.value })}
            placeholder="Ex: Horário comercial, Fora do horário..."
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Cancelar
        </Button>
        <Button onClick={onAdd} disabled={isAdding}>
          {isAdding ? 'Adicionando...' : 'Adicionar'}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default AddMessageDialog;

