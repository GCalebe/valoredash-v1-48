import React from "react";
import { format } from "date-fns";
import { AppointmentFormData } from "@/types/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AppointmentFormFieldsProps {
  formData: AppointmentFormData;
  setFormData: (data: AppointmentFormData) => void;
  idPrefix?: string;
}

export default function AppointmentFormFields({
  formData,
  setFormData,
  idPrefix = "",
}: AppointmentFormFieldsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}petName`}>Nome da Embarcação</Label>
        <Input
          id={`${idPrefix}petName`}
          value={formData.petName}
          onChange={(e) =>
            setFormData({
              ...formData,
              petName: e.target.value,
            })
          }
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}ownerName`}>Nome do Proprietário</Label>
        <Input
          id={`${idPrefix}ownerName`}
          value={formData.ownerName}
          onChange={(e) =>
            setFormData({
              ...formData,
              ownerName: e.target.value,
            })
          }
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}phone`}>Telefone</Label>
        <Input
          id={`${idPrefix}phone`}
          value={formData.phone}
          onChange={(e) =>
            setFormData({
              ...formData,
              phone: e.target.value,
            })
          }
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}date`}>Data e Hora</Label>
        <div className="flex">
          <Input
            id={`${idPrefix}date`}
            type="datetime-local"
            value={format(formData.date, "yyyy-MM-dd'T'HH:mm")}
            onChange={(e) => {
              const newDate = e.target.value ? new Date(e.target.value) : new Date();
              setFormData({
                ...formData,
                date: newDate,
              });
            }}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}service`}>Serviço Náutico</Label>
        <select
          id={`${idPrefix}service`}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
          value={formData.service}
          onChange={(e) =>
            setFormData({
              ...formData,
              service: e.target.value,
            })
          }
          required
        >
          <option value="Manutenção de Casco">Manutenção de Casco</option>
          <option value="Revisão de Motor">Revisão de Motor</option>
          <option value="Inspeção de Segurança">Inspeção de Segurança</option>
          <option value="Vistoria Completa">Vistoria Completa</option>
          <option value="Limpeza e Enceramento">Limpeza e Enceramento</option>
          <option value="Manutenção Preventiva">Manutenção Preventiva</option>
          <option value="Vistoria de Segurança">Vistoria de Segurança</option>
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}status`}>Status</Label>
        <select
          id={`${idPrefix}status`}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
          value={formData.status}
          onChange={(e) =>
            setFormData({
              ...formData,
              status: e.target.value as "scheduled" | "completed" | "cancelled",
            })
          }
          required
        >
          <option value="scheduled">Pendente</option>
          <option value="completed">Confirmado</option>
          <option value="cancelled">Cancelado</option>
        </select>
      </div>
    </div>
    <div className="space-y-2">
      <Label htmlFor={`${idPrefix}notes`}>Observações</Label>
      <Input
        id={`${idPrefix}notes`}
        value={formData.notes}
        onChange={(e) =>
          setFormData({
            ...formData,
            notes: e.target.value,
          })
        }
      />
    </div>
  );
}
