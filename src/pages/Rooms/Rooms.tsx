import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  FiArrowLeft,
  FiCheck,
  FiChevronDown,
  FiFilter,
  FiHeart,
  FiMapPin,
  FiMaximize,
  FiUsers,
  FiCoffee,
} from 'react-icons/fi'
import roomApi, { type RoomType } from '../../apis/room.api'

interface Room {
  id: number
  hotelName: string
  name: string
  image: string
  price: number
  oldPrice?: number
  size?: number
  guests: number
  bed: string
  available: number
  rating?: number
  description: string
  amenities: string[]
  breakfast?: boolean
  cancellation?: string
  popular?: boolean
}

const Rooms = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const state = location.state as {
    hotelId?: number
    hotelName?: string
    destination?: string
    checkIn?: string
    checkOut?: string
    rooms?: number
    adults?: number
    children?: number
  } | undefined

  const [sort, setSort] = useState('recommended')
  const [showFilter, setShowFilter] = useState(false)
  const [favorites, setFavorites] = useState<number[]>([])
  const [roomsData, setRoomsData] = useState<Room[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [filters, setFilters] = useState({
    breakfast: false,
    freeCancellation: false,
    kingBed: false
  })

  const isHotelSelected = Boolean(state?.hotelId)
  const hotelName = state?.hotelName || 'Tất cả khách sạn'
  const destination = state?.destination || 'Việt Nam'

  const getRoomImageUrl = (imageUrl: string | null) => {
    if (!imageUrl) {
      return ''
    }

    if (imageUrl.startsWith('http')) {
      const parsedUrl = new URL(imageUrl)

      if (parsedUrl.pathname.startsWith('/uploads/')) {
        return `http://localhost:5000${parsedUrl.pathname}`
      }

      return imageUrl
    }

    const normalizedPath = imageUrl.startsWith('/')
      ? imageUrl
      : `/${imageUrl}`

    return normalizedPath.startsWith('/uploads/')
      ? `http://localhost:5000${normalizedPath}`
      : `http://localhost:5000/uploads${normalizedPath}`
  }

  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(true)
      setError('')

      try {
        const response = state?.hotelId
          ? await roomApi.getByHotelId(state.hotelId)
          : await roomApi.getAll()
        const roomTypes = response.data.data ?? []
        const rooms = roomTypes.map((roomType: RoomType) => ({
          id: roomType.id,
          hotelName: roomType.hotel_name,
          name: roomType.name,
          image: getRoomImageUrl(roomType.thumbnail_url),
          price: Number(roomType.base_price),
          size: undefined,
          guests: roomType.capacity,
          bed: 'Chưa cập nhật thông tin giường',
          available: roomType.total_rooms,
          description: roomType.description || 'Chưa có mô tả cho loại phòng này.',
          amenities: [],
          breakfast: false,
          cancellation: undefined
        }))

        setRoomsData(rooms)
      } catch (fetchError) {
        console.error('Không thể tải danh sách phòng:', fetchError)
        setRoomsData([])
        setError('Không thể tải danh sách phòng từ máy chủ.')
      } finally {
        setLoading(false)
      }
    }

    fetchRooms()
  }, [state?.hotelId])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price)
  }

  const toggleFavorite = (id: number) => {
    setFavorites((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    )
  }

  const filteredRooms = useMemo(() => {
    let result = [...roomsData]

    if (filters.breakfast) {
      result = result.filter((room) => room.breakfast)
    }

    if (filters.freeCancellation) {
      result = result.filter((room) => room.cancellation?.includes('Miễn phí'))
    }

    if (filters.kingBed) {
      result = result.filter((room) =>
        room.bed.toLowerCase().includes('king')
      )
    }

    if (sort === 'price-low') {
      result.sort((a, b) => a.price - b.price)
    }

    if (sort === 'price-high') {
      result.sort((a, b) => b.price - a.price)
    }

    if (sort === 'rating') {
      result.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    }

    return result
  }, [filters, roomsData, sort])

  const handleSelectRoom = (room: Room) => {
    navigate('/payment', {
      state: {
        hotelId: state?.hotelId,
        hotelName,
        destination,
        roomTypeId: room.id,
        roomName: room.name,
        imageUrl: room.image,
        price: room.price,
        checkIn: state?.checkIn,
        checkOut: state?.checkOut,
        rooms: state?.rooms,
        adults: state?.adults,
        children: state?.children
      }
    })
  }

  return (
    <div className='min-h-screen bg-[#f5f7fa] pb-16'>

      {/* =====================================================
          HOTEL HEADER
      ===================================================== */}

      <section className='bg-[#0c2f51] text-white'>

        <div className='max-w-[1450px] mx-auto px-6 py-6'>

          {/* Breadcrumb */}

          <div className='flex items-center gap-2 text-[15px] text-blue-100 mb-5'>
            <button
              onClick={() => navigate('/')}
              className='hover:text-white transition'
            >
              Trang chủ
            </button>

            <span>/</span>

            <button
              onClick={() => navigate('/search')}
              className='hover:text-white transition'
            >
              {destination}
            </button>

            <span>/</span>

            <span className='text-white'>
              {hotelName}
            </span>

            <span>/</span>

            <span className='text-[#5dc4d4]'>
              Phòng
            </span>
          </div>

          <div className='flex flex-col lg:flex-row lg:items-end justify-between gap-5'>

            <div>

              <h1 className='text-[36px] font-bold tracking-tight'>
                {hotelName}
              </h1>

              <div className='flex items-center gap-2 mt-2 text-blue-100 text-[16px]'>
                <FiMapPin size={18} />
                <span>
                  {destination} · Việt Nam
                </span>
              </div>

            </div>

            <button
              onClick={() => navigate(-1)}
              className='flex items-center justify-center gap-2 border border-white/30 hover:bg-white/10 px-5 py-3 rounded-xl transition'
            >
              <FiArrowLeft />
              Quay lại khách sạn
            </button>

          </div>

        </div>

      </section>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <main className='max-w-[1450px] mx-auto px-6 pt-8'>

        {/* TOP */}

        <div className='flex flex-col md:flex-row md:items-end justify-between gap-5 mb-6'>

          <div>

            <p className='text-[#ff9d1c] font-semibold text-sm uppercase tracking-wider'>
              Chọn phòng phù hợp với bạn
            </p>

            <h2 className='text-[32px] font-bold text-slate-800 mt-1'>
              Các loại phòng
            </h2>

            <p className='text-slate-500 mt-1'>
                {loading ? 'Đang tải...' : `${filteredRooms.length} loại phòng đang có sẵn`}
            </p>

          </div>

          {/* SORT */}

          <div className='flex items-center gap-3'>

            <button
              onClick={() => setShowFilter(!showFilter)}
              className='lg:hidden flex items-center gap-2 border border-slate-300 bg-white px-4 py-3 rounded-xl font-semibold text-slate-700'
            >
              <FiFilter />
              Bộ lọc
            </button>

            <div className='relative'>

              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className='appearance-none bg-white border border-slate-300 rounded-xl pl-4 pr-10 py-3 text-slate-700 font-medium outline-none focus:ring-2 focus:ring-[#5dc4d4]'
              >
                <option value='recommended'>
                  Đề xuất
                </option>

                <option value='price-low'>
                  Giá thấp đến cao
                </option>

                <option value='price-high'>
                  Giá cao đến thấp
                </option>

                <option value='rating'>
                  Đánh giá cao nhất
                </option>
              </select>

              <FiChevronDown
                className='absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none'
              />

            </div>

          </div>

        </div>

        <div className='grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-7'>

          {/* =================================================
              FILTER
          ================================================= */}

          <aside
            className={`${
              showFilter ? 'block' : 'hidden'
            } lg:block`}
          >

            <div className='bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sticky top-5'>

              <div className='flex items-center justify-between mb-5'>

                <h3 className='text-xl font-bold text-slate-800'>
                  Bộ lọc
                </h3>

                <button
                  onClick={() =>
                    setFilters({
                      breakfast: false,
                      freeCancellation: false,
                      kingBed: false
                    })
                  }
                  className='text-sm text-[#173f67] font-semibold'
                >
                  Xóa lọc
                </button>

              </div>

              <div className='border-t border-slate-100 pt-5'>

                <p className='font-bold text-slate-700 mb-4'>
                  Tiện nghi & chính sách
                </p>

                <label className='flex items-center gap-3 mb-4 cursor-pointer'>

                  <input
                    type='checkbox'
                    checked={filters.breakfast}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        breakfast: e.target.checked
                      })
                    }
                    className='w-5 h-5 accent-[#173f67]'
                  />

                  <span className='text-slate-600'>
                    Bao gồm bữa sáng
                  </span>

                </label>

                <label className='flex items-center gap-3 mb-4 cursor-pointer'>

                  <input
                    type='checkbox'
                    checked={filters.freeCancellation}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        freeCancellation: e.target.checked
                      })
                    }
                    className='w-5 h-5 accent-[#173f67]'
                  />

                  <span className='text-slate-600'>
                    Miễn phí hủy
                  </span>

                </label>

                <label className='flex items-center gap-3 cursor-pointer'>

                  <input
                    type='checkbox'
                    checked={filters.kingBed}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        kingBed: e.target.checked
                      })
                    }
                    className='w-5 h-5 accent-[#173f67]'
                  />

                  <span className='text-slate-600'>
                    Giường King
                  </span>

                </label>

              </div>

              <div className='border-t border-slate-100 mt-6 pt-5'>

                <p className='font-bold text-slate-700 mb-4'>
                  Cam kết StayFlow
                </p>

                <div className='space-y-4'>

                  <div className='flex gap-3'>

                    <div className='w-9 h-9 rounded-full bg-green-50 flex items-center justify-center shrink-0'>
                      <FiCheck className='text-green-600' />
                    </div>

                    <div>
                      <p className='font-semibold text-slate-700 text-sm'>
                        Giá tốt nhất
                      </p>

                      <p className='text-xs text-slate-500 mt-1'>
                        Không phí ẩn
                      </p>
                    </div>

                  </div>

                  <div className='flex gap-3'>

                    <div className='w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center shrink-0'>
                      <FiCheck className='text-blue-600' />
                    </div>

                    <div>
                      <p className='font-semibold text-slate-700 text-sm'>
                        Đặt phòng an toàn
                      </p>

                      <p className='text-xs text-slate-500 mt-1'>
                        Bảo mật thông tin
                      </p>
                    </div>

                  </div>

                  <div className='flex gap-3'>

                    <div className='w-9 h-9 rounded-full bg-orange-50 flex items-center justify-center shrink-0'>
                      <FiCheck className='text-orange-500' />
                    </div>

                    <div>
                      <p className='font-semibold text-slate-700 text-sm'>
                        Hỗ trợ 24/7
                      </p>

                      <p className='text-xs text-slate-500 mt-1'>
                        Luôn sẵn sàng hỗ trợ
                      </p>
                    </div>

                  </div>

                </div>

              </div>

            </div>

          </aside>

          {/* =================================================
              ROOM LIST
          ================================================= */}

          <section className='space-y-5'>

            {loading ? (
              <div className='bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-500'>
                Đang tải danh sách phòng...
              </div>
            ) : error ? (
              <div className='bg-white rounded-2xl p-12 text-center border border-red-200 text-red-600'>
                {error}
              </div>
            ) : filteredRooms.length === 0 ? (

              <div className='bg-white rounded-2xl p-12 text-center border border-slate-200'>

                <div className='text-5xl mb-4'>
                  🛏️
                </div>

                <h3 className='text-xl font-bold text-slate-700'>
                  Không tìm thấy phòng phù hợp
                </h3>

                <p className='text-slate-500 mt-2'>
                  Hãy thử thay đổi bộ lọc của bạn.
                </p>

              </div>

            ) : (

              filteredRooms.map((room) => (

                <article
                  key={room.id}
                  className='group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden'
                >

                  <div className='grid grid-cols-1 xl:grid-cols-[360px_1fr]'>

                    {/* IMAGE */}

                    <div className='relative h-[280px] xl:h-full min-h-[300px] overflow-hidden'>

                      <img
                        src={room.image}
                        alt={room.name}
                        className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-700'
                      />

                      <div className='absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent' />

                      {room.popular && (
                        <div className='absolute top-4 left-4 bg-[#ff9d1c] text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow'>
                          ĐƯỢC YÊU THÍCH
                        </div>
                      )}

                      <button
                        onClick={() =>
                          toggleFavorite(room.id)
                        }
                        className='absolute top-4 right-4 w-11 h-11 bg-white/95 backdrop-blur rounded-full flex items-center justify-center shadow hover:scale-110 transition'
                      >
                        <FiHeart
                          size={21}
                          className={
                            favorites.includes(room.id)
                              ? 'fill-red-500 text-red-500'
                              : 'text-slate-600'
                          }
                        />
                      </button>

                    </div>

                    {/* INFORMATION */}

                    <div className='p-6'>

                      <div className='flex flex-col md:flex-row justify-between gap-5'>

                        <div className='flex-1'>

                          {!isHotelSelected && (
                            <p className='text-sm font-semibold text-[#5dc4d4] mb-2'>
                              {room.hotelName}
                            </p>
                          )}

                          <h3 className='text-[25px] font-bold text-slate-800 group-hover:text-[#173f67] transition'>
                            {room.name}
                          </h3>

                          <p className='text-slate-500 mt-2 leading-relaxed'>
                            {room.description}
                          </p>

                          {/* ROOM INFO */}

                          <div className='flex flex-wrap gap-x-6 gap-y-3 mt-5 text-sm text-slate-600'>

                            <div className='flex items-center gap-2'>
                              <FiMaximize className='text-[#5dc4d4]' />
                              <span>
                                {room.size ? `${room.size} m²` : 'Diện tích chưa cập nhật'}
                              </span>
                            </div>

                            <div className='flex items-center gap-2'>
                              <FiUsers className='text-[#5dc4d4]' />
                              <span>
                                {room.guests} khách
                              </span>
                            </div>

                            <div className='flex items-center gap-2'>
                              <span className='text-[#5dc4d4] text-lg'>
                                🛏
                              </span>
                              <span>
                                {room.bed}
                              </span>
                            </div>

                          </div>

                          {/* AMENITIES */}

                          <div className='flex flex-wrap gap-2 mt-5'>

                            {room.amenities.map(
                              (amenity, index) => (
                                <span
                                  key={index}
                                  className='px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-xs text-slate-600'
                                >
                                  {amenity}
                                </span>
                              )
                            )}

                          </div>

                          {/* BENEFITS */}

                          <div className='mt-5 flex flex-wrap gap-5 text-sm'>

                            {room.breakfast && (
                              <div className='flex items-center gap-2 text-green-600 font-medium'>
                                <FiCoffee />
                                Bữa sáng miễn phí
                              </div>
                            )}

                            {room.cancellation && (
                              <div className='flex items-center gap-2 text-green-600 font-medium'>
                                <FiCheck />
                                {room.cancellation}
                              </div>
                            )}

                          </div>

                        </div>

                        {/* PRICE */}

                        <div className='md:w-[220px] flex flex-col md:items-end justify-between border-t md:border-t-0 md:border-l border-slate-100 pt-5 md:pt-0 md:pl-6'>

                          <div className='text-left md:text-right'>

                            {room.oldPrice && (
                              <p className='text-sm text-slate-400 line-through'>
                                ₫{formatPrice(room.oldPrice)}
                              </p>
                            )}

                            <p className='text-[28px] font-extrabold text-[#173f67]'>
                              ₫{formatPrice(room.price)}
                            </p>

                            <p className='text-xs text-slate-500'>
                              / phòng / đêm
                            </p>

                            {room.oldPrice && (
                              <span className='inline-block mt-2 bg-green-50 text-green-600 px-2.5 py-1 rounded-md text-xs font-bold'>
                                Tiết kiệm{' '}
                                {Math.round(
                                  (1 -
                                    room.price /
                                      room.oldPrice) *
                                    100
                                )}
                                %
                              </span>
                            )}

                          </div>

                          <div className='w-full mt-5 md:mt-0'>

                            <p className='text-right text-orange-500 text-xs font-semibold mb-3'>
                              Chỉ còn {room.available} phòng
                            </p>

                            <button
                              onClick={() =>
                                handleSelectRoom(room)
                              }
                              className='w-full bg-[#ff9d1c] hover:bg-[#e88908] text-white font-bold py-3.5 rounded-xl transition shadow-sm hover:shadow-lg'
                            >
                              Chọn phòng
                            </button>

                            <button
                              onClick={() =>
                                navigate(`/rooms/${room.id}`, {
                                  state: {
                                    room,
                                    hotelName,
                                    destination
                                  }
                                })
                              }
                              className='w-full text-[#173f67] font-semibold text-sm mt-3 hover:underline'
                            >
                              Xem chi tiết phòng
                            </button>

                          </div>

                        </div>

                      </div>

                    </div>

                  </div>

                </article>

              ))

            )}

          </section>

        </div>

      </main>

    </div>
  )
}

export default Rooms