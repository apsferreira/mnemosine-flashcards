export interface User {
  id: string
  tenant_id: string
  email: string
  full_name: string
  avatar_url?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface OTPResponse {
  message: string
}

export interface AuthResponse {
  access_token: string
  refresh_token: string
  user: User
  roles: string[]
  permissions: Record<string, string[]>
}
