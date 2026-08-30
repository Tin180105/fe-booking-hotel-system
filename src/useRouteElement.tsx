import { useRoutes } from 'react-router-dom'

import publicRoutes from './routes/public.routes'
import adminRoutes from './routes/admin.routes'

export default function useRouteElement() {
  return useRoutes([...publicRoutes, ...adminRoutes])
}