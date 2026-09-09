import { useEffect, useState } from 'react'
import axios from 'axios'

import bookingApi, { type BookingByHotelRow } from '../../apis/booking.api'
import { useAuth } from '../../contexts/app.context'

const statusLabel: Record<string, { text: string; className: string }> = {
  PENDING: { text: 'Chờ xác nhận', className: 'bg-amber-50 text-amber-600' },
  CONFIRMED: { text: 'Đã xác nhận', className: 'bg-blue-50 text-blue-600' },
  CANCELLED: { text: 'Đã hủy', className: 'bg-red-50 text-red-600' },
  COMPLETED: { text: 'Hoàn tất', className: 'bg-emerald-50 text-emerald-600' }
}

const HotelBookings = () => {
  const { profile } = useAuth()
  const hotelId = profile?.hotel_id

  const [bookings, setBookings] = useState<BookingByHotelRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchBookings = async () => {
    if (!hotelId) return
    try {
      setLoading(true)
      setError('')
      const res = await bookingApi.getByHotelId(hotelId)
      setBookings(res.data?.data || [])
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Không thể tải danh sách đặt phòng')
      } else {
        setError('Đã xảy ra lỗi không xác định')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [hotelId])

  return (
    <div className='p-8'>
      <div className='mb-6'>
        <p className='mb-1 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600'>Hotel</p>
        <h1 className='text-3xl font-bold text-slate-800'>Khách hàng & đặt phòng</h1>
      </div>

      {error && (
        <div className='mb-6 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-red-600'>{error}</div>
      )}

      <div className='rounded-xl bg-white shadow-sm ring-1 ring-slate-200 overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full text-left text-sm'>
            <thead className='bg-slate-50 text-slate-500'>
              <tr>
                <th className='px-6 py-3 font-medium'>Mã đặt phòng</th>
                <th className='px-6 py-3 font-medium'>Khách hàng</th>
                <th className='px-6 py-3 font-medium'>Email</th>
                <th className='px-6 py-3 font-medium'>SĐT</th>
                <th className='px-6 py-3 font-medium'>Tổng tiền</th>
                <th className='px-6 py-3 font-medium'>Trạng thái</th>
                <th className='px-6 py-3 font-medium'>Ngày tạo</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-100'>
              {loading && (
                <tr><td colSpan={7} className='px-6 py-6 text-center text-slate-400'>Đang tải dữ liệu...</td></tr>
              )}
              {!loading && bookings.length === 0 && !error && (
                <tr><td colSpan={7} className='px-6 py-6 text-center text-slate-400'>Chưa có đặt phòng nào</td></tr>
              )}
              {!loading && bookings.map((b) => {
                const status = statusLabel[b.status] || { text: b.status, className: 'bg-slate-100 text-slate-500' }
                return (
                  <tr key={b.id} className='hover:bg-slate-50'>
                    <td className='px-6 py-3 font-medium text-slate-800'>{b.booking_code}</td>
                    <td className='px-6 py-3 text-slate-600'>{b.customer_name}</td>
                    <td className='px-6 py-3 text-slate-600'>{b.customer_email}</td>
                    <td className='px-6 py-3 text-slate-600'>{b.customer_phone || '—'}</td>
                    <td className='px-6 py-3 text-slate-600'>
                      {new Intl.NumberFormat('vi-VN').format(b.final_amount)} đ
                    </td>
                    <td className='px-6 py-3'>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${status.className}`}>
                        {status.text}
                      </span>
                    </td>
                    <td className='px-6 py-3 text-slate-500'>
                      {new Date(b.created_at).toLocaleDateString('vi-VN')}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default HotelBookings