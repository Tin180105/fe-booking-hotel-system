import { useState } from 'react'
import axios from 'axios'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'

import authApi from '../../apis/auth.api'

const Register = () => {
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [account, setAccount] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!fullName.trim() || !account.trim() || !password || !confirmPassword) {
      setError('Vui lòng nhập đầy đủ thông tin')
      setSuccess('')
      return
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu nhập lại không khớp')
      setSuccess('')
      return
    }

    try {
      setLoading(true)
      setError('')
      setSuccess('')

      const response = await authApi.register({
        full_name: fullName,
        email: account,
        password,
      })

      if (response.data?.status === 'success') {
        setSuccess('Đăng ký thành công! Bạn sẽ được chuyển đến trang đăng nhập.')
        setTimeout(() => navigate('/login?registered=success'), 1000)
      }
    } catch (err: unknown) {
      console.error('[Register UI] failed', err)

      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Đăng ký thất bại')
      } else {
        setError('Đã xảy ra lỗi không xác định khi đăng ký')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className='min-h-screen bg-[#f3f4f6] flex justify-center px-4 py-8'>
      <div className='w-full max-w-[520px] bg-[#fafafa] border border-gray-200 rounded-lg shadow-sm'>

        {/* HEADER */}
        <div className='relative flex items-center justify-center py-8'>
          <button
            type='button'
            onClick={() => navigate(-1)}
            className='absolute left-8 text-[30px] text-[#64748b] hover:text-[#173f67]'
          >
            ←
          </button>

          <h1 className='text-[30px] font-bold text-[#173f67]'>
            Đăng ký
          </h1>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className='px-8 pb-8'
        >
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

          {/* FULL NAME */}
          <div className='mb-6'>
            <label
              htmlFor='fullName'
              className='block text-[20px] text-[#374151] mb-2'
            >
              Họ tên
              <span className='text-red-500 ml-1'>*</span>
            </label>

            <input
              id='fullName'
              type='text'
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder='Ví dụ: Nguyen Van A'
              className='w-full h-[74px] rounded-md border border-[#cbd5e1] bg-white px-5 text-[19px] outline-none focus:border-[#173f67]'
            />
          </div>

          {/* EMAIL / PHONE */}
          <div className='mb-6'>
            <label
              htmlFor='account'
              className='block text-[20px] text-[#374151] mb-2'
            >
              Email / Số điện thoại di động
              <span className='text-red-500 ml-1'>*</span>
            </label>

            <input
              id='account'
              type='text'
              value={account}
              onChange={(event) => setAccount(event.target.value)}
              placeholder='Ví dụ: 0901234567 hoặc email@gmail.com'
              className='w-full h-[74px] rounded-md border border-[#cbd5e1] bg-white px-5 text-[19px] outline-none focus:border-[#173f67]'
            />
          </div>

          {/* PASSWORD */}
          <div className='mb-6'>
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
                className='w-full h-[74px] rounded-md border border-[#cbd5e1] bg-white px-5 pr-16 text-[19px] outline-none focus:border-[#173f67]'
              />

              <button
                type='button'
                onClick={() => setShowPassword(!showPassword)}
                className='absolute right-5 top-1/2 -translate-y-1/2 text-[#173f67]'
              >
                {showPassword ? <FaEye /> : <FaEyeSlash />}
              </button>
            </div>
          </div>

          {/* CONFIRM PASSWORD */}
          <div className='mb-8'>
            <label
              htmlFor='confirmPassword'
              className='block text-[20px] text-[#374151] mb-2'
            >
              Nhập lại mật khẩu
              <span className='text-red-500 ml-1'>*</span>
            </label>

            <div className='relative'>
              <input
                id='confirmPassword'
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className='w-full h-[74px] rounded-md border border-[#cbd5e1] bg-white px-5 pr-16 text-[19px] outline-none focus:border-[#173f67]'
              />

              <button
                type='button'
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className='absolute right-5 top-1/2 -translate-y-1/2 text-[#173f67]'
              >
                {showConfirmPassword ? (
                  <FaEye />
                ) : (
                  <FaEyeSlash />
                )}
              </button>
            </div>
          </div>

          {/* REGISTER BUTTON */}
          <button
            type='submit'
            disabled={loading}
            className='w-full h-[70px] rounded-md bg-[#0280ff] text-white text-[24px] font-bold hover:bg-[#1612eb] transition disabled:opacity-60 disabled:cursor-not-allowed'
          >
            {loading ? 'Đang đăng ký...' : 'Đăng ký'}
          </button>

          {/* LOGIN */}
          <div className='text-center mt-6 text-[17px] text-[#4b5563]'>
            Đã có tài khoản?

            <button
              type='button'
              onClick={() => navigate('/login')}
              className='ml-2 font-semibold text-[#073779] hover:underline'
            >
              Đăng nhập
            </button>
          </div>

        </form>
      </div>
    </main>
  )
}

export default Register