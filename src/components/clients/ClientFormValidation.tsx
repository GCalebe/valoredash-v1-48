import React from "react";
import { Contact } from "@/types/client";

interface ValidationResult {
  isValid: boolean;
  errors: { [key: string]: string };
}

// Funções auxiliares de validação para reduzir complexidade cognitiva
const validateRequiredFields = (
  contact: Partial<Contact>,
  errors: { [key: string]: string }
): void => {
  if (!contact.name?.trim()) {
    errors.name = "Nome é obrigatório";
  }

  if (!contact.phone?.trim()) {
    errors.phone = "Telefone é obrigatório";
  }
};

const validateEmail = (
  email: string | undefined,
  errors: { [key: string]: string }
): void => {
  if (email && email.trim()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.email = "Email deve ter um formato válido";
    }
  }
};

const validatePhone = (
  phone: string | undefined,
  errors: { [key: string]: string }
): void => {
  if (phone && phone.trim()) {
    const phoneRegex = /^[\d\s\(\)\-\+]+$/;
    if (!phoneRegex.test(phone)) {
      errors.phone = "Telefone deve conter apenas números e caracteres válidos";
    }
  }
};

const validateCpfCnpj = (
  cpfCnpj: string | undefined,
  errors: { [key: string]: string }
): void => {
  if (cpfCnpj && cpfCnpj.trim()) {
    const cleanCpfCnpj = cpfCnpj.replace(/\D/g, "");
    if (cleanCpfCnpj.length !== 11 && cleanCpfCnpj.length !== 14) {
      errors.cpfCnpj = "CPF deve ter 11 dígitos ou CNPJ deve ter 14 dígitos";
    }
  }
};

const validateBudget = (
  budget: number | undefined | null,
  errors: { [key: string]: string }
): void => {
  if (budget !== undefined && budget !== null && budget < 0) {
    errors.budget = "Orçamento não pode ser negativo";
  }
};

export const validateClientForm = (
  contact: Partial<Contact>,
): ValidationResult => {
  const errors: { [key: string]: string } = {};

  // Aplicar validações separadas
  validateRequiredFields(contact, errors);
  validateEmail(contact.email, errors);
  validatePhone(contact.phone, errors);
  validateCpfCnpj(contact.cpfCnpj, errors);
  validateBudget(contact.budget, errors);

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
