import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight, Edit, Save, X } from 'lucide-react';
import { AIMessage } from './types';
import { Switch } from '@/components/ui/switch';

interface MessageEditDialogProps {
  open: boolean;
  message: AIMessage | null;
  onOpenChange: (open: boolean) => void;
  onChange: (message: AIMessage) => void;
  onSave: () => void;
  onCancel: () => void;
}

export const MessageEditDialog: React.FC<MessageEditDialogProps> = ({ open, message, onOpenChange, onChange, onSave, onCancel }) => {
  if (!message) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Editar Mensagem - Fluxo Visual
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">1</div>
                <span className="font-medium">Configuração</span>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white text-sm font-bold">2</div>
                <span className="font-medium">Condições</span>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold">3</div>
                <span className="font-medium">Ativação</span>
              </div>
            </div>
          </div>

          <div className="border rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">1</div>
              <h4 className="font-semibold text-gray-800 dark:text-gray-100">Configuração da Mensagem</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
              <label htmlFor="dlg-msg-name" className="block text-sm font-medium mb-2">Nome da Mensagem</label>
              <Input id="dlg-msg-name" value={message.name} onChange={(e) => onChange({ ...message, name: e.target.value })} placeholder="Digite o nome da mensagem" />
              </div>
              <div>
              <label htmlFor="dlg-msg-category" className="block text-sm font-medium mb-2">Categoria</label>
              <Select value={message.category} onValueChange={(value) => onChange({ ...message, category: value })}>
                  <SelectTrigger id="dlg-msg-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Lead">Lead</SelectItem>
                    <SelectItem value="Prospect">Prospect</SelectItem>
                    <SelectItem value="Cliente">Cliente</SelectItem>
                    <SelectItem value="Ex-cliente">Ex-cliente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-4">
              <label htmlFor="dlg-msg-content" className="block text-sm font-medium mb-2">Conteúdo da Mensagem</label>
              <Textarea id="dlg-msg-content" value={message.content} onChange={(e) => onChange({ ...message, content: e.target.value })} placeholder="Digite o conteúdo da mensagem" rows={4} />
            </div>
          </div>

          <div className="border rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 bg-orange-600 rounded-full flex items-center justify-center text-white text-xs font-bold">2</div>
              <h4 className="font-semibold text-gray-800 dark:text-gray-100">Condições de Uso</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="dlg-cond-user" className="block text-sm font-medium mb-2">Tipo de Usuário</label>
                <Input id="dlg-cond-user" value={message.conditions.userType} onChange={(e) => onChange({ ...message, conditions: { ...message.conditions, userType: e.target.value } })} placeholder="Ex: Novo usuário, Lead qualificado" />
              </div>
              <div>
                <label htmlFor="dlg-cond-stage" className="block text-sm font-medium mb-2">Estágio</label>
                <Input id="dlg-cond-stage" value={message.conditions.stage} onChange={(e) => onChange({ ...message, conditions: { ...message.conditions, stage: e.target.value } })} placeholder="Ex: Primeiro contato, Negociação" />
              </div>
            </div>
          </div>

          <div className="border rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold">3</div>
              <h4 className="font-semibold text-gray-800 dark:text-gray-100">Ativação e Métricas</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded">
                <div>
                  <p className="font-medium">Status</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{message.isActive ? 'Ativa' : 'Inativa'}</p>
                </div>
                <Switch checked={message.isActive} onCheckedChange={(checked) => onChange({ ...message, isActive: checked })} />
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded">
                <p className="font-medium">Usos</p>
                <p className="text-2xl font-bold text-blue-600">{message.usage}</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded">
                <p className="font-medium">Eficácia</p>
                <p className="text-2xl font-bold text-green-600">{message.effectiveness}%</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={onSave} className="bg-green-600 hover:bg-green-700">
              <Save className="h-4 w-4 mr-2" />
              Salvar Alterações
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MessageEditDialog;


