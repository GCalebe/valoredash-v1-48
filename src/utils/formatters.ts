/**
 * Utility functions for formatting data in the application
 */

/**
 * Formats a number as currency (BRL)
 * @param value - The number to format
 * @returns Formatted currency string
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

/**
 * Formats a date string to a localized date format
 * @param dateString - The date string to format
 * @returns Formatted date string
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return "";

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR");
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString;
  }
};

/**
 * Formats a phone number to a standard format
 * @param phone - The phone number to format
 * @returns Formatted phone number
 */
export const formatPhone = (phone: string): string => {
  if (!phone) return "";

  // Remove non-numeric characters
  const cleaned = phone.replace(/\D/g, "");

  // Format based on length
  if (cleaned.length === 11) {
    return `(${cleaned.substring(0, 2)}) ${cleaned.substring(
      2,
      7,
    )}-${cleaned.substring(7)}`;
  } else if (cleaned.length === 10) {
    return `(${cleaned.substring(0, 2)}) ${cleaned.substring(
      2,
      6,
    )}-${cleaned.substring(6)}`;
  }

  return phone;
};
