/**
 * Validation utilities for email and phone number requirements.
 */

export interface EmailValidationResult {
  isValid: boolean;
  error?: string;
  isTypo?: boolean;
}

export interface PhoneValidationResult {
  isValid: boolean;
  digits: string;
  error?: string;
}

/**
 * Validates that an email ends with @gmail.com and detects common typos like @gamil.com.
 */
export const validateGmail = (email: string): EmailValidationResult => {
  const trimmed = (email || '').trim();
  if (!trimmed) {
    return { isValid: false, error: 'Email address is required.' };
  }

  const lower = trimmed.toLowerCase();

  // Explicit check for @gamil.com spelling error
  if (lower.includes('@gamil.com') || lower.endsWith('@gamil.com')) {
    return {
      isValid: false,
      isTypo: true,
      error: 'Spelling error detected: You typed "@gamil.com". Please correct it to "@gmail.com".'
    };
  }

  // Check other common Gmail typos
  if (lower.includes('@gmial.com') || lower.endsWith('@gmial.com')) {
    return {
      isValid: false,
      isTypo: true,
      error: 'Spelling error detected: You typed "@gmial.com". Please correct it to "@gmail.com".'
    };
  }
  if (lower.includes('@gmai.com') || lower.endsWith('@gmai.com')) {
    return {
      isValid: false,
      isTypo: true,
      error: 'Spelling error detected: You typed "@gmai.com". Please correct it to "@gmail.com".'
    };
  }
  if (lower.includes('@gmaill.com') || lower.endsWith('@gmaill.com')) {
    return {
      isValid: false,
      isTypo: true,
      error: 'Spelling error detected: You typed "@gmaill.com". Please correct it to "@gmail.com".'
    };
  }

  // Must end with @gmail.com
  if (!lower.endsWith('@gmail.com')) {
    return {
      isValid: false,
      error: 'Email address must end with @gmail.com.'
    };
  }

  // Check full regex: must have characters before @gmail.com
  const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i;
  if (!gmailRegex.test(trimmed)) {
    return {
      isValid: false,
      error: 'Please enter a valid Gmail address (e.g. yourname@gmail.com).'
    };
  }

  return { isValid: true };
};

/**
 * Validates that phone number consists of exactly 10 digits.
 */
export const validatePhone10 = (phone: string): PhoneValidationResult => {
  const digits = (phone || '').replace(/\D/g, '');
  if (digits.length === 0) {
    return {
      isValid: false,
      digits,
      error: 'Phone number is required.'
    };
  }

  if (digits.length !== 10) {
    return {
      isValid: false,
      digits,
      error: `Phone number count must be exactly 10 digits (currently ${digits.length}).`
    };
  }

  return {
    isValid: true,
    digits
  };
};
