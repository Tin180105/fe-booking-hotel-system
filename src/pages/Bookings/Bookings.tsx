import { useState } from 'react'
import {
  FiCalendar,
  FiMapPin,
  FiUsers,
  FiChevronRight,
  FiClock,
  FiXCircle
} from 'react-icons/fi'

interface Booking {
  id: number
  bookingCode: string
  hotelName: string
  hotelAddress: string
  roomName: string
  image: string
  checkIn: string
  checkOut: string
  rooms: number
  guests: number
  totalPrice: number
  status: 'upcoming' | 'completed' | 'cancelled'
  statusText: string
}

const bookings: Booking[] = [
  {
    id: 1,
    bookingCode: 'SF20260910001',
    hotelName: 'Vinpearl Landmark 81',
    hotelAddress: '720A Điện Biên Phủ, Bình Thạnh, TP. Hồ Chí Minh',
    roomName: 'Deluxe King Room',
    image:
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900',
    checkIn: '20/09/2026',
    checkOut: '23/09/2026',
    rooms: 1,
    guests: 2,
    totalPrice: 4500000,
    status: 'upcoming',
    statusText: 'Sắp tới'
  },
  {
    id: 2,
    bookingCode: 'SF20260815002',
    hotelName: 'InterContinental Danang',
    hotelAddress: 'Bãi Bắc, Sơn Trà, Đà Nẵng',
    roomName: 'Superior Ocean View',
    image:
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=900',
    checkIn: '15/08/2026',
    checkOut: '18/08/2026',
    rooms: 1,
    guests: 2,
    totalPrice: 6200000,
    status: 'completed',
    statusText: 'Đã hoàn thành'
  },
  {
    id: 3,
    bookingCode: 'SF20260712003',
    hotelName: 'Novotel Nha Trang',
    hotelAddress: '50 Trần Phú, Nha Trang, Khánh Hòa',
    roomName: 'Standard Room',
    image:
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=900',
    checkIn: '12/07/2026',
    checkOut: '14/07/2026',
    rooms: 1,
    guests: 2,
    totalPrice: 2800000,
    status: 'cancelled',
    statusText: 'Đã hủy'
  }
]

const Bookings = () => {
  const [activeTab, setActiveTab] = useState('all')

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN') + 'đ'
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

          {filteredBookings.map((booking) => (

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

                    {booking.status === 'upcoming' && (
                      <button className='border border-red-200 text-red-500 px-5 py-2.5 rounded-lg font-semibold hover:bg-red-50 transition'>
                        Hủy đặt phòng
                      </button>
                    )}

                    <button className='flex items-center gap-2 bg-[#173f67] text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-[#123452] transition'>
                      Xem chi tiết
                      <FiChevronRight />
                    </button>

                  </div>

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