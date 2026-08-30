import type { RouteObject } from 'react-router-dom'

import AdminLayout from '../layouts/AdminLayout'
import ProtectedRoute from '../components/ProtectedRoute'
import AdminCustomers from '../pages/AdminCustomers'
import AdminDashboard from '../pages/AdminDashboard'
import AdminHotels from '../pages/AdminHotels'
import AdminUsers from '../pages/AdminUsers'
//import AdminBookings from '../pages/AdminBookings'

const adminRoutes: RouteObject[] = [
  {
    path: '/admin',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: 'dashboard', element: <AdminDashboard /> },
      { path: 'hotels', element: <AdminHotels /> },
      { path: 'users', element: <AdminUsers /> },
      { path: 'customers', element: <AdminCustomers /> }
      //{ path: 'bookings', element: <AdminBookings /> }
    ]
  }
]

export default adminRoutes