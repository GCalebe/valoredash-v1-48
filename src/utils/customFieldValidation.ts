import { ValidationRule } from "@/types/customFields";

export interface ValidationError {
  fieldId: string;
  message: string;
}

export function validateCustomField(
  fieldId: string,
  value: unknown,
  validationRules: ValidationRule[],
): ValidationError | null {
  const fieldRules = validationRules.filter(
    (rule) => rule.field_id === fieldId,
  );

  for (const rule of fieldRules) {
    const error = validateRule(fieldId, value, rule);
    if (error) {
      return error;
    }
  }

  return null;
}

// Funções auxiliares para validação de regras específicas
function validateRequiredRule(value: unknown, ruleValue: string): boolean {
  return ruleValue === "true" && (value === null || value === undefined || value === "");
}

function validateMinLengthRule(value: unknown, ruleValue: string): boolean {
  return typeof value === "string" && value.length < parseInt(ruleValue || "0");
}

function validateMaxLengthRule(value: unknown, ruleValue: string): boolean {
  return typeof value === "string" && value.length > parseInt(ruleValue || "0");
}

function validatePatternRule(value: unknown, ruleValue: string): boolean {
  if (typeof value === "string" && ruleValue) {
    const regex = new RegExp(ruleValue);
    return !regex.test(value);
  }
  return false;
}

function validateMinValueRule(value: unknown, ruleValue: string): boolean {
  return typeof value === "number" && value < parseFloat(ruleValue || "0");
}

function validateMaxValueRule(value: unknown, ruleValue: string): boolean {
  return typeof value === "number" && value > parseFloat(ruleValue || "0");
}

// Função principal de validação com complexidade reduzida
function validateRule(
  fieldId: string,
  value: unknown,
  rule: ValidationRule,
): ValidationError | null {
  const validators = {
    required: validateRequiredRule,
    min_length: validateMinLengthRule,
    max_length: validateMaxLengthRule,
    pattern: validatePatternRule,
    min_value: validateMinValueRule,
    max_value: validateMaxValueRule,
  };

  const validator = validators[rule.rule_type as keyof typeof validators];
  
  if (validator && validator(value, rule.rule_value || "")) {
    return { fieldId, message: rule.error_message };
  }

  return null;
}

export function validateAllCustomFields(
  fieldValues: { [fieldId: string]: unknown },
  validationRules: ValidationRule[],
): ValidationError[] {
  const errors: ValidationError[] = [];

  Object.entries(fieldValues).forEach(([fieldId, value]) => {
    const error = validateCustomField(fieldId, value, validationRules);
    if (error) {
      errors.push(error);
    }
  });

  return errors;
}
