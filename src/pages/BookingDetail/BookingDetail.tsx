import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import { FiArrowLeft, FiCalendar, FiCheckCircle, FiMapPin, FiUsers } from 'react-icons/fi'
import bookingApi, { type BookingDetail as BookingDetailData } from '../../apis/booking.api'

const statusText: Record<string, string> = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  COMPLETED: 'Đã hoàn thành',
  CANCELLED: 'Đã hủy'
}

const BookingDetail = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [booking, setBooking] = useState<BookingDetailData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchBooking = async () => {
      if (!id) {
        setError('Không tìm thấy mã đặt phòng.')
        setLoading(false)
        return
      }

      try {
        const response = await bookingApi.getById(Number(id))
        setBooking(response.data.data)
      } catch (requestError: unknown) {
        if (axios.isAxiosError(requestError)) {
          setError(requestError.response?.data?.message || 'Không thể tải vé đặt phòng.')
        } else {
          setError('Không thể tải vé đặt phòng.')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchBooking()
  }, [id])

  const formatPrice = (price: number) => `${Number(price).toLocaleString('vi-VN')}đ`
  const formatDate = (date: string) => new Date(date).toLocaleDateString('vi-VN')

  if (loading) {
    return <main className='min-h-screen bg-[#f5f7fa] px-6 py-16 text-center text-slate-500'>Đang tải vé đặt phòng...</main>
  }

  if (error || !booking) {
    return (
      <main className='min-h-screen bg-[#f5f7fa] px-6 py-16'>
        <div className='mx-auto max-w-2xl rounded-2xl bg-white p-10 text-center shadow-sm'>
          <p className='text-red-600'>{error || 'Không tìm thấy vé đặt phòng.'}</p>
          <button type='button' onClick={() => navigate('/bookings')} className='mt-6 rounded-lg bg-[#173f67] px-5 py-3 font-semibold text-white'>
            Quay lại vé đã đặt
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className='min-h-screen bg-[#f5f7fa] px-6 py-8'>
      <div className='mx-auto max-w-4xl'>
        <button type='button' onClick={() => navigate('/bookings')} className='mb-6 inline-flex items-center gap-2 font-semibold text-[#173f67]'>
          <FiArrowLeft /> Quay lại vé đã đặt
        </button>

        <section className='overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm'>
          <div className='flex flex-col gap-4 border-b border-slate-100 bg-[#173f67] px-6 py-6 text-white sm:flex-row sm:items-center sm:justify-between'>
            <div>
              <p className='text-sm text-blue-100'>Vé đặt phòng</p>
              <h1 className='mt-1 text-2xl font-bold'>{booking.booking_code}</h1>
            </div>
            <span className='rounded-full bg-white/15 px-4 py-2 text-sm font-semibold'>{statusText[booking.status] || booking.status}</span>
          </div>

          <div className='grid gap-8 p-6 md:grid-cols-[1fr_280px]'>
            <div>
              <h2 className='text-2xl font-bold text-[#173f67]'>{booking.hotel_name}</h2>
              <p className='mt-2 flex items-center gap-2 text-slate-500'><FiMapPin /> Thông tin đặt phòng của bạn</p>

              <div className='mt-6 space-y-4'>
                {booking.rooms.map((room) => (
                  <div key={room.id} className='rounded-xl border border-slate-200 p-4'>
                    <h3 className='font-bold text-slate-800'>{room.room_type_name}</h3>
                    <div className='mt-3 grid gap-3 text-sm text-slate-600 sm:grid-cols-2'>
                      <span className='flex items-center gap-2'><FiCalendar /> Nhận phòng: {formatDate(room.expected_check_in)}</span>
                      <span className='flex items-center gap-2'><FiCalendar /> Trả phòng: {formatDate(room.expected_check_out)}</span>
                      <span className='flex items-center gap-2'><FiUsers /> Số phòng: {room.quantity}</span>
                      <span className='flex items-center gap-2'><FiCheckCircle /> {formatPrice(room.total_room_price)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <aside className='h-fit rounded-xl bg-slate-50 p-5'>
              <h2 className='text-lg font-bold text-[#173f67]'>Tóm tắt thanh toán</h2>
              <div className='mt-4 space-y-3 border-b border-slate-200 pb-4 text-sm'>
                <div className='flex justify-between'><span className='text-slate-500'>Tạm tính</span><strong>{formatPrice(booking.total_amount)}</strong></div>
                <div className='flex justify-between'><span className='text-slate-500'>Phí dịch vụ</span><strong>{formatPrice(booking.commission_amount)}</strong></div>
              </div>
              <div className='mt-4 flex justify-between text-lg font-bold text-[#ff9d1c]'>
                <span>Tổng tiền</span>
                <span>{formatPrice(booking.final_amount)}</span>
              </div>
            </aside>
          </div>

          <div className='border-t border-slate-100 px-6 py-5 text-sm text-slate-500'>
            Người đặt: <strong className='text-slate-700'>{booking.customer_name}</strong> · {booking.customer_email} · {booking.customer_phone}
          </div>
        </section>
      </div>
    </main>
  )
}

export default BookingDetail
