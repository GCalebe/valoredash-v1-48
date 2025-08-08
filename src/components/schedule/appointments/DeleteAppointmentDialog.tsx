// @ts-nocheck
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

interface DeleteAppointmentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentAppointment: any | null;
  onConfirm: () => void;
}

const DeleteAppointmentDialog: React.FC<DeleteAppointmentDialogProps> = ({
  isOpen,
  onOpenChange,
  currentAppointment,
  onConfirm,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirmar Exclusão</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja excluir este agendamento Comercial? Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>

        {currentAppointment && (
          <div className="py-4">
            <p>
              <strong>Embarcação:</strong> {currentAppointment.petName}
            </p>
            <p>
              <strong>Proprietário:</strong> {currentAppointment.ownerName}
            </p>
            <p>
              <strong>Data/Hora:</strong>{" "}
              {format(currentAppointment.date, "dd/MM/yyyy 'às' HH:mm", { locale: pt })}
            </p>
            <p>
              <strong>Serviço:</strong> {currentAppointment.service}
            </p>
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            <X className="mr-2 h-4 w-4" />
            Cancelar
          </Button>
          <Button type="button" variant="destructive" onClick={onConfirm}>
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteAppointmentDialog;


