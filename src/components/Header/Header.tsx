import { useState } from 'react'

import {
  FaUserCircle,
  FaPhoneAlt,
  FaClock
} from 'react-icons/fa'

import { useNavigate } from 'react-router-dom'
import { FiChevronDown } from 'react-icons/fi'
import { HiOutlineDotsHorizontal } from 'react-icons/hi'

import { useAuth } from '../../contexts/app.context'

const Header = () => {
  const [isAccountOpen, setIsAccountOpen] = useState(false)
  const navigate = useNavigate()
  const { isAuthenticated, profile, logout } = useAuth()

  const displayName = profile?.full_name || 'Tài khoản'

  return (
    <header className='bg-[#173f67] text-white h-[82px]'>
      <div className='max-w-[1450px] h-full mx-auto px-6 flex items-center justify-between'>

        {/* LEFT */}
        <div className='flex items-center h-full'>

          {/* LOGO */}
          <div className='mr-10'>
            <a href='/'>
              <div className='leading-none'>
                <div className='text-[34px] font-bold tracking-tight'>
                  <span className='text-[#5dc4d4]'>StayFlow</span>
                </div>

                <div className='text-[22px] text-[#5dc4d4] text-right'>
                  .com
                </div>
              </div>
            </a>
          </div>

          {/* NAVIGATION */}
          <nav className='h-full flex items-center gap-1'>
            <a
              href='/'
              className='h-full flex items-center px-5 text-[22px] font-medium text-[#6ac2d4] border-b-[3px] border-[#ff9d1c]'
            >
              Khách sạn
            </a>

            <a
              href='/tour'
              className='h-full flex items-center px-5 text-[22px] font-medium hover:text-[#6ac2d4] transition'
            >
              Địa điểm
            </a>

            <a
              href='/flights'
              className='h-full flex items-center px-5 text-[22px] font-medium hover:text-[#6ac2d4] transition'
            >
              Ưu đãi
            </a>

            <button
              type='button'
              className='px-5 hover:text-[#6ac2d4]'
            >
              <HiOutlineDotsHorizontal size={28} />
            </button>
          </nav>
        </div>

        {/* RIGHT */}
        <div className='flex items-center h-full gap-10'>

          {/* ACCOUNT */}
          <div className='relative h-full flex items-center'>

            {/* BUTTON TÀI KHOẢN */}
            <button
              type='button'
              onClick={() => setIsAccountOpen(!isAccountOpen)}
              className='flex items-center gap-2 text-[22px] cursor-pointer'
            >
              <FaUserCircle
                size={38}
                className='text-[#f3f3f3]'
              />

              <span className='max-w-[180px] truncate'>{isAuthenticated ? displayName : 'Tài khoản'}</span>

              <FiChevronDown
                size={24}
                className={`transition-transform duration-200 ${
                  isAccountOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* DROPDOWN */}
            {isAccountOpen && (
              <div className='absolute top-[72px] right-0 w-[275px] bg-white p-3 shadow-lg z-50'>

                {/* MŨI TÊN */}
                <div className='absolute -top-2 right-[120px] w-4 h-4 bg-white rotate-45' />

                <div className='relative flex flex-col gap-3'>
                  {isAuthenticated ? (
                    <>
                      <div className='rounded-md bg-slate-50 px-3 py-2 text-[18px] font-medium text-slate-700'>
                        {displayName}
                      </div>

                      <button
                        type='button'
                        onClick={() => {
                          logout()
                          setIsAccountOpen(false)
                          navigate('/login')
                        }}
                        className='w-full bg-[#4bb4c6] text-white py-3 rounded-md text-[18px] font-semibold hover:bg-[#123452] transition'
                      >
                        Đăng xuất
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type='button'
                        onClick={() => {
                          setIsAccountOpen(false)
                          navigate('/login')
                        }}
                        className='w-full bg-[#4bb4c6] text-white py-3 rounded-md text-[18px] font-semibold hover:bg-[#123452] transition'
                      >
                        Đăng nhập
                      </button>

                      <button
                        type='button'
                        onClick={() => {
                          setIsAccountOpen(false)
                          navigate('/register')
                        }}
                        className='w-full bg-[#4bb4c6] text-white py-3 rounded-md text-[18px] font-semibold hover:bg-[#123452] transition'
                      >
                        Đăng ký
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

          </div>

          {/* CONTACT */}
          <div className='flex items-start gap-3'>
            <FaPhoneAlt
              size={25}
              className='text-[#ff9d1c] mt-1'
            />

            <div>
              <div className='text-[#ff9d1c] text-[32px] font-bold tracking-wide leading-none'>
                1900 1870
              </div>

              <div className='flex items-center justify-center gap-1 mt-2 text-[16px]'>
                <FaClock size={15} />
                <span>7h30 → 21h</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </header>
  )
}

export default Header