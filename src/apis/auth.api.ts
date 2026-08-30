import http from '../utils/axios.http'

import type {
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  RegisterResponse,
  RefreshResponse,
  LogoutResponse
} from '../types/auth.type'

import type {
  AdminUserListResponse,
  UpdateUserRequest,
  UpdateUserResponse,
  DeleteUserResponse
} from '../types/user.type'

export const URL_LOGIN = '/auth/login'
export const URL_REGISTER = '/auth/register'
export const URL_REFRESH = '/auth/refresh-token'
export const URL_LOGOUT = '/auth/logout'
export const URL_USERS = '/auth/users'

const authApi = {
  register(body: RegisterPayload) {
    return http.post<RegisterResponse>(URL_REGISTER, body)
  },

  login(body: LoginPayload) {
    return http.post<LoginResponse>(URL_LOGIN, body)
  },

  refreshToken(refreshToken?: string) {
    return http.post<RefreshResponse>(
      URL_REFRESH,
      refreshToken ? { refreshToken } : {}
    )
  },

  logout(refreshToken?: string) {
    return http.post<LogoutResponse>(
      URL_LOGOUT,
      refreshToken ? { refreshToken } : {}
    )
  },

  getUsers(roleCode?: string) {
    return http.get<AdminUserListResponse>(URL_USERS, {
      params: roleCode ? { role: roleCode } : undefined
    })
  },

  updateUser(id: number, body: UpdateUserRequest) {
    return http.patch<UpdateUserResponse>(`${URL_USERS}/${id}`, body)
  },

  deleteUser(id: number) {
    return http.delete<DeleteUserResponse>(`${URL_USERS}/${id}`)
  }
}

export default authApi