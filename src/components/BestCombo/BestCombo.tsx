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
      <div className='mb-8 border-b border-slate-200 pb-5'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
          <div>
            <div className='mb-2 flex items-center gap-2'>
              <span className='h-2 w-2 rounded-full bg-orange-500' />
              <p className='text-xs font-bold uppercase tracking-[0.2em] text-orange-600'>
                StayFlow tuyển chọn
              </p>
            </div>

            <h2 className='text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl'>
              Best <span className='text-orange-500'>Hotel</span>
            </h2>

            <p className='mt-2 max-w-xl text-sm leading-6 text-slate-500 sm:text-base'>
              Những điểm lưu trú nổi bật cho một kỳ nghỉ trọn vẹn và đáng nhớ.
            </p>
          </div>

          <div className='flex w-fit items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-700'>
            <span className='text-lg leading-none'>{hotels.length}</span>
            <span>khách sạn nổi bật</span>
          </div>
        </div>

        <div className='mt-5 h-1 w-16 rounded-full bg-orange-500' />
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