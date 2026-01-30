// Authorized users who can access the app
export const ALLOWED_EMAILS = [
  'ben@kernioncognitivelabs.com',
  'lumen@kernioncognitivelabs.com',
];

export function isAllowedEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return ALLOWED_EMAILS.includes(email.toLowerCase());
}
