import React from "react";
import { Contact } from "@/types/client";

interface ValidationResult {
  isValid: boolean;
  errors: { [key: string]: string };
}

export const validateClientForm = (
  contact: Partial<Contact>,
): ValidationResult => {
  const errors: { [key: string]: string } = {};

  // Validações obrigatórias
  if (!contact.name?.trim()) {
    errors.name = "Nome é obrigatório";
  }

  if (!contact.phone?.trim()) {
    errors.phone = "Telefone é obrigatório";
  }

  // Validação de email (se preenchido)
  if (contact.email && contact.email.trim()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contact.email)) {
      errors.email = "Email deve ter um formato válido";
    }
  }

  // Validação de telefone (formato básico)
  if (contact.phone && contact.phone.trim()) {
    const phoneRegex = /^[\d\s\(\)\-\+]+$/;
    if (!phoneRegex.test(contact.phone)) {
      errors.phone = "Telefone deve conter apenas números e caracteres válidos";
    }
  }

  // Validação de CPF/CNPJ (formato básico)
  if (contact.cpfCnpj && contact.cpfCnpj.trim()) {
    const cleanCpfCnpj = contact.cpfCnpj.replace(/\D/g, "");
    if (cleanCpfCnpj.length !== 11 && cleanCpfCnpj.length !== 14) {
      errors.cpfCnpj = "CPF deve ter 11 dígitos ou CNPJ deve ter 14 dígitos";
    }
  }

  // Validação de orçamento (se preenchido)
  if (contact.budget !== undefined && contact.budget !== null) {
    if (contact.budget < 0) {
      errors.budget = "Orçamento não pode ser negativo";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

interface ClientFormValidationProps {
  errors: { [key: string]: string };
  fieldName: string;
  children: React.ReactNode;
}

const ClientFormValidation: React.FC<ClientFormValidationProps> = ({
  errors,
  fieldName,
  children,
}) => {
  const hasError = errors[fieldName];

  return (
    <div className="space-y-1">
      {children}
      {hasError && (
        <p className="text-sm text-red-600 font-medium">{hasError}</p>
      )}
    </div>
  );
};

export default ClientFormValidation;
