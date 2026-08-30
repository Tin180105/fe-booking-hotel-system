import type { RouteObject } from 'react-router-dom'

import PublicLayout from '../layouts/PublicLayout'
import ProtectedRoute from '../components/ProtectedRoute'

import Login from '../pages/Login'
import Register from '../pages/Register'
import HotelDashboard from '../pages/HotelDashboard/HotelDashboard'

import path from '../constants/path'

const publicRoutes: RouteObject[] = [
  {
    element: <PublicLayout />,
    children: [
      { path: path.home, element: <div>Trang chủ</div> },
      { path: path.login, element: <Login /> },
      { path: path.register, element: <Register /> },
      {
        path: path.hotelDashboard,
        element: (
          <ProtectedRoute allowedRoles={['hotel', 'admin']}>
            <HotelDashboard />
          </ProtectedRoute>
        )
      }
    ]
  }
]

export default publicRoutes