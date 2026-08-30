import { useEffect, useState } from 'react'
import axios from 'axios'
import {
  MdHotel,
  MdMeetingRoom,
  MdCategory,
  MdCheckCircle,
  MdHourglassEmpty
} from 'react-icons/md'

import hotelApi from '../../apis/hotel.api'
import type { HotelOverview } from '../../types/hotel.type'

const statusLabel: Record<string, { text: string; className: string }> = {
  ACTIVE: { text: 'Hoạt động', className: 'bg-emerald-50 text-emerald-600' },
  PENDING_APPROVAL: { text: 'Chờ duyệt', className: 'bg-amber-50 text-amber-600' },
  APPROVED: { text: 'Đã duyệt', className: 'bg-blue-50 text-blue-600' },
  REJECTED: { text: 'Từ chối', className: 'bg-red-50 text-red-600' },
  INACTIVE: { text: 'Ngưng hoạt động', className: 'bg-slate-100 text-slate-500' }
}

const AdminDashboard = () => {
  const [hotels, setHotels] = useState<HotelOverview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await hotelApi.getOverview()
        setHotels(response.data?.hotels || [])
      } catch (err: unknown) {
        console.error('[AdminDashboard] failed', err)

        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.message || 'Không thể tải dữ liệu tổng quan')
        } else {
          setError('Đã xảy ra lỗi không xác định')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchOverview()
  }, [])

  const totalHotels = hotels.length
  const totalRoomTypes = hotels.reduce((sum, h) => sum + (h.totalRoomTypes || 0), 0)
  const totalAmenities = hotels.reduce((sum, h) => sum + (h.totalAmenities || 0), 0)
  const activeHotels = hotels.filter((h) => h.status === 'ACTIVE').length
  const pendingHotels = hotels.filter((h) => h.status === 'PENDING_APPROVAL').length

  const stats = [
    { label: 'Tổng khách sạn', value: totalHotels, icon: MdHotel, color: 'text-blue-600 bg-blue-50' },
    { label: 'Loại phòng', value: totalRoomTypes, icon: MdMeetingRoom, color: 'text-purple-600 bg-purple-50' },
    { label: 'Tiện nghi đang dùng', value: totalAmenities, icon: MdCategory, color: 'text-orange-600 bg-orange-50' },
    { label: 'Đang hoạt động', value: activeHotels, icon: MdCheckCircle, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Chờ duyệt', value: pendingHotels, icon: MdHourglassEmpty, color: 'text-amber-600 bg-amber-50' }
  ]

  return (
    <div className='p-8'>
      <div className='mb-6'>
        <p className='mb-1 text-sm font-semibold uppercase tracking-[0.2em] text-blue-600'>Admin</p>
        <h1 className='text-3xl font-bold text-slate-800'>Dashboard quản trị</h1>
        <p className='mt-2 text-slate-600'>
          Tổng quan hệ thống khách sạn, phòng, tiện ích và trạng thái duyệt.
        </p>
      </div>

      {error && (
        <div className='mb-6 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-red-600'>
          {error}
        </div>
      )}

      {/* STAT CARDS */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8'>
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

      {/* HOTEL TABLE */}
      <div className='rounded-xl bg-white shadow-sm ring-1 ring-slate-200 overflow-hidden'>
        <div className='px-6 py-4 border-b border-slate-200'>
          <h2 className='text-lg font-semibold text-slate-800'>Danh sách khách sạn</h2>
        </div>

        <div className='overflow-x-auto'>
          <table className='w-full text-left text-sm'>
            <thead className='bg-slate-50 text-slate-500'>
              <tr>
                <th className='px-6 py-3 font-medium'>Khách sạn</th>
                <th className='px-6 py-3 font-medium'>Thành phố</th>
                <th className='px-6 py-3 font-medium'>Hạng sao</th>
                <th className='px-6 py-3 font-medium'>Loại phòng</th>
                <th className='px-6 py-3 font-medium'>Tiện nghi</th>
                <th className='px-6 py-3 font-medium'>Hoa hồng</th>
                <th className='px-6 py-3 font-medium'>Trạng thái</th>
              </tr>
            </thead>

            <tbody className='divide-y divide-slate-100'>
              {loading && (
                <tr>
                  <td colSpan={7} className='px-6 py-6 text-center text-slate-400'>
                    Đang tải dữ liệu...
                  </td>
                </tr>
              )}

              {!loading && hotels.length === 0 && !error && (
                <tr>
                  <td colSpan={7} className='px-6 py-6 text-center text-slate-400'>
                    Chưa có khách sạn nào
                  </td>
                </tr>
              )}

              {!loading &&
                hotels.map((hotel) => {
                  const status = statusLabel[hotel.status] || {
                    text: hotel.status,
                    className: 'bg-slate-100 text-slate-500'
                  }

                  return (
                    <tr key={hotel.hotelId} className='hover:bg-slate-50'>
                      <td className='px-6 py-3 font-medium text-slate-800'>{hotel.hotelName}</td>
                      <td className='px-6 py-3 text-slate-600'>{hotel.city}</td>
                      <td className='px-6 py-3 text-slate-600'>{'⭐'.repeat(hotel.starRating)}</td>
                      <td className='px-6 py-3 text-slate-600'>{hotel.totalRoomTypes}</td>
                      <td className='px-6 py-3 text-slate-600'>{hotel.totalAmenities}</td>
                      <td className='px-6 py-3 text-slate-600'>{hotel.commissionRate}%</td>
                      <td className='px-6 py-3'>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${status.className}`}>
                          {status.text}
                        </span>
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

export default AdminDashboard