import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  FiCalendar,
  FiMapPin,
  FiUsers,
  FiChevronRight,
  FiClock,
  FiXCircle
} from 'react-icons/fi'
import bookingApi, { type BookingOverviewRow } from '../../apis/booking.api'
import { useAuth } from '../../contexts/app.context'

interface Booking {
  id: number
  bookingCode: string
  hotelName: string
  hotelAddress: string
  roomName: string
  image: string
  checkIn: string
  checkOut: string
  rawCheckIn: string
  rawCheckOut: string
  rooms: number
  guests: number
  totalPrice: number
  rawStatus: string
  status: 'upcoming' | 'completed' | 'cancelled'
  statusText: string
}

const getBookingStatus = (status: string): Booking['status'] => {
  if (status === 'CANCELLED') return 'cancelled'
  if (status === 'COMPLETED') return 'completed'
  return 'upcoming'
}

const getBookingStatusText = (status: string) => {
  if (status === 'CANCELLED') return 'Đã hủy'
  if (status === 'COMPLETED') return 'Đã hoàn thành'
  return 'Sắp tới'
}

const Bookings = () => {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const [activeTab, setActiveTab] = useState('all')
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cancellingId, setCancellingId] = useState<number | null>(null)

  useEffect(() => {
    const fetchBookings = async () => {
      if (!profile?.id) return

      try {
        setLoading(true)
        setError('')

        const response = await bookingApi.getOverview()
        const customerRows = response.data.data.filter((row) => row.customer_id === profile.id)
        const groupedBookings = new Map<number, BookingOverviewRow>()

        customerRows.forEach((row) => {
          if (!groupedBookings.has(row.booking_id)) {
            groupedBookings.set(row.booking_id, row)
          }
        })

        setBookings(
          Array.from(groupedBookings.values()).map((row) => ({
            id: row.booking_id,
            bookingCode: row.booking_code,
            hotelName: row.hotel_name,
            hotelAddress: `${row.hotel_address}, ${row.hotel_city}`,
            roomName: row.room_type_name,
            image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900',
            checkIn: new Date(row.expected_check_in).toLocaleDateString('vi-VN'),
            checkOut: new Date(row.expected_check_out).toLocaleDateString('vi-VN'),
            rawCheckIn: row.expected_check_in,
            rawCheckOut: row.expected_check_out,
            rooms: row.room_quantity,
            guests: row.room_capacity,
            totalPrice: row.final_amount,
            rawStatus: row.booking_status,
            status: getBookingStatus(row.booking_status),
            statusText: getBookingStatusText(row.booking_status)
          }))
        )
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

    fetchBookings()
  }, [profile?.id])

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN') + 'đ'
  }

  const handleCancel = async (booking: Booking) => {
    const confirmed = window.confirm(`Bạn có chắc muốn hủy booking "${booking.bookingCode}"?`)

    if (!confirmed) return

    try {
      setCancellingId(booking.id)
      setError('')
      await bookingApi.updateStatus(booking.id, 'CANCELLED')
      setBookings((current) =>
        current.map((item) =>
          item.id === booking.id
            ? { ...item, status: 'cancelled', statusText: 'Đã hủy' }
            : item
        )
      )
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Không thể hủy đặt phòng')
      } else {
        setError('Đã xảy ra lỗi không xác định')
      }
    } finally {
      setCancellingId(null)
    }
  }

  const filteredBookings = bookings.filter((booking) => {
    if (activeTab === 'all') return true
    return booking.status === activeTab
  })

  return (
    <div className='min-h-screen bg-[#f5f7fa]'>

      {/* Page header */}
      <section className='bg-white border-b border-gray-100'>
        <div className='max-w-6xl mx-auto px-6 py-8'>

          <h1 className='text-3xl font-bold text-[#173f67]'>
            Vé đã đặt
          </h1>

          <p className='text-gray-500 mt-2'>
            Quản lý và theo dõi các đặt phòng của bạn
          </p>

        </div>
      </section>

      <main className='max-w-6xl mx-auto px-6 py-8'>

        {error && (
          <div className='mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-600'>
            {error}
          </div>
        )}

        {loading && (
          <div className='mb-6 rounded-2xl bg-white p-12 text-center shadow-sm text-gray-500'>
            Đang tải danh sách đặt phòng...
          </div>
        )}

        {/* Tabs */}
        <div className='bg-white rounded-xl shadow-sm p-2 inline-flex gap-1 mb-6'>

          <button
            onClick={() => setActiveTab('all')}
            className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition ${
              activeTab === 'all'
                ? 'bg-[#173f67] text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Tất cả
          </button>

          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition ${
              activeTab === 'upcoming'
                ? 'bg-[#173f67] text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Sắp tới
          </button>

          <button
            onClick={() => setActiveTab('completed')}
            className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition ${
              activeTab === 'completed'
                ? 'bg-[#173f67] text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Đã hoàn thành
          </button>

          <button
            onClick={() => setActiveTab('cancelled')}
            className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition ${
              activeTab === 'cancelled'
                ? 'bg-[#173f67] text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Đã hủy
          </button>

        </div>

        {/* Booking list */}
        <div className='space-y-5'>

          {!loading && filteredBookings.map((booking) => (

            <div
              key={booking.id}
              className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'
            >

              {/* Booking top */}
              <div className='flex items-center justify-between px-6 py-4 border-b border-gray-100'>

                <div className='flex items-center gap-3'>

                  <span className='text-sm text-gray-500'>
                    Mã đặt phòng
                  </span>

                  <span className='font-bold text-[#173f67]'>
                    {booking.bookingCode}
                  </span>

                </div>

                {/* Status */}
                {booking.status === 'upcoming' && (
                  <span className='flex items-center gap-2 bg-[#fff5e8] text-[#e88900] px-3 py-1.5 rounded-full text-sm font-semibold'>
                    <FiClock />
                    {booking.statusText}
                  </span>
                )}

                {booking.status === 'completed' && (
                  <span className='bg-green-50 text-green-600 px-3 py-1.5 rounded-full text-sm font-semibold'>
                    ✓ {booking.statusText}
                  </span>
                )}

                {booking.status === 'cancelled' && (
                  <span className='flex items-center gap-2 bg-red-50 text-red-500 px-3 py-1.5 rounded-full text-sm font-semibold'>
                    <FiXCircle />
                    {booking.statusText}
                  </span>
                )}

              </div>

              {/* Main content */}
              <div className='p-6'>

                <div className='flex flex-col md:flex-row gap-6'>

                  {/* Image */}
                  <div className='w-full md:w-[260px] h-[180px] rounded-xl overflow-hidden shrink-0'>

                    <img
                      src={booking.image}
                      alt={booking.hotelName}
                      className='w-full h-full object-cover hover:scale-105 transition duration-500'
                    />

                  </div>

                  {/* Hotel information */}
                  <div className='flex-1'>

                    <h2 className='text-xl font-bold text-[#173f67]'>
                      {booking.hotelName}
                    </h2>

                    <div className='flex items-start gap-2 text-sm text-gray-500 mt-2'>
                      <FiMapPin className='mt-0.5 text-[#5dc4d4] shrink-0' />
                      <span>
                        {booking.hotelAddress}
                      </span>
                    </div>

                    <div className='mt-5'>

                      <p className='text-sm text-gray-500'>
                        Loại phòng
                      </p>

                      <p className='font-semibold text-gray-800 mt-1'>
                        {booking.roomName}
                      </p>

                    </div>

                    {/* Booking details */}
                    <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mt-5'>

                      <div>
                        <p className='text-xs text-gray-400 mb-1'>
                          Nhận phòng
                        </p>

                        <div className='flex items-center gap-2 text-sm font-semibold text-gray-700'>
                          <FiCalendar className='text-[#5dc4d4]' />
                          {booking.checkIn}
                        </div>
                      </div>

                      <div>
                        <p className='text-xs text-gray-400 mb-1'>
                          Trả phòng
                        </p>

                        <div className='flex items-center gap-2 text-sm font-semibold text-gray-700'>
                          <FiCalendar className='text-[#5dc4d4]' />
                          {booking.checkOut}
                        </div>
                      </div>

                      <div>
                        <p className='text-xs text-gray-400 mb-1'>
                          Số phòng
                        </p>

                        <p className='text-sm font-semibold text-gray-700'>
                          {booking.rooms} phòng
                        </p>
                      </div>

                      <div>
                        <p className='text-xs text-gray-400 mb-1'>
                          Khách
                        </p>

                        <div className='flex items-center gap-2 text-sm font-semibold text-gray-700'>
                          <FiUsers className='text-[#5dc4d4]' />
                          {booking.guests} người
                        </div>
                      </div>

                    </div>

                  </div>

                </div>

                {/* Bottom */}
                <div className='border-t border-gray-100 mt-6 pt-5 flex flex-col md:flex-row md:items-center justify-between gap-4'>

                  <div>

                    <p className='text-sm text-gray-500'>
                      Tổng tiền
                    </p>

                    <p className='text-2xl font-bold text-[#ff9d1c] mt-1'>
                      {formatPrice(booking.totalPrice)}
                    </p>

                  </div>

                  <div className='flex gap-3'>

                    {booking.rawStatus === 'PENDING' && (
                      <button
                        type='button'
                        onClick={() =>
                          navigate('/payment', {
                            state: {
                              bookingId: booking.id,
                              bookingCode: booking.bookingCode,
                              bookingStatus: booking.rawStatus,
                              hotelName: booking.hotelName,
                              hotelAddress: booking.hotelAddress,
                              roomName: booking.roomName,
                              imageUrl: booking.image,
                              checkIn: booking.rawCheckIn,
                              checkOut: booking.rawCheckOut,
                              rooms: booking.rooms,
                              finalAmount: booking.totalPrice
                            }
                          })
                        }
                        className='bg-[#ff9d1c] text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-[#f18d0b] transition'
                      >
                        Tiếp tục thanh toán
                      </button>
                    )}

                    {booking.status === 'upcoming' && (
                      <button
                        type='button'
                        onClick={() => handleCancel(booking)}
                        disabled={cancellingId === booking.id}
                        className='border border-red-200 text-red-500 px-5 py-2.5 rounded-lg font-semibold hover:bg-red-50 transition disabled:cursor-not-allowed disabled:opacity-60'
                      >
                        {cancellingId === booking.id ? 'Đang hủy...' : 'Hủy đặt phòng'}
                      </button>
                    )}

                    <button
                      type='button'
                      onClick={() => navigate(`/bookings/${booking.id}`)}
                      className='flex items-center gap-2 bg-[#173f67] text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-[#123452] transition'
                    >
                      Xem chi tiết
                      <FiChevronRight />
                    </button>
                  </div>``
                </div>

              </div>

            </div>

          ))}

        </div>

        {/* Empty */}
        {filteredBookings.length === 0 && (
          <div className='bg-white rounded-2xl p-12 text-center shadow-sm'>

            <div className='text-5xl mb-4'>
              🏨
            </div>

            <h2 className='text-xl font-bold text-[#173f67]'>
              Chưa có đặt phòng
            </h2>

            <p className='text-gray-500 mt-2'>
              Bạn chưa có đơn đặt phòng nào trong mục này.
            </p>

          </div>
        )}

      </main>
    </div>
  )
}

export default Bookings