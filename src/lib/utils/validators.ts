/**
 * Validation Utilities
 * Common validation functions and helpers
 */

/**
 * Check if value is numeric (digits only)
 */
export function isNumeric(value: string): boolean {
  return /^\d+$/.test(value);
}

/**
 * Check if value is alphanumeric
 */
export function isAlphanumeric(value: string): boolean {
  return /^[a-zA-Z0-9]+$/.test(value);
}

/**
 * Validate file type for tracking uploads
 */
export function isValidTrackingFile(file: File): {
  valid: boolean;
  error?: string;
} {
  const validTypes = ["text/plain", "text/csv", "application/vnd.ms-excel"];
  const validExtensions = [".txt", ".csv"];
  const fileExtension = file.name
    .substring(file.name.lastIndexOf("."))
    .toLowerCase();

  if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
    return {
      valid: false,
      error: "Tipo de archivo inválido. Solo se permiten archivos .txt o .csv",
    };
  }

  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: "El archivo es demasiado grande. Tamaño máximo: 5MB",
    };
  }

  return { valid: true };
}

/**
 * Validate cedula format (Panama)
 */
export function isValidCedula(cedula: string): boolean {
  // Panama cedula format: X-XXX-XXXX or X-XX-XXXX
  return /^\d{1,2}-\d{2,4}-\d{4,5}$/.test(cedula);
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validate phone number (basic)
 */
export function isValidPhone(phone: string): boolean {
  // Allow digits, spaces, dashes, and parentheses
  return /^[\d\s\-\(\)]+$/.test(phone) && phone.replace(/\D/g, "").length >= 7;
}

/**
 * Sanitize string (remove special characters, trim)
 */
export function sanitizeString(str: string): string {
  return str.trim().replace(/[<>]/g, "");
}
