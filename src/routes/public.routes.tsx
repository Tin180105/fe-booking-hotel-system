import type { RouteObject } from 'react-router-dom'

import PublicLayout from '../layouts/PublicLayout'

import Home from '../pages/Home'
import Login from '../pages/Login'
import Register from '../pages/Register'
import SearchResults from '../pages/SearchResults/SearchResults'
import Rooms from '../pages/Rooms/Rooms'
import Promotions from '../pages/Promotions'
import Payment from '../pages/Payment'

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
        path: path.promotions,
        element: <Promotions />
      },

      {
        path: path.payment,
        element: <Payment />
      },

<<<<<<< HEAD
=======
      {
        path: path.bookings,
        element: <Bookings />
      },
>>>>>>> 4b2519013d02ee04ad60dd3a792fd0953cb2be92
    ]
  }
]

export default publicRoutes