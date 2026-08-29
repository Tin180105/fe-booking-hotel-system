import http from '../utils/axios.http'

import type {
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  RegisterResponse,
  RefreshResponse,
  LogoutResponse
} from '../types/auth.type'

export const URL_LOGIN = '/auth/login'
export const URL_REGISTER = '/auth/register'
export const URL_REFRESH = '/auth/refresh-token'
export const URL_LOGOUT = '/auth/logout'

const authApi = {
  register(body: RegisterPayload) {
    return http.post<RegisterResponse>(
      URL_REGISTER,
      body
    )
  },

  login(body: LoginPayload) {
    return http.post<LoginResponse>(
      URL_LOGIN,
      body
    )
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
  }
}

export default authApi