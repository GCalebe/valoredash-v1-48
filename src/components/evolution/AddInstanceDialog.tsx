import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus } from "lucide-react";
import React from "react";

interface AddInstanceDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  instanceName: string;
  setInstanceName: (name: string) => void;
  handleCreateInstance: () => void;
  isLoading: boolean;
}

const AddInstanceDialog = ({
  isOpen,
  onOpenChange,
  instanceName,
  setInstanceName,
  handleCreateInstance,
  isLoading,
}: AddInstanceDialogProps) => (
  <Dialog open={isOpen} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Nova Conexão WhatsApp</DialogTitle>
        <DialogDescription>
          Crie uma nova instância do WhatsApp para sua equipe
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4 pt-2">
        <div className="space-y-2">
          <Label htmlFor="instance-name">Nome da Instância</Label>
          <Input
            id="instance-name"
            placeholder="Ex: Atendimento Principal"
            className="dark:bg-gray-700"
            value={instanceName}
            onChange={(e) => setInstanceName(e.target.value)}
          />
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Cancelar
        </Button>
        <Button
          onClick={handleCreateInstance}
          className="bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Criando...
            </span>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Criar Instância
            </>
          )}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default AddInstanceDialog;
