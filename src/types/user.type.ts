export interface AdminUser {
  id: number
  role_id: number
  hotel_id: number | null
  full_name: string
  email: string
  phone: string | null
  status: string
  created_at: string
  role_code: string
  role_name: string
  hotel_name: string | null
}

export interface AdminUserListResponse {
  status: 'success'
  data: AdminUser[]
}

export interface UpdateUserRequest {
  full_name?: string
  email?: string
  phone?: string | null
  hotel_id?: number | null
  role_code?: string
}

export interface UpdatedUserBasic {
  id: number
  role_id: number
  hotel_id: number | null
  full_name: string
  email: string
  phone: string | null
  status: string
}

export interface UpdateUserResponse {
  status: 'success'
  data: UpdatedUserBasic
}

export interface DeleteUserResponse {
  status: 'success'
  message: string
}

export interface RoleOption {
  id: number
  name: string
  code: string
}

export interface CreateUserRequest {
  full_name: string
  email: string
  password: string
  phone?: string
  role_code: string
  hotel_id?: number | null
}

export interface CreateUserResponse {
  status: 'success'
  data: UpdatedUserBasic
}