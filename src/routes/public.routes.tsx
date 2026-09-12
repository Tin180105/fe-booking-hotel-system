import type { RouteObject } from 'react-router-dom'

import PublicLayout from '../layouts/PublicLayout'
import ProtectedRoute from '../components/ProtectedRoute'

import Home from '../pages/Home'
import Login from '../pages/Login'
import Register from '../pages/Register'
import HotelDashboard from '../pages/HotelDashboard/HotelDashboard'
import SearchResults from '../pages/SearchResults/SearchResults'
import Rooms from '../pages/Rooms/Rooms'
import Promotions from '../pages/Promotions'
import Payment from '../pages/Payment'
import Bookings from '../pages/Bookings/Bookings'

import path from '../constants/path'

const publicRoutes: RouteObject[] = [
  {
    element: <PublicLayout />,
    children: [
      {
        path: path.home,
        element: <Home />
      },

      {
        path: path.login,
        element: <Login />
      },

      {
        path: path.register,
        element: <Register />
      },

      /* Trang tìm kiếm khách sạn */
      {
        path: path.search,
        element: <SearchResults />
      },

      {
        path: path.rooms,
        element: <Rooms />
      },

      { 
        path: '/promotions',
        element: <Promotions />
      },

      {
        path: '/payment',
        element: <Payment />
      },

      {
        path: path.bookings,
        element: <Bookings />
      },

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