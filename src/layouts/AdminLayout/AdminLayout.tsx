import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  MdDashboard,
  MdHotel,
  MdPeople,
  MdBookOnline,
  MdLogout,
  MdMenu,
  MdClose
} from 'react-icons/md'

import { useAuth } from '../../contexts/app.context'
import path from '../../constants/path'

const menuItems = [
  { label: 'Tổng quan', icon: MdDashboard, to: path.adminDashboard },
  { label: 'Người dùng', icon: MdPeople, to: path.adminUsers },
  { label: 'Khách sạn', icon: MdHotel, to: path.adminHotels },
  { label: 'Đặt phòng', icon: MdBookOnline, to: path.adminBookings }
]

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const { profile, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate(path.login)
  }

  return (
    <div className='min-h-screen flex bg-slate-100'>
      {/* SIDEBAR */}
      <aside
        className={`${
          collapsed ? 'w-[80px]' : 'w-[260px]'
        } shrink-0 bg-[#173f67] text-white transition-all duration-200 flex flex-col`}
      >
        <div className='h-[70px] flex items-center justify-center border-b border-white/10'>
          {collapsed ? (
            <span className='text-[26px] font-bold'>
              i<span className='text-[#5dc4d4]'>V</span>
            </span>
          ) : (
            <span className='text-[26px] font-bold leading-none text-center'>
              i<span className='text-[#5dc4d4]'>VIVU</span>
              <span className='block text-[13px] font-normal text-white/60'>Admin</span>
            </span>
          )}
        </div>

        <nav className='flex-1 py-4'>
          {menuItems.map((item) => {
            const Icon = item.icon

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-6 py-3 text-[16px] transition ${
                    isActive
                      ? 'bg-white/10 border-r-[3px] border-[#ff9d1c] text-white font-semibold'
                      : 'text-white/70 hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                <Icon size={22} />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            )
          })}
        </nav>

        <button
          type='button'
          onClick={handleLogout}
          className='flex items-center gap-3 px-6 py-4 text-[15px] text-white/70 hover:bg-white/5 hover:text-white border-t border-white/10'
        >
          <MdLogout size={20} />
          {!collapsed && <span>Đăng xuất</span>}
        </button>
      </aside>

      {/* MAIN */}
      <div className='flex-1 flex flex-col min-w-0'>
        <header className='h-[70px] bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0'>
          <button
            type='button'
            onClick={() => setCollapsed(!collapsed)}
            className='text-slate-500 hover:text-slate-800 transition'
          >
            {collapsed ? <MdMenu size={24} /> : <MdClose size={24} />}
          </button>

          <div className='flex items-center gap-3'>
            <div className='w-9 h-9 rounded-full bg-[#173f67] text-white flex items-center justify-center font-semibold'>
              {(profile?.full_name || 'A').charAt(0).toUpperCase()}
            </div>
            <span className='text-[15px] font-medium text-slate-700'>
              {profile?.full_name || 'Quản trị viên'}
            </span>
          </div>
        </header>

        <main className='flex-1 overflow-y-auto'>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout