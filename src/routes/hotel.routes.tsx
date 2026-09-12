import type { RouteObject } from 'react-router-dom'

import HotelLayout from '../layouts/HotelLayout'
import ProtectedRoute from '../components/ProtectedRoute'
import HotelDashboard from '../pages/HotelDashboard'
import HotelRoomTypes from '../pages/HotelRoomTypes'
import HotelAmenities from '../pages/HotelAmenities'
import HotelBookings from '../pages/HotelBookings'
import HotelPayouts from '../pages/HotelPayouts'

const hotelRoutes: RouteObject[] = [
  {
    path: '/hotel',
    element: (
      <ProtectedRoute allowedRoles={['hotel']}>
        <HotelLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: 'dashboard', element: <HotelDashboard /> },
      { path: 'rooms', element: <HotelRoomTypes /> },
      { path: 'amenities', element: <HotelAmenities /> },
      { path: 'bookings', element: <HotelBookings /> },
      { path: 'payouts', element: <HotelPayouts /> }
    ]
  }
]

export default hotelRoutes