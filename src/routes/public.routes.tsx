import type { RouteObject } from 'react-router-dom'

import PublicLayout from '../layouts/PublicLayout'

import Home from '../pages/Home'
import Login from '../pages/Login'
import Register from '../pages/Register'
import SearchResults from '../pages/SearchResults/SearchResults'
import Rooms from '../pages/Rooms/Rooms'
import RoomConfirmation from '../pages/RoomConfirmation/RoomConfirmation'
import Promotions from '../pages/Promotions'
import Payment from '../pages/Payment'
import Bookings from '../pages/Bookings/Bookings'
import BookingDetail from '../pages/BookingDetail/BookingDetail'

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
        path: '/room-confirmation',
        element: <RoomConfirmation />
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
        path: '/bookings',
        element: <Bookings />
      },

      {
        path: '/bookings/:id',
        element: <BookingDetail />
      },

    ]
  }
]

export default publicRoutes