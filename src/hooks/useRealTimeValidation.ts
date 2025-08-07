import { useState, useCallback, useMemo } from 'react';
import { Contact } from '@/types/client';
import { CustomFieldWithValue } from '@/types/customFields';

interface ValidationError {
  field: string;
  message: string;
  type: 'required' | 'format' | 'length' | 'custom';
}

interface ValidationConfig {
  realTime: boolean;
  showInlineErrors: boolean;
  debounceMs: number;
}

const DEFAULT_CONFIG: ValidationConfig = {
  realTime: true,
  showInlineErrors: true,
  debounceMs: 500,
};

export const useRealTimeValidation = (
  contact: Contact | null,
  customFields: CustomFieldWithValue[] = [],
  config: Partial<ValidationConfig> = {}
) => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  // Phone validation regex (basic Brazilian format)
  const phoneRegex = /^(\+55\s?)?(\(?\d{2}\)?\s?)?(\d{4,5}-?\d{4})$/;

  const validateField = useCallback((field: keyof Contact, value: any): ValidationError | null => {
    switch (field) {
      case 'name':
        if (!value || value.toString().trim().length === 0) {
          return { field, message: 'Nome é obrigatório', type: 'required' };
        }
        if (value.toString().length < 2) {
          return { field, message: 'Nome deve ter pelo menos 2 caracteres', type: 'length' };
        }
        break;

      case 'email':
        if (value && !emailRegex.test(value.toString())) {
          return { field, message: 'Email deve ter um formato válido', type: 'format' };
        }
        break;

      case 'phone':
        if (!value || value.toString().trim().length === 0) {
          return { field, message: 'Telefone é obrigatório', type: 'required' };
        }
        if (!phoneRegex.test(value.toString().replace(/\s/g, ''))) {
          return { field, message: 'Telefone deve ter um formato válido', type: 'format' };
        }
        break;

      case 'cpfCnpj':
        if (value) {
          const cleaned = value.toString().replace(/\D/g, '');
          if (cleaned.length !== 11 && cleaned.length !== 14) {
            return { field, message: 'CPF deve ter 11 dígitos ou CNPJ deve ter 14 dígitos', type: 'format' };
          }
        }
        break;

      case 'sales':
      case 'budget':
        if (value && isNaN(Number(value))) {
          return { field, message: 'Deve ser um número válido', type: 'format' };
        }
        if (value && Number(value) < 0) {
          return { field, message: 'Valor deve ser positivo', type: 'custom' };
        }
        break;

      default:
        break;
    }

    return null;
  }, [emailRegex, phoneRegex]);

  const validateCustomField = useCallback((customField: CustomFieldWithValue): ValidationError | null => {
    const { field_name, is_required, field_type, value, validationRules = [] } = customField;

    // Required field validation
    if (is_required && (!value || (Array.isArray(value) && value.length === 0))) {
      return {
        field: field_name,
        message: `${field_name} é obrigatório`,
        type: 'required'
      };
    }

    // Apply custom validation rules
    for (const rule of validationRules) {
      switch (rule.rule_type) {
        case 'min_length':
          if (value && value.toString().length < Number(rule.rule_value)) {
            return {
              field: field_name,
              message: rule.error_message,
              type: 'length'
            };
          }
          break;

        case 'max_length':
          if (value && value.toString().length > Number(rule.rule_value)) {
            return {
              field: field_name,
              message: rule.error_message,
              type: 'length'
            };
          }
          break;

        case 'pattern':
          if (value && rule.rule_value) {
            const regex = new RegExp(rule.rule_value);
            if (!regex.test(value.toString())) {
              return {
                field: field_name,
                message: rule.error_message,
                type: 'format'
              };
            }
          }
          break;

        case 'min_value':
          if (value && Number(value) < Number(rule.rule_value)) {
            return {
              field: field_name,
              message: rule.error_message,
              type: 'custom'
            };
          }
          break;

        case 'max_value':
          if (value && Number(value) > Number(rule.rule_value)) {
            return {
              field: field_name,
              message: rule.error_message,
              type: 'custom'
            };
          }
          break;
      }
    }

    return null;
  }, []);

  const validateAllFields = useCallback(() => {
    if (!contact) return [];

    const fieldErrors: ValidationError[] = [];

    // Validate standard fields
    const standardFields: (keyof Contact)[] = ['name', 'email', 'phone', 'cpfCnpj', 'sales', 'budget'];
    
    standardFields.forEach(field => {
      const error = validateField(field, contact[field]);
      if (error) {
        fieldErrors.push(error);
      }
    });

    // Validate custom fields
    customFields.forEach(customField => {
      const error = validateCustomField(customField);
      if (error) {
        fieldErrors.push(error);
      }
    });

    return fieldErrors;
  }, [contact, customFields, validateField, validateCustomField]);

  const validateSingleField = useCallback((field: keyof Contact | string, value: any) => {
    const standardFields = ['name', 'email', 'phone', 'cpfCnpj', 'sales', 'budget'];
    
    if (standardFields.includes(field)) {
      return validateField(field as keyof Contact, value);
    } else {
      // Handle custom field validation
      const customField = customFields.find(cf => cf.field_name === field);
      if (customField) {
        return validateCustomField({ ...customField, value });
      }
    }
    
    return null;
  }, [validateField, validateCustomField, customFields]);

  const markFieldAsTouched = useCallback((field: string) => {
    setTouchedFields(prev => new Set([...prev, field]));
  }, []);

  const getFieldError = useCallback((field: string) => {
    if (!finalConfig.showInlineErrors || !touchedFields.has(field)) {
      return null;
    }
    return errors.find(error => error.field === field) || null;
  }, [errors, touchedFields, finalConfig.showInlineErrors]);

  // Real-time validation
  const triggerValidation = useCallback(() => {
    if (finalConfig.realTime) {
      const newErrors = validateAllFields();
      setErrors(newErrors);
    }
  }, [finalConfig.realTime, validateAllFields]);

  // Computed properties
  const isValid = useMemo(() => errors.length === 0, [errors]);
  
  const hasRequiredFieldErrors = useMemo(() => 
    errors.some(error => error.type === 'required'), [errors]
  );

  const errorsByField = useMemo(() => {
    const map: Record<string, ValidationError> = {};
    errors.forEach(error => {
      map[error.field] = error;
    });
    return map;
  }, [errors]);

  return {
    // State
    errors,
    isValid,
    hasRequiredFieldErrors,
    touchedFields,
    errorsByField,
    
    // Methods
    validateAllFields,
    validateSingleField,
    markFieldAsTouched,
    getFieldError,
    triggerValidation,
    
    // Utilities
    setErrors,
    setTouchedFields,
  };
};