import { useEffect, useState } from 'react'
import axios from 'axios'
import { MdCheck } from 'react-icons/md'

import amenityApi, { type Amenity } from '../../apis/amenity.api'
import hotelAmenityApi from '../../apis/hotelAmenity.api'
import { useAuth } from '../../contexts/app.context'

const HotelAmenities = () => {
  const { profile } = useAuth()
  const hotelId = profile?.hotel_id

  const [allAmenities, setAllAmenities] = useState<Amenity[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [togglingId, setTogglingId] = useState<number | null>(null)

  const fetchData = async () => {
    if (!hotelId) return
    try {
      setLoading(true)
      setError('')
      const [allRes, hotelRes] = await Promise.all([
        amenityApi.getAll(),
        hotelAmenityApi.getByHotelId(hotelId)
      ])
      setAllAmenities(allRes.data?.data || [])
      setSelectedIds(new Set((hotelRes.data?.data || []).map((item) => item.amenity_id)))
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Không thể tải tiện nghi')
      } else {
        setError('Đã xảy ra lỗi không xác định')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [hotelId])

  const toggleAmenity = async (amenityId: number) => {
    if (!hotelId) return
    const isSelected = selectedIds.has(amenityId)

    try {
      setTogglingId(amenityId)
      setError('')

      if (isSelected) {
        await hotelAmenityApi.remove(hotelId, amenityId)
        setSelectedIds((prev) => {
          const next = new Set(prev)
          next.delete(amenityId)
          return next
        })
      } else {
        await hotelAmenityApi.add(hotelId, amenityId)
        setSelectedIds((prev) => new Set(prev).add(amenityId))
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Thao tác thất bại')
      } else {
        setError('Đã xảy ra lỗi không xác định')
      }
    } finally {
      setTogglingId(null)
    }
  }

  return (
    <div className='p-8'>
      <div className='mb-6'>
        <p className='mb-1 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600'>Hotel</p>
        <h1 className='text-3xl font-bold text-slate-800'>Tiện nghi khách sạn</h1>
        <p className='mt-2 text-slate-600'>Chọn các tiện nghi mà khách sạn của bạn đang có.</p>
      </div>

      {error && (
        <div className='mb-6 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-red-600'>{error}</div>
      )}

      {loading ? (
        <p className='text-slate-400'>Đang tải...</p>
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
          {allAmenities.map((amenity) => {
            const isSelected = selectedIds.has(amenity.id)
            return (
              <button
                key={amenity.id}
                type='button'
                disabled={togglingId === amenity.id}
                onClick={() => toggleAmenity(amenity.id)}
                className={`flex items-center justify-between rounded-xl border px-5 py-4 text-left transition disabled:opacity-50 ${
                  isSelected ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <span className='font-medium text-slate-700'>{amenity.name}</span>
                {isSelected && <MdCheck className='text-emerald-600' size={20} />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default HotelAmenities