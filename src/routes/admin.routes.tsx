import type { RouteObject } from 'react-router-dom'

import AdminLayout from '../layouts/AdminLayout'
import ProtectedRoute from '../components/ProtectedRoute'

import AdminDashboard from '../pages/AdminDashboard'

const adminRoutes: RouteObject[] = [
  {
    path: '/admin',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: 'dashboard', element: <AdminDashboard /> }
      // sau này thêm: { path: 'hotels', element: <AdminHotels /> }
      // sau này thêm: { path: 'users', element: <AdminUsers /> }
    ]
  }
]

export default adminRoutes