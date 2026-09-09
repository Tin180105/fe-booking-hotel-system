import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  FiSearch,
  FiCalendar,
  FiUsers,
  FiMapPin,
  FiHeart,
  FiCheck,
  FiMap,
} from 'react-icons/fi'

import searchApi from '../../apis/search.api'
import path from '../../constants/path'

interface Hotel {
  id: number
  name: string
  image: string
  location: string
  rating: number
  reviewCount: number
  roomName: string
  price: number
  facilities: string[]
  promotion?: string
}

const SearchResults = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const searchState = location.state as {
    hotels?: Array<{
      hotel_id?: number
      hotel_name?: string
      city?: string
      image_url?: string | null
      min_price?: number
      description?: string
      star_rating?: number
    }>
    destination?: string
    checkIn?: string
    checkOut?: string
    rooms?: number
    adults?: number
    children?: number
  } | undefined

  const [destination, setDestination] = useState(searchState?.destination || 'Phú Quốc')
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState('Tất cả')

  const displayDestination = destination || searchState?.destination || 'Phú Quốc'

  const mapApiHotelsToViewModel = (apiHotels: Array<{
    hotel_id?: number
    hotel_name?: string
    city?: string
    image_url?: string | null
    min_price?: number
    description?: string
    star_rating?: number
  }>): Hotel[] => {
    return apiHotels.map((hotel) => ({
      id: hotel.hotel_id ?? 0,
      name: hotel.hotel_name ?? 'Khách sạn',
      image: hotel.image_url
        ? hotel.image_url.startsWith('http')
          ? hotel.image_url
          : `http://localhost:5000${hotel.image_url.startsWith('/') ? hotel.image_url : `/${hotel.image_url}`}`
        : 'http://localhost:5000/uploads/hotel/hotel1.png',
      location: hotel.city ?? 'Việt Nam',
      rating: hotel.star_rating ?? 4.8,
      reviewCount: 120,
      roomName: 'Phòng tiêu chuẩn',
      price: hotel.min_price ?? 0,
      facilities: ['Wi‑Fi miễn phí', 'Bữa sáng', 'Hồ bơi'],
      promotion: 'Combo tiết kiệm'
    }))
  }

  useEffect(() => {
    const fetchSearchResults = async () => {
      // Only use cached searchState hotels if destination hasn't changed
      if (searchState?.hotels && searchState.hotels.length > 0 && destination === searchState?.destination) {
        setHotels(mapApiHotelsToViewModel(searchState.hotels))
        return
      }

      // If destination changed, always fetch new results from API
      setLoading(true)

      try {
        const response = await searchApi.searchHotels({
          destination: destination,
          checkIn: searchState?.checkIn || '2026-09-02',
          checkOut: searchState?.checkOut || '2026-09-06',
          rooms: searchState?.rooms ?? 1,
          adults: searchState?.adults ?? 2,
          children: searchState?.children ?? 0
        })

        const apiHotels = response.data?.data ?? response.data?.hotels ?? []
        setHotels(mapApiHotelsToViewModel(apiHotels))
      } catch (error) {
        console.error('Không thể tải kết quả tìm kiếm:', error)
        setHotels([])
      } finally {
        setLoading(false)
      }
    }

    fetchSearchResults()
  }, [destination, searchState])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price)
  }

  return (
    <div className='min-h-screen bg-[#f4f6f8]'>

      {/* ================= SEARCH BAR ================= */}
      <div className='bg-white shadow-sm px-6 py-5'>
        <div className='max-w-[1450px] mx-auto flex gap-5'>

          {/* Destination */}
          <div className='w-[330px] h-[74px] bg-white border border-slate-200 rounded-2xl flex items-center px-6'>
            <FiSearch
              size={28}
              className='text-slate-500'
            />

            <input
              value={destination}
              onChange={(e) =>
                setDestination(e.target.value)
              }
              className='ml-4 flex-1 outline-none text-[20px]'
            />
          </div>

          {/* Check In */}
          <div className='flex-1 max-w-[230px] h-[74px] border border-slate-200 rounded-2xl flex items-center px-5'>
            <FiCalendar
              size={27}
              className='text-slate-500'
            />

            <div className='ml-4'>
              <div className='text-red-500 text-[17px]'>
                Thứ tư
              </div>

              <div className='font-semibold text-[18px]'>
                02-09-2026
              </div>
            </div>
          </div>

          {/* Check Out */}
          <div className='flex-1 max-w-[230px] h-[74px] border border-slate-200 rounded-2xl flex items-center px-5'>
            <FiCalendar
              size={27}
              className='text-slate-500'
            />

            <div className='ml-4'>
              <div className='text-slate-500 text-[17px]'>
                Chủ nhật
              </div>

              <div className='font-semibold text-[18px]'>
                06-09-2026
              </div>
            </div>
          </div>

          {/* Guests */}
          <div className='w-[330px] h-[74px] border border-slate-200 rounded-2xl flex items-center px-5'>
            <FiUsers
              size={30}
              className='text-slate-500'
            />

            <div className='ml-4'>
              <div className='text-slate-500 text-[17px]'>
                1 Phòng
              </div>

              <div className='font-semibold text-[17px]'>
                2 người lớn, 0 trẻ em
              </div>
            </div>
          </div>

          {/* Search */}
          <button className='w-[215px] rounded-2xl bg-orange-500 hover:bg-orange-600 text-white text-[22px] font-bold transition'>
            Tìm kiếm
          </button>

        </div>
      </div>

      {/* ================= CONTENT ================= */}
      <div className='max-w-[1450px] mx-auto px-2 py-5'>

        {/* Breadcrumb */}
        <div className='text-[17px] text-slate-500'>
          <button
            onClick={() => navigate('/')}
            className='text-blue-600 hover:underline cursor-pointer bg-none border-none p-0'
          >
            Trang chủ
          </button>

          <span className='mx-2'>
            /
          </span>

          <span className='text-blue-600'>
            Việt Nam
          </span>

          <span className='mx-2'>
            /
          </span>

          <span>
            {displayDestination}
          </span>
        </div>

        {/* Title */}
        <div className='flex justify-between items-center mt-3 mb-5'>

          <div className='flex items-center gap-3'>
            <h1 className='text-[38px] font-bold text-slate-700'>
              Khách sạn {displayDestination}
            </h1>

            <span className='text-[18px] text-slate-500'>
              {hotels.length} khách sạn
            </span>
          </div>

          <button className='flex items-center gap-2 text-blue-600 text-[19px] hover:underline'>
            <FiMap size={22} />
            Xem bản đồ
          </button>

        </div>

        {/* ================= MAIN ================= */}
        <div className='w-full'>

          {/* ================= HOTEL LIST ================= */}
          <main className='w-full'>

            {/* Filter Top */}
            <div className='bg-white rounded-[22px] shadow-sm px-5 py-3 flex items-center justify-between mb-6'>

              <div className='flex items-center gap-2'>

                <span className='text-[19px]'>
                  Bạn đi cùng ai?
                </span>

                {[
                  'Tất cả',
                  'Gia đình',
                  'Cặp đôi',
                  'Nhóm bạn',
                  'Công tác',
                ].map((item) => {
                  const isSelected = selectedFilter === item

                  return (
                    <button
                      key={item}
                      type='button'
                      onClick={() => setSelectedFilter(item)}
                      className={`px-5 py-2 rounded-full border text-[17px] transition-colors ${
                        isSelected
                          ? 'border-cyan-500 bg-cyan-50 text-slate-700 shadow-sm'
                          : 'border-slate-300 text-slate-600 hover:border-slate-400'
                      }`}
                    >
                      {item}
                    </button>
                  )
                })}

              </div>

            </div>

            {/* ================= HOTEL CARDS ================= */}
            <div className='space-y-6'>

              {loading && (
                <div className='bg-white rounded-[22px] p-10 text-center text-slate-500'>
                  Đang tải khách sạn...
                </div>
              )}

              {!loading && hotels.length === 0 && (
                <div className='bg-white rounded-[22px] p-10 text-center text-slate-500'>
                  Không tìm thấy khách sạn phù hợp.
                </div>
              )}

              {!loading && hotels.map((hotel) => (
                <div
                  key={hotel.id}
                  className='bg-white rounded-[22px] shadow-sm overflow-hidden flex min-h-[250px]'
                >

                  {/* IMAGE */}
                  <div className='relative w-[285px] shrink-0'>

                    <img
                      src={hotel.image}
                      alt={hotel.name}
                      className='w-full h-full object-cover'
                    />

                    {hotel.promotion && (
                      <div className='absolute top-5 left-0 bg-red-500 text-white px-4 py-2 rounded-r-lg font-semibold'>
                        {hotel.promotion}
                      </div>
                    )}

                  </div>

                  {/* HOTEL INFO */}
                  <div className='flex-1 p-6'>

                    <h2 className='text-[23px] font-bold text-slate-700'>
                      {hotel.name}
                    </h2>

                    {/* Rating */}
                    <div className='flex items-center gap-2 mt-2'>

                      <div className='text-orange-500 text-[25px]'>
                        ★★★★★
                      </div>

                      <FiHeart
                        size={23}
                        className='text-red-500 fill-red-500'
                      />

                      <span className='bg-green-600 text-white px-3 py-1 rounded-lg font-bold'>
                        {hotel.rating}
                      </span>

                      <span className='text-green-700 font-semibold'>
                        Tuyệt vời
                      </span>

                      <span className='text-slate-500'>
                        ({hotel.reviewCount})
                      </span>

                    </div>

                    {/* Location */}
                    <div className='flex items-center gap-2 mt-4 text-slate-500 text-[17px]'>

                      <FiMapPin size={21} />

                      <span>
                        {hotel.location}
                      </span>

                      <button className='text-blue-600'>
                        Xem bản đồ
                      </button>

                    </div>

                    {/* Facilities */}
                    <div className='flex flex-wrap gap-3 mt-5'>

                      {hotel.facilities.map(
                        (facility) => (
                          <span
                            key={facility}
                            className='bg-slate-100 border border-slate-200 px-4 py-2 rounded-lg text-[16px] text-slate-600'
                          >
                            {facility}
                          </span>
                        )
                      )}

                    </div>

                  </div>

                  {/* PRICE */}
                  <div className='w-[240px] border-l border-slate-200 p-5 flex flex-col justify-between text-right'>

                    <div>

                      <h3 className='font-semibold text-[18px] text-slate-700'>
                        {hotel.roomName}
                      </h3>

                      <div className='flex justify-end items-center gap-2 text-slate-500 mt-4'>
                        <FiCheck className='text-green-600' />

                        <span>
                          Gồm ăn sáng
                        </span>
                      </div>

                    </div>

                    <div>

                      <div className='text-orange-500 text-[26px] font-bold'>
                        {formatPrice(hotel.price)} đ
                      </div>

                      <div className='text-slate-500'>
                        / phòng / đêm
                      </div>

                      <button
                        onClick={() =>
                          navigate(path.rooms, {
                            state: {
                              hotelId: hotel.id,
                              hotelName: hotel.name,
                              destination: hotel.location,
                              checkIn: searchState?.checkIn,
                              checkOut: searchState?.checkOut,
                              rooms: searchState?.rooms,
                              adults: searchState?.adults,
                              children: searchState?.children
                            }
                          })
                        }
                        className='w-full mt-3 bg-orange-500 hover:bg-orange-600 text-white font-bold text-[17px] py-4 rounded-xl transition'
                      >
                        Xem phòng
                      </button>

                    </div>

                  </div>

                </div>
              ))}

            </div>

          </main>

        </div>

      </div>

    </div>
  )
}

export default SearchResults