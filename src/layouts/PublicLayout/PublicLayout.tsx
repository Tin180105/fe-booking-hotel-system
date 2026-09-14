import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'

import Header from '../../components/Header'
import Footer from '../../components/Footer'

const PublicLayout = () => {
  const location = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [location.pathname])

  return (
    <div className='min-h-screen flex flex-col'>
      <Header />
      <main className='flex-1'>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default PublicLayout