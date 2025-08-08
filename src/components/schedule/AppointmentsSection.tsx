import React from "react";
import { Appointment, AppointmentFormData } from "@/types/calendar";
import AddAppointmentDialog from "./appointments/AddAppointmentDialog";
import EditAppointmentDialog from "./appointments/EditAppointmentDialog";
import DeleteAppointmentDialog from "./appointments/DeleteAppointmentDialog";
import { useProducts } from "@/hooks/useProducts";

interface AppointmentsSectionProps {
  readonly appointments: Appointment[];
  readonly isAddDialogOpen: boolean;
  readonly setIsAddDialogOpen: (open: boolean) => void;
  readonly isEditDialogOpen: boolean;
  readonly setIsEditDialogOpen: (open: boolean) => void;
  readonly isDeleteDialogOpen: boolean;
  readonly setIsDeleteDialogOpen: (open: boolean) => void;
  readonly currentAppointment: Appointment | null;
  readonly formData: AppointmentFormData;
  readonly setFormData: (data: AppointmentFormData) => void;
  readonly handleSubmit: (e: React.FormEvent) => void;
  readonly confirmDelete: () => void;
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
}: Readonly<AppointmentsSectionProps>) {
  const { products, loading: productsLoading } = useProducts();
  return (
    <>
      <AddAppointmentDialog
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        formData={formData}
        setFormData={setFormData}
        handleSubmit={handleSubmit}
        products={products}
        productsLoading={productsLoading}
      />
      <EditAppointmentDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        formData={formData}
        setFormData={setFormData}
        handleSubmit={handleSubmit}
      />
      <DeleteAppointmentDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        currentAppointment={currentAppointment}
        onConfirm={confirmDelete}
      />
    </>
  );
}