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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface EditAppointmentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  formData: any;
  setFormData: (data: any) => void;
  handleSubmit: (e: React.FormEvent) => void;
}

const EditAppointmentDialog: React.FC<EditAppointmentDialogProps> = ({
  isOpen,
  onOpenChange,
  formData,
  setFormData,
  handleSubmit,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Agendamento Comercial</DialogTitle>
          <DialogDescription>Atualize os dados do agendamento Comercial.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-petName">Nome da Embarcação</Label>
              <Input id="edit-petName" value={formData.petName} onChange={(e) => setFormData({ ...formData, petName: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-ownerName">Nome do Proprietário</Label>
              <Input id="edit-ownerName" value={formData.ownerName} onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Telefone</Label>
              <Input id="edit-phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-date">Data e Hora</Label>
              <div className="flex">
                <Input
                  id="edit-date"
                  type="datetime-local"
                  value={formData.date ? new Date(formData.date).toISOString().slice(0, 16) : ""}
                  onChange={(e) => {
                    const newDate = e.target.value ? new Date(e.target.value) : new Date();
                    setFormData({ ...formData, date: newDate });
                  }}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-service">Serviço Comercial</Label>
              <Input id="edit-service" value={formData.service} onChange={(e) => setFormData({ ...formData, service: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <select
                id="edit-status"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                required
              >
                <option value="scheduled">Pendente</option>
                <option value="completed">Confirmado</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-notes">Observações</Label>
            <Input id="edit-notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Atualizar Agendamento</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditAppointmentDialog;


