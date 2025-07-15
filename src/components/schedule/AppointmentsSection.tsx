import React from "react";
import { format, isSameDay } from "date-fns";
import { pt } from "date-fns/locale";
import { Appointment, AppointmentFormData } from "@/types/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
// form fields handled via AppointmentFormFields
import { Button } from "@/components/ui/button";
import { X, Trash2 } from "lucide-react";
import AppointmentFormFields from "./AppointmentFormFields";

interface AppointmentsSectionProps {
  appointments: Appointment[];
  isAddDialogOpen: boolean;
  setIsAddDialogOpen: (open: boolean) => void;
  isEditDialogOpen: boolean;
  setIsEditDialogOpen: (open: boolean) => void;
  isDeleteDialogOpen: boolean;
  setIsDeleteDialogOpen: (open: boolean) => void;
  currentAppointment: Appointment | null;
  formData: AppointmentFormData;
  setFormData: (data: AppointmentFormData) => void;
  handleSubmit: (e: React.FormEvent) => void;
  confirmDelete: () => void;
}

export function AppointmentsSection({
  appointments,
  isAddDialogOpen,
  setIsAddDialogOpen,
  isEditDialogOpen,
  setIsEditDialogOpen,
  isDeleteDialogOpen,
  setIsDeleteDialogOpen,
  currentAppointment,
  formData,
  setFormData,
  handleSubmit,
  confirmDelete,
}: AppointmentsSectionProps) {
  return (
    <>
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Agendamento Náutico</DialogTitle>
            <DialogDescription>
              Preencha os dados para criar um novo agendamento náutico.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AppointmentFormFields
              formData={formData}
              setFormData={setFormData}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">Salvar Agendamento</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Agendamento Náutico</DialogTitle>
            <DialogDescription>
              Atualize os dados do agendamento náutico.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AppointmentFormFields
              formData={formData}
              setFormData={setFormData}
              idPrefix="edit-"
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">Atualizar Agendamento</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este agendamento náutico? Esta ação
              não pode ser desfeita.
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
                {format(currentAppointment.date, "dd/MM/yyyy 'às' HH:mm", {
                  locale: pt,
                })}
              </p>
              <p>
                <strong>Serviço:</strong> {currentAppointment.service}
              </p>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              <X className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
            <Button type="button" variant="destructive" onClick={confirmDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}