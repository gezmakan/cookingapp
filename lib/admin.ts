// Admin configuration
const SUPER_ADMIN_EMAIL = 'slmxyz@gmail.com'

export function isAdmin(email: string | undefined): boolean {
  if (!email) return false
  return email === SUPER_ADMIN_EMAIL
}

export function isSuperAdmin(email: string | undefined): boolean {
  return isAdmin(email)
}
