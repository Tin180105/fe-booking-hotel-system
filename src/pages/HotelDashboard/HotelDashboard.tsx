import { useEffect, useState } from 'react'
import axios from 'axios'
import { MdMeetingRoom, MdCategory, MdBookOnline } from 'react-icons/md'

import hotelApi from '../../apis/hotel.api'
import roomApi from '../../apis/room.api'
import hotelAmenityApi from '../../apis/hotelAmenity.api'
import bookingApi from '../../apis/booking.api'
import { useAuth } from '../../contexts/app.context'
import type { Hotel } from '../../types/hotel.type'

const HotelDashboard = () => {
  const { profile } = useAuth()
  const hotelId = profile?.hotel_id

  const [hotel, setHotel] = useState<Hotel | null>(null)
  const [roomCount, setRoomCount] = useState(0)
  const [amenityCount, setAmenityCount] = useState(0)
  const [bookingCount, setBookingCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!hotelId) return

    const fetchData = async () => {
      try {
        setLoading(true)
        setError('')

        const [hotelRes, roomsRes, amenitiesRes, bookingsRes] = await Promise.all([
          hotelApi.getMe(),
          roomApi.getByHotelId(hotelId),
          hotelAmenityApi.getByHotelId(hotelId),
          bookingApi.getByHotelId(hotelId)
        ])

        setHotel(hotelRes.data.hotel)
        setRoomCount(roomsRes.data.data.length)
        setAmenityCount(amenitiesRes.data.data.length)
        setBookingCount(bookingsRes.data.data.length)
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.message || 'Không thể tải dữ liệu')
        } else {
          setError('Đã xảy ra lỗi không xác định')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [hotelId])

  const stats = [
    { label: 'Loại phòng', value: roomCount, icon: MdMeetingRoom, color: 'text-purple-600 bg-purple-50' },
    { label: 'Tiện nghi', value: amenityCount, icon: MdCategory, color: 'text-orange-600 bg-orange-50' },
    { label: 'Đặt phòng', value: bookingCount, icon: MdBookOnline, color: 'text-blue-600 bg-blue-50' }
  ]

  return (
    <div className='p-8'>
      <div className='mb-6'>
        <p className='mb-1 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600'>Hotel</p>
        <h1 className='text-3xl font-bold text-slate-800'>{hotel?.name || 'Dashboard khách sạn'}</h1>
        {hotel && <p className='mt-2 text-slate-600'>{hotel.city} · {hotel.address}</p>}
      </div>

      {error && (
        <div className='mb-6 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-red-600'>{error}</div>
      )}

      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className='rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200'>
              <div className={`w-11 h-11 rounded-lg flex items-center justify-center mb-3 ${stat.color}`}>
                <Icon size={22} />
              </div>
              <p className='text-2xl font-bold text-slate-800'>{loading ? '...' : stat.value}</p>
              <p className='mt-1 text-sm text-slate-500'>{stat.label}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default HotelDashboard