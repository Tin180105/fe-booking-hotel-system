import { useEffect, useState } from 'react'

import hotelApi from '../../apis/hotel.api'

import type {
  HotelHome
} from '../../types/hotel.type'

const getHotelImageUrl = (imageUrl: string | null) => {
  if (!imageUrl) {
    return 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80'
  }

  if (imageUrl.startsWith('http')) {
    return imageUrl
  }

  const normalizedPath = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`

  return `http://localhost:5000${normalizedPath}`
}

const BestCombo = () => {
  const [hotels, setHotels] = useState<HotelHome[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const response =
          await hotelApi.getHotelsForHome()

        setHotels(response.data?.hotels ?? [])
      } catch (error) {
        console.error(
          'Không thể lấy khách sạn:',
          error
        )
        setHotels([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchHotels()
  }, [])

  if (isLoading) {
    return (
      <section className='max-w-[1280px] mx-auto px-4 py-8'>
        <div className='text-lg text-slate-500'>
          Đang tải combo...
        </div>
      </section>
    )
  }

  if (!hotels.length) {
    return (
      <section className='max-w-[1280px] mx-auto px-4 py-8'>
        <div className='text-slate-500'>
          Chưa có combo nào phù hợp.
        </div>
      </section>
    )
  }

  return (
    <section className='max-w-[1280px] mx-auto px-4 py-8'>
      <div className='mb-6'>
        <h2 className='text-3xl font-bold text-slate-800'>
          Best Hotel
        </h2>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'>
        {hotels.map((hotel) => (
          <div
            key={hotel.id}
            className='overflow-hidden rounded-2xl bg-white shadow-lg border border-slate-200'
          >
            <img
              src={getHotelImageUrl(hotel.imageUrl)}
              alt={hotel.name}
              className='h-56 w-full object-cover'
            />

            <div className='p-4'>
              <div className='flex items-center justify-between gap-2'>
                <h3 className='text-xl font-semibold text-slate-800 line-clamp-2'>
                  {hotel.name}
                </h3>
                <span className='rounded-full bg-orange-100 px-2 py-1 text-xs font-semibold text-orange-600'>
                  {hotel.starRating || 5}★
                </span>
              </div>

              <p className='mt-2 text-sm text-slate-500'>
                {hotel.city}
              </p>

              <p className='mt-3 text-sm text-slate-600 line-clamp-3'>
                {hotel.description || 'Khách sạn đẹp, tiện nghi đầy đủ cho kỳ nghỉ của bạn.'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default BestCombo