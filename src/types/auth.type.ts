export type UserRole =
  | 'ADMIN'
  | 'HOTEL'
  | 'CUSTOMER'
  | 'admin'
  | 'hotel'
  | 'customer'

export interface User {
  id: number
  full_name: string
  email: string
  role_id: number
  role_code: UserRole
}

export interface LoginPayload {
  email: string
  password: string
}

export interface LoginResponse {
  status: 'success'
  data: {
    user: User
    accessToken: string
  }
}

export interface RegisterPayload {
  full_name: string
  email: string
  password: string
  phone?: string
}

export interface RegisterResponse {
  status: 'success'
  data: User
}

export interface RefreshResponse {
  status: 'success'
  data: {
    accessToken: string
  }
}

export interface LogoutResponse {
  status: 'success'
  message: string
}
