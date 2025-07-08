import { ValidationRule } from "@/types/customFields";

export interface ValidationError {
  fieldId: string;
  message: string;
}

export function validateCustomField(
  fieldId: string,
  value: any,
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

function validateRule(
  fieldId: string,
  value: any,
  rule: ValidationRule,
): ValidationError | null {
  switch (rule.rule_type) {
    case "required":
      if (
        rule.rule_value === "true" &&
        (value === null || value === undefined || value === "")
      ) {
        return { fieldId, message: rule.error_message };
      }
      break;

    case "min_length":
      if (
        typeof value === "string" &&
        value.length < parseInt(rule.rule_value || "0")
      ) {
        return { fieldId, message: rule.error_message };
      }
      break;

    case "max_length":
      if (
        typeof value === "string" &&
        value.length > parseInt(rule.rule_value || "0")
      ) {
        return { fieldId, message: rule.error_message };
      }
      break;

    case "pattern":
      if (typeof value === "string" && rule.rule_value) {
        const regex = new RegExp(rule.rule_value);
        if (!regex.test(value)) {
          return { fieldId, message: rule.error_message };
        }
      }
      break;

    case "min_value":
      if (
        typeof value === "number" &&
        value < parseFloat(rule.rule_value || "0")
      ) {
        return { fieldId, message: rule.error_message };
      }
      break;

    case "max_value":
      if (
        typeof value === "number" &&
        value > parseFloat(rule.rule_value || "0")
      ) {
        return { fieldId, message: rule.error_message };
      }
      break;
  }

  return null;
}

export function validateAllCustomFields(
  fieldValues: { [fieldId: string]: any },
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
