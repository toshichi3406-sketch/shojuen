/**
 * Company contact. Default: info@ochanoshojuen.com.
 * Optional override: `NEXT_PUBLIC_CONTACT_EMAIL` (e.g. staging).
 */
export function getContactEmail(): string {
  const v = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim()
  if (v) return v
  return "info@ochanoshojuen.com"
}
