import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, Upload, FileText, Download } from "lucide-react";

interface ClientMethodSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectManual: () => void;
  onSelectImport: () => void;
}

const ClientMethodSelectionModal = ({
  isOpen,
  onClose,
  onSelectManual,
  onSelectImport,
}: ClientMethodSelectionModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <UserPlus className="h-6 w-6 text-primary" />
            Como deseja adicionar clientes?
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary/50"
            onClick={onSelectManual}
          >
            <CardHeader className="text-center pb-3">
              <UserPlus className="h-12 w-12 text-primary mx-auto mb-2" />
              <CardTitle className="text-lg">Adicionar Manualmente</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <CardDescription className="mb-4">
                Preencha um formulário completo para adicionar um cliente por vez
              </CardDescription>
              <Button className="w-full">
                Continuar
              </Button>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary/50"
            onClick={onSelectImport}
          >
            <CardHeader className="text-center pb-3">
              <Upload className="h-12 w-12 text-primary mx-auto mb-2" />
              <CardTitle className="text-lg">Importar Planilha</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <CardDescription className="mb-4">
                Baixe o modelo e importe vários clientes de uma só vez
              </CardDescription>
              <Button variant="outline" className="w-full">
                Continuar
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-center mt-6">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClientMethodSelectionModal;