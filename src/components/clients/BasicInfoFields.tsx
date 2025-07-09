import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Contact } from "@/types/client";

interface BasicInfoFieldsProps {
  newContact: Partial<Contact>;
  validationErrors: { [key: string]: string };
  onInputChange: (field: keyof Contact, value: any) => void;
}

const BasicInfoFields = React.memo(({ newContact, validationErrors, onInputChange }: BasicInfoFieldsProps) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">
          Nome Completo *
        </Label>
        <Input
          id="name"
          value={newContact.name || ""}
          onChange={(e) => onInputChange("name", e.target.value)}
          placeholder="Digite o nome completo"
          className={`bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 ${
            validationErrors.name ? "border-red-500 focus:border-red-500" : ""
          }`}
        />
        {validationErrors.name && (
          <p className="text-sm text-red-500 mt-1">{validationErrors.name}</p>
        )}
      </div>

      <div>
        <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          value={newContact.email || ""}
          onChange={(e) => onInputChange("email", e.target.value)}
          placeholder="email@exemplo.com"
          className={`bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 ${
            validationErrors.email ? "border-red-500 focus:border-red-500" : ""
          }`}
        />
        {validationErrors.email && (
          <p className="text-sm text-red-500 mt-1">{validationErrors.email}</p>
        )}
      </div>

      <div>
        <Label htmlFor="phone" className="text-gray-700 dark:text-gray-300">
          Telefone *
        </Label>
        <Input
          id="phone"
          value={newContact.phone || ""}
          onChange={(e) => onInputChange("phone", e.target.value)}
          placeholder="(00) 00000-0000"
          className={`bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 ${
            validationErrors.phone ? "border-red-500 focus:border-red-500" : ""
          }`}
        />
        {validationErrors.phone && (
          <p className="text-sm text-red-500 mt-1">{validationErrors.phone}</p>
        )}
      </div>

      <div>
        <Label htmlFor="address" className="text-gray-700 dark:text-gray-300">
          Endereço
        </Label>
        <Input
          id="address"
          value={newContact.address || ""}
          onChange={(e) => onInputChange("address", e.target.value)}
          placeholder="Rua, número, bairro, cidade, estado"
          className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
        />
      </div>

      <div>
        <Label htmlFor="responsible-user">Usuário responsável</Label>
        <Input
          id="responsible-user"
          value={newContact.responsibleUser || ""}
          onChange={(e) => onInputChange("responsibleUser", e.target.value)}
          placeholder="Gabriel Calebe"
        />
      </div>

      <div>
        <Label htmlFor="notes" className="text-gray-700 dark:text-gray-300">
          Observações
        </Label>
        <Textarea
          id="notes"
          value={newContact.notes || ""}
          onChange={(e) => onInputChange("notes", e.target.value)}
          placeholder="Observações sobre o cliente"
          className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 min-h-[80px]"
        />
      </div>
    </div>
  );
});

BasicInfoFields.displayName = 'BasicInfoFields';

export default BasicInfoFields;