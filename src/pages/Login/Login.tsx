import { useState, useEffect } from 'react'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import { useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'

import authApi from '../../apis/auth.api'
import { useAuth } from '../../contexts/app.context'

const Login = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const { setAuth } = useAuth()

  const [account, setAccount] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    if (params.get('registered') === 'success') {
      setSuccess('Đăng ký thành công, vui lòng đăng nhập để tiếp tục.')
    }
  }, [location.search])

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()

    if (!account.trim() || !password.trim()) {
      setError('Vui lòng nhập đầy đủ email và mật khẩu')
      return
    }

    try {
      setLoading(true)
      setError('')

      // GỌI API LOGIN
      const response = await authApi.login({
        email: account,
        password
      })

      console.log('Login response:', response.data)

      const { user, accessToken } = response.data.data

      // LƯU ACCESS TOKEN + USER VÀO CONTEXT
      setAuth(accessToken, user)

      // CHUYỂN TRANG THEO ROLE
      const role = user.role_code?.toUpperCase()

      if (role === 'ADMIN') {
        navigate('/admin/dashboard')
        return
      }

      if (role === 'HOTEL') {
        navigate('/hotel/dashboard')
        return
      }

      // CUSTOMER
      navigate('/')
    } catch (error: unknown) {
        console.error('[Login UI] request failed', error)

        if (axios.isAxiosError(error)) {
            console.error('[Login UI] axios details', {
              status: error.response?.status,
              data: error.response?.data,
              message: error.message,
            })

            setError(
              error.response?.data?.message ||
              'Đăng nhập thất bại'
            )
        } else {
            setError('Đã xảy ra lỗi không xác định')
        }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className='min-h-screen bg-[#f3f4f6] flex items-start justify-center px-4 py-8'>
      <div className='w-full max-w-[520px] bg-[#fafafa] border border-gray-200 rounded-t-lg shadow-sm'>

        {/* HEADER */}
        <div className='relative flex items-center justify-center py-8'>
          <button
            type='button'
            className='absolute left-8 text-[30px] text-[#64748b] hover:text-[#173f67] transition'
            onClick={() => window.history.back()}
          >
            ←
          </button>

          <h1 className='text-[30px] font-bold text-[#173f67]'>
            Đăng nhập
          </h1>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className='px-8 pb-8'
        >
          {/* ERROR */}
          {error && (
            <div className='mb-5 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-red-600'>
              {error}
            </div>
          )}

          {success && (
            <div className='mb-5 rounded-md bg-green-50 border border-green-200 px-4 py-3 text-green-600'>
              {success}
            </div>
          )}

          {/* EMAIL */}
          <div className='mb-6'>
            <label
              htmlFor='account'
              className='block text-[20px] text-[#374151] mb-2'
            >
              Email
              <span className='text-red-500 ml-1'>*</span>
            </label>

            <input
              id='account'
              type='email'
              value={account}
              onChange={(event) => setAccount(event.target.value)}
              placeholder='Ví dụ: email@gmail.com'
              className='w-full h-[74px] rounded-md border border-[#cbd5e1] bg-white px-5 text-[19px] text-[#374151] placeholder:text-[#64748b] outline-none transition focus:border-[#173f67] focus:ring-1 focus:ring-[#173f67]'
            />
          </div>

          {/* PASSWORD */}
          <div className='mb-7'>
            <label
              htmlFor='password'
              className='block text-[20px] text-[#374151] mb-2'
            >
              Mật khẩu
              <span className='text-red-500 ml-1'>*</span>
            </label>

            <div className='relative'>
              <input
                id='password'
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder='Nhập mật khẩu'
                className='w-full h-[74px] rounded-md border border-[#cbd5e1] bg-white px-5 pr-16 text-[19px] text-[#374151] placeholder:text-[#94a3b8] outline-none transition focus:border-[#173f67] focus:ring-1 focus:ring-[#173f67]'
              />

              <button
                type='button'
                onClick={() => setShowPassword(!showPassword)}
                className='absolute right-5 top-1/2 -translate-y-1/2 text-[#173f67]'
              >
                {showPassword ? (
                  <FaEye size={21} />
                ) : (
                  <FaEyeSlash size={21} />
                )}
              </button>
            </div>
          </div>

          {/* FORGOT PASSWORD */}
          <div className='flex justify-end mb-7'>
            <button
              type='button'
              className='text-[16px] text-[#173f67] hover:underline'
            >
              Quên mật khẩu?
            </button>
          </div>

          {/* LOGIN BUTTON */}
          <button
            type='submit'
            disabled={loading}
            className='w-full h-[70px] rounded-md bg-[#0280ff] text-white text-[24px] font-bold transition hover:bg-[#1612eb] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed'
          >
            {loading
              ? 'Đang đăng nhập...'
              : 'Đăng nhập'}
          </button>

          {/* REGISTER */}
          <div className='text-center mt-6 text-[17px] text-[#4b5563]'>
            Chưa có tài khoản?

            <button
              type='button'
              onClick={() => navigate('/register')}
              className='ml-2 font-semibold text-[#073779] hover:underline'
            >
              Đăng ký
            </button>
          </div>

        </form>
      </div>
    </main>
  )
}

export default Login