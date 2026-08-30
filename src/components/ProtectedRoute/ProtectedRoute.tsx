import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'

import { useAuth } from '../../contexts/app.context'
import type { UserRole } from '../../types/auth.type'
import path from '../../constants/path'

interface ProtectedRouteProps {
  children: ReactNode
  allowedRoles: UserRole[]
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, role } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to={path.login} state={{ from: location }} replace />
  }

  const normalizedRole = String(role || '').toLowerCase()
  const allowed = allowedRoles.map((r) => String(r).toLowerCase())

  if (!allowed.includes(normalizedRole)) {
    return <Navigate to={path.home} replace />
  }

  return <>{children}</>
}

export default ProtectedRoute