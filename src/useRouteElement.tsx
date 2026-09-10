import { useRoutes } from 'react-router-dom'

import publicRoutes from './routes/public.routes'
import adminRoutes from './routes/admin.routes'
import hotelRoutes from './routes/hotel.routes'

export default function useRouteElement() {
  return useRoutes([...publicRoutes, ...adminRoutes, ...hotelRoutes])
}