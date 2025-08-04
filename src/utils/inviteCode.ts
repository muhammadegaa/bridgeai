/**
 * Invite Code Generation Utilities
 */

// Generate a unique invite code for families
export function generateInviteCode(): string {
  const characters = 'ABCDEFGHIJKLMNPQRSTUVWXYZ123456789'; // Removed O, 0 for clarity
  const codeLength = 8;
  let result = '';
  
  for (let i = 0; i < codeLength; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return result;
}

// Validate invite code format
export function isValidInviteCode(code: string): boolean {
  if (!code || typeof code !== 'string') {
    return false;
  }
  
  // Check length
  if (code.length !== 8) {
    return false;
  }
  
  // Check characters (only alphanumeric, excluding O and 0)
  const validPattern = /^[ABCDEFGHIJKLMNPQRSTUVWXYZ123456789]{8}$/;
  return validPattern.test(code.toUpperCase());
}

// Format invite code for display (add spaces for readability)
export function formatInviteCode(code: string): string {
  if (!isValidInviteCode(code)) {
    return code;
  }
  
  // Add space after 4th character: ABCD EFGH
  return code.replace(/(.{4})(.{4})/, '$1 $2');
}

// Clean invite code input (remove spaces, convert to uppercase)
export function cleanInviteCode(input: string): string {
  if (!input) return '';
  
  return input
    .replace(/\s+/g, '') // Remove all spaces
    .toUpperCase()       // Convert to uppercase
    .slice(0, 8);        // Limit to 8 characters
}