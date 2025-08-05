export interface PasswordValidation {
  isValid: boolean;
  errors: string[];
  score: number;
}

export function validatePasswordClient(password: string): PasswordValidation {
  const errors: string[] = [];
  let score = 0;

  // Minimum length
  if (password.length < 12) {
    errors.push('Pelo menos 12 caracteres');
  } else {
    score += 20;
  }

  // Uppercase letter
  if (!/[A-Z]/.test(password)) {
    errors.push('Pelo menos uma letra maiúscula');
  } else {
    score += 20;
  }

  // Lowercase letter
  if (!/[a-z]/.test(password)) {
    errors.push('Pelo menos uma letra minúscula');
  } else {
    score += 20;
  }

  // Number
  if (!/[0-9]/.test(password)) {
    errors.push('Pelo menos um número');
  } else {
    score += 20;
  }

  // Special character
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Pelo menos um caractere especial (!@#$%^&*(),.?":{}|<>)');
  } else {
    score += 20;
  }

  // Additional scoring for length
  if (password.length >= 16) score += 10;
  if (password.length >= 20) score += 10;

  return {
    isValid: errors.length === 0,
    errors,
    score: Math.min(score, 100)
  };
}

export function getPasswordStrengthLabel(score: number): string {
  if (score < 40) return 'Muito fraca';
  if (score < 60) return 'Fraca';
  if (score < 80) return 'Média';
  if (score < 90) return 'Forte';
  return 'Muito forte';
}

export function getPasswordStrengthColor(score: number): string {
  if (score < 40) return 'text-red-500';
  if (score < 60) return 'text-orange-500';
  if (score < 80) return 'text-yellow-500';
  if (score < 90) return 'text-blue-500';
  return 'text-green-500';
}