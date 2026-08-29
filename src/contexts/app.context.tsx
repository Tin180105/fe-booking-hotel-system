/* eslint-disable react-refresh/only-export-components */

import {
  createContext,
  useContext,
  useState,
  type ReactNode
} from 'react'

import type { User, UserRole } from '../types/auth.type'

import {
  getAccessTokenFromLS,
  setAccessTokenToLS,
  getProfileFromLS,
  setProfileToLS,
  clearLS
} from '../utils/auth'

interface AuthState {
  isAuthenticated: boolean
  profile: User | null
  role: UserRole | null

  setAuth: (
    accessToken: string,
    user: User
  ) => void

  logout: () => void
}

export const AuthContext = createContext<AuthState | undefined>(
  undefined
)

export function AuthProvider({
  children
}: {
  children: ReactNode
}) {
  const [profile, setProfile] = useState<User | null>(
    getProfileFromLS()
  )

  const [isAuthenticated, setIsAuthenticated] = useState(
    Boolean(getAccessTokenFromLS())
  )

  // Đăng nhập thành công
  const setAuth = (
    accessToken: string,
    user: User
  ) => {
    // Lưu access token
    setAccessTokenToLS(accessToken)

    // Lưu thông tin user
    setProfileToLS(user)

    // Cập nhật state
    setProfile(user)
    setIsAuthenticated(true)
  }

  // Đăng xuất
  const logout = () => {
    clearLS()

    setProfile(null)
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        profile,
        role: profile?.role_code ?? null,
        setAuth,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error(
      'useAuth must be used inside AuthProvider'
    )
  }

  return context
}