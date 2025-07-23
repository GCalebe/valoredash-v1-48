import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { EventFormData, CalendarEvent } from "@/hooks/useCalendarEvents";
import { useEventFormDialog } from "@/hooks/useEventFormDialog";
import { BlockedDateForm } from "./event-form/BlockedDateForm";
import { ClientSelectionTab } from "./event-form/ClientSelectionTab";
import { ServiceSelectionTab } from "./event-form/ServiceSelectionTab";
import { DateTimeSelectionTab } from "./event-form/DateTimeSelectionTab";
import { AttendanceSelectionTab } from "./event-form/AttendanceSelectionTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface EventFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (formData: EventFormData) => void;
  onDelete?: (eventId: string) => void;
  isSubmitting: boolean;
  event?: CalendarEvent;
  title: string;
  description: string;
  submitLabel: string;
  error?: string | null;
}

export function EventFormDialog({
  open,
  onOpenChange,
  onSubmit,
  onDelete,
  isSubmitting,
  event,
  title,
  description,
  submitLabel,
  error,
}: EventFormDialogProps) {
  const {
    state,
    updateState,
    filteredContacts,
    constants,
    validateForm,
    handleSubmit,
    handleSelectClient,
    handleNewClient,
    handleSaveNewClient,
    handleServiceNext,
    handleDateTimeNext,
    addTag,
    removeTag,
    handleDeleteDialogOpen,
    handleDeleteDialogClose,
  } = useEventFormDialog({ event, open });

  const onFormSubmit = (e: React.FormEvent) => {
    const formData = handleSubmit(e);
    if (formData) {
      onSubmit(formData);
    }
  };

  const handleDeleteEvent = () => {
    if (event && onDelete) {
      handleDeleteDialogClose();
      onDelete(event.id);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{state.isBlockingDate ? "Bloquear Data" : title}</DialogTitle>
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>

          <form onSubmit={onFormSubmit} className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Label htmlFor="block-date" className="flex items-center gap-2 cursor-pointer">
                <input
                  id="block-date"
                  type="checkbox"
                  checked={state.isBlockingDate}
                  onChange={(e) => updateState({ isBlockingDate: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <span>Bloquear data/período</span>
              </Label>
            </div>

            {state.isBlockingDate ? (
              <BlockedDateForm
                state={state}
                updateState={updateState}
                constants={constants}
                addTag={addTag}
                removeTag={removeTag}
              />
            ) : (
              <Tabs value={state.activeTab} onValueChange={(tab) => updateState({ activeTab: tab })}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="client">1. Cliente</TabsTrigger>
                  <TabsTrigger value="service">2. Serviço</TabsTrigger>
                  <TabsTrigger value="datetime">3. Data/Hora</TabsTrigger>
                  <TabsTrigger value="attendance">4. Atendimento</TabsTrigger>
                </TabsList>
                
                <TabsContent value="client" className="space-y-4 py-4">
                  <ClientSelectionTab
                    state={state}
                    updateState={updateState}
                    filteredContacts={filteredContacts}
                    onSelectClient={handleSelectClient}
                    onNewClient={handleNewClient}
                    onSaveNewClient={handleSaveNewClient}
                    onNext={() => updateState({ activeTab: "service" })}
                  />
                </TabsContent>
                
                <TabsContent value="service" className="space-y-4 py-4">
                  <ServiceSelectionTab
                    state={state}
                    updateState={updateState}
                    constants={constants}
                    onNext={handleServiceNext}
                    onPrevious={() => updateState({ activeTab: "client" })}
                  />
                </TabsContent>
                
                <TabsContent value="datetime" className="space-y-4 py-4">
                  <DateTimeSelectionTab
                    state={state}
                    updateState={updateState}
                    constants={constants}
                    onNext={handleDateTimeNext}
                    onPrevious={() => updateState({ activeTab: "service" })}
                  />
                </TabsContent>
                
                <TabsContent value="attendance" className="space-y-4 py-4">
                  <AttendanceSelectionTab
                    state={state}
                    updateState={updateState}
                    constants={constants}
                    addTag={addTag}
                    removeTag={removeTag}
                    onPrevious={() => updateState({ activeTab: "datetime" })}
                    selectedAgendaId={state.selectedAgendaId}
                  />
                </TabsContent>
              </Tabs>
            )}

            <DialogFooter className="flex gap-2">
              {event && onDelete && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDeleteDialogOpen}
                  disabled={isSubmitting}
                >
                  Excluir
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting || !validateForm()}>
                {isSubmitting && (
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                )}
                {isSubmitting ? "Salvando..." : submitLabel}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={state.isDeleteDialogOpen} onOpenChange={handleDeleteDialogClose}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este evento? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteEvent}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {error && (
        <AlertDialog open={!!error}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Erro</AlertDialogTitle>
              <AlertDialogDescription>
                {error}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => onOpenChange(false)}>OK</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}