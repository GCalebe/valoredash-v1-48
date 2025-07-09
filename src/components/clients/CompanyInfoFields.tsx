import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Contact } from "@/types/client";

interface CompanyInfoFieldsProps {
  newContact: Partial<Contact>;
  validationErrors: { [key: string]: string };
  onInputChange: (field: keyof Contact, value: any) => void;
}

const CompanyInfoFields = React.memo(({ newContact, validationErrors, onInputChange }: CompanyInfoFieldsProps) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="clientName" className="text-gray-700 dark:text-gray-300">
          Nome da Empresa
        </Label>
        <Input
          id="clientName"
          value={newContact.clientName || ""}
          onChange={(e) => onInputChange("clientName", e.target.value)}
          placeholder="Nome da empresa"
          className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
        />
      </div>

      <div>
        <Label htmlFor="client-type">Tipo de cliente</Label>
        <Select
          value={newContact.clientType || ""}
          onValueChange={(value) => onInputChange("clientType", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pessoa-fisica">Pessoa Física</SelectItem>
            <SelectItem value="pessoa-juridica">Pessoa Jurídica</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="clientSize" className="text-gray-700 dark:text-gray-300">
          Tamanho do Cliente
        </Label>
        <Select
          value={newContact.clientSize || ""}
          onValueChange={(value) => onInputChange("clientSize", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pequeno">Pequeno</SelectItem>
            <SelectItem value="medio">Médio</SelectItem>
            <SelectItem value="grande">Grande</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="cpfCnpj" className="text-gray-700 dark:text-gray-300">
          CPF/CNPJ
        </Label>
        <Input
          id="cpfCnpj"
          value={newContact.cpfCnpj || ""}
          onChange={(e) => onInputChange("cpfCnpj", e.target.value)}
          placeholder="000.000.000-00 ou 00.000.000/0000-00"
          className={`bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 ${
            validationErrors.cpfCnpj ? "border-red-500 focus:border-red-500" : ""
          }`}
        />
        {validationErrors.cpfCnpj && (
          <p className="text-sm text-red-500 mt-1">{validationErrors.cpfCnpj}</p>
        )}
      </div>
    </div>
  );
});

CompanyInfoFields.displayName = 'CompanyInfoFields';

export default CompanyInfoFields;