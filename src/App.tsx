import { Routes, Route } from 'react-router-dom'

import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'

import Login from './pages/Login'
import Register from './pages/Register'
import AdminDashboard from './pages/AdminDashboard/AdminDashboard'
import HotelDashboard from './pages/HotelDashboard/HotelDashboard'

function App() {
  return (
    <div className='min-h-screen flex flex-col'>
      <Header />

      {/* Nội dung chính */}
      <main className='flex-1'>
        <Routes>
          <Route
            path='/'
            element={<Home />}
          />

          <Route
            path='/login'
            element={<Login />}
          />

          <Route
            path='/register'
            element={<Register />}
          />

          <Route
            path='/admin/dashboard'
            element={<AdminDashboard />}
          />

          <Route
            path='/hotel/dashboard'
            element={<HotelDashboard />}
          />
        </Routes>
      </main>

      <Footer />
    </div>
  )
}

export default App