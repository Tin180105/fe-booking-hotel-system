import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { FiArrowLeft, FiCalendar, FiCheck, FiMapPin, FiMinus, FiPlus, FiUsers } from 'react-icons/fi'
import bookingApi from '../../apis/booking.api'
import roomApi from '../../apis/room.api'
import { useAuth } from '../../contexts/app.context'

interface RoomConfirmationState {
  hotelId?: number
  hotelName?: string
  destination?: string
  roomTypeId?: number
  roomName?: string
  imageUrl?: string
  price?: number
  capacity?: number
  availableRooms?: number
  checkIn?: string
  checkOut?: string
  rooms?: number
  adults?: number
  children?: number
}

const RoomConfirmation = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, profile } = useAuth()
  const state = (location.state || {}) as RoomConfirmationState
  const [checkIn, setCheckIn] = useState(state.checkIn || '')
  const [checkOut, setCheckOut] = useState(state.checkOut || '')
  const [hotelId, setHotelId] = useState(state.hotelId)
  const [roomQuantity, setRoomQuantity] = useState(Math.max(1, state.rooms || 1))
  const [adults, setAdults] = useState(Math.max(1, state.adults || 2))
  const [children, setChildren] = useState(Math.max(0, state.children || 0))
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [livePrice, setLivePrice] = useState(state.price || 0)
  const [isRefreshingPrice, setIsRefreshingPrice] = useState(false)
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null)

  const formatPrice = (price: number) => `${price.toLocaleString('vi-VN')}đ`
  const maxRooms = Math.max(1, state.availableRooms || 1)
  const maxGuests = (state.capacity || 0) * roomQuantity

  useEffect(() => {
    if (hotelId || !state.roomTypeId) {
      return
    }

    roomApi.getById(state.roomTypeId)
      .then((response) => {
        setHotelId(response.data.data.hotel_id)
        setLivePrice(Number(response.data.data.base_price))
      })
      .catch(() => setError('Không thể tải đầy đủ thông tin phòng. Vui lòng thử lại.'))
  }, [hotelId, state.roomTypeId])

  // Đọc lại giá phòng MỚI NHẤT từ server ngay trước khi khách xác nhận —
  // gọi cùng API GET /roomTypes/:id như lúc tải trang, không có gì "giả".
  const refreshPrice = async () => {
    if (!state.roomTypeId) return

    try {
      setIsRefreshingPrice(true)
      const response = await roomApi.getById(state.roomTypeId)
      setLivePrice(Number(response.data.data.base_price))
      setLastRefreshedAt(new Date())
    } catch {
      setError('Không thể làm mới giá phòng. Vui lòng thử lại.')
    } finally {
      setIsRefreshingPrice(false)
    }
  }

  const goToPayment = async () => {
    if (!isAuthenticated || !profile?.id) {
      setError('Vui lòng đăng nhập để tiếp tục đặt phòng.')
      return
    }

    if (!hotelId || !state.roomTypeId) {
      setError('Đang tải thông tin phòng, vui lòng thử lại sau giây lát.')
      return
    }

    if (!checkIn || !checkOut) {
      setError('Vui lòng chọn ngày nhận phòng và ngày trả phòng.')
      return
    }

    if (new Date(checkOut) <= new Date(checkIn)) {
      setError('Ngày trả phòng phải sau ngày nhận phòng.')
      return
    }

    if (adults < 1) {
      setError('Phải có ít nhất 1 người lớn.')
      return
    }

    if (state.capacity && adults + children > maxGuests) {
      setError(`Số khách vượt sức chứa. Phòng này tối đa ${maxGuests} người.`)
      return
    }

    try {
      setIsSubmitting(true)
      setError('')
      const response = await bookingApi.create({
        hotel_id: hotelId,
        customer_id: profile.id,
        room_type_id: state.roomTypeId,
        quantity: roomQuantity,
        check_in: checkIn,
        check_out: checkOut,
        promotion_id: null
      })

      const booking = response.data.data
      navigate('/payment', {
        state: {
          ...state,
          bookingId: booking.booking_id,
          bookingCode: booking.booking_code,
          bookingStatus: booking.status,
          finalAmount: Number(booking.final_amount),
          checkIn,
          checkOut,
          rooms: roomQuantity,
          adults,
          children
        }
      })
    } catch (requestError: unknown) {
      const responseMessage = axios.isAxiosError(requestError)
        ? requestError.response?.data?.message
        : requestError instanceof Error
          ? requestError.message
          : ''
      setError(responseMessage || 'Không thể tạo booking. Vui lòng thử lại.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!state.roomTypeId) {
    return (
      <main className='min-h-screen bg-[#f5f7fa] px-6 py-16'>
        <div className='mx-auto max-w-2xl rounded-2xl bg-white p-8 text-center shadow-sm'>
          <h1 className='text-2xl font-bold text-[#173f67]'>Không tìm thấy phòng đã chọn</h1>
          <button
            type='button'
            onClick={() => navigate('/rooms')}
            className='mt-6 rounded-xl bg-[#173f67] px-5 py-3 font-bold text-white'
          >
            Quay lại chọn phòng
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className='min-h-screen bg-[#f5f7fa] px-6 py-8'>
      <div className='mx-auto max-w-5xl'>
        <button
          type='button'
          onClick={() => navigate(-1)}
          className='mb-6 inline-flex items-center gap-2 font-semibold text-[#173f67]'
        >
          <FiArrowLeft />
          Quay lại danh sách phòng
        </button>

        <div className='mb-8'>
          <p className='text-sm font-semibold uppercase tracking-wider text-[#ff9d1c]'>
            Xác nhận phòng
          </p>
          <h1 className='mt-1 text-3xl font-bold text-[#173f67]'>
            Kiểm tra thông tin đặt phòng
          </h1>
        </div>

        <div className='grid gap-7 lg:grid-cols-[1fr_340px]'>
          <section className='overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm'>
            {state.imageUrl && (
              <img
                src={state.imageUrl}
                alt={state.roomName || 'Phòng đã chọn'}
                className='h-72 w-full object-cover'
              />
            )}
            <div className='p-6'>
              <p className='text-sm text-slate-500'>Khách sạn</p>
              <h2 className='mt-1 text-2xl font-bold text-[#173f67]'>{state.hotelName}</h2>
              <p className='mt-2 flex items-center gap-2 text-slate-500'>
                <FiMapPin />
                {state.destination || 'Việt Nam'}
              </p>

              <div className='mt-6 border-t border-slate-100 pt-6'>
                <p className='text-sm text-slate-500'>Phòng đã chọn</p>
                <h3 className='mt-1 text-xl font-bold text-slate-800'>{state.roomName}</h3>
                <div className='mt-5 grid gap-4 text-slate-600 sm:grid-cols-2'>
                  <label className='flex flex-col gap-2 text-sm font-semibold text-slate-700'>
                    <span className='flex items-center gap-2'><FiCalendar /> Nhận phòng</span>
                    <input
                      type='date'
                      value={checkIn}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(event) => {
                        setCheckIn(event.target.value)
                        setError('')
                      }}
                      className='rounded-lg border border-slate-300 px-3 py-2 font-normal outline-none focus:border-[#ff9d1c] focus:ring-2 focus:ring-orange-100'
                    />
                  </label>
                  <label className='flex flex-col gap-2 text-sm font-semibold text-slate-700'>
                    <span className='flex items-center gap-2'><FiCalendar /> Trả phòng</span>
                    <input
                      type='date'
                      value={checkOut}
                      min={checkIn || new Date().toISOString().split('T')[0]}
                      onChange={(event) => {
                        setCheckOut(event.target.value)
                        setError('')
                      }}
                      className='rounded-lg border border-slate-300 px-3 py-2 font-normal outline-none focus:border-[#ff9d1c] focus:ring-2 focus:ring-orange-100'
                    />
                  </label>
                  <div className='sm:col-span-2 grid gap-3 rounded-xl bg-slate-50 p-4'>
                    <p className='flex items-center gap-2 font-semibold text-slate-700'><FiUsers /> Số khách và phòng</p>
                    <div className='grid gap-3 sm:grid-cols-3'>
                      <div className='flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2'>
                        <span className='text-sm'>Số phòng</span>
                        <div className='flex items-center gap-2'>
                          <button
                            type='button'
                            aria-label='Giảm số phòng'
                            disabled={roomQuantity <= 1}
                            onClick={() => setRoomQuantity((value) => Math.max(1, value - 1))}
                            className='rounded-full p-1 text-[#173f67] disabled:text-slate-300'
                          ><FiMinus /></button>
                          <strong>{roomQuantity}</strong>
                          <button
                            type='button'
                            aria-label='Tăng số phòng'
                            disabled={roomQuantity >= maxRooms}
                            onClick={() => setRoomQuantity((value) => Math.min(maxRooms, value + 1))}
                            className='rounded-full p-1 text-[#173f67] disabled:text-slate-300'
                          ><FiPlus /></button>
                        </div>
                      </div>
                      <div className='flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2'>
                        <span className='text-sm'>Người lớn</span>
                        <div className='flex items-center gap-2'>
                          <button
                            type='button'
                            aria-label='Giảm số người lớn'
                            disabled={adults <= 1}
                            onClick={() => setAdults((value) => Math.max(1, value - 1))}
                            className='rounded-full p-1 text-[#173f67] disabled:text-slate-300'
                          ><FiMinus /></button>
                          <strong>{adults}</strong>
                          <button
                            type='button'
                            aria-label='Tăng số người lớn'
                            onClick={() => setAdults((value) => value + 1)}
                            className='rounded-full p-1 text-[#173f67]'
                          ><FiPlus /></button>
                        </div>
                      </div>
                      <div className='flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2'>
                        <span className='text-sm'>Trẻ em</span>
                        <div className='flex items-center gap-2'>
                          <button
                            type='button'
                            aria-label='Giảm số trẻ em'
                            disabled={children <= 0}
                            onClick={() => setChildren((value) => Math.max(0, value - 1))}
                            className='rounded-full p-1 text-[#173f67] disabled:text-slate-300'
                          ><FiMinus /></button>
                          <strong>{children}</strong>
                          <button
                            type='button'
                            aria-label='Tăng số trẻ em'
                            onClick={() => setChildren((value) => value + 1)}
                            className='rounded-full p-1 text-[#173f67]'
                          ><FiPlus /></button>
                        </div>
                      </div>
                    </div>
                    {state.capacity && (
                      <p className='text-xs text-slate-500'>Sức chứa: tối đa {maxGuests} người</p>
                    )}
                  </div>
                  <p className='flex items-center gap-2'><FiCheck /> Đã kiểm tra phòng trống</p>
                </div>
              </div>
            </div>
          </section>

          <aside className='h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm'>
            <h2 className='text-xl font-bold text-[#173f67]'>Tóm tắt đặt phòng</h2>
            <div className='mt-5 flex justify-between border-b border-slate-100 pb-4 text-slate-600'>
              <span>Giá phòng</span>
              <strong className='text-slate-800'>{formatPrice(livePrice)}</strong>
            </div>
            <div className='mt-4 flex justify-between text-lg font-bold text-[#173f67]'>
              <span>Tạm tính</span>
              <span>{formatPrice(livePrice * roomQuantity)}</span>
            </div>
            <button
              type='button'
              onClick={refreshPrice}
              disabled={isRefreshingPrice}
              className='mt-3 w-full rounded-lg border border-slate-200 py-2 text-sm font-semibold text-[#173f67] hover:bg-slate-50 disabled:opacity-60'
            >
              {isRefreshingPrice ? 'Đang làm mới giá...' : 'Làm mới giá'}
            </button>
            {lastRefreshedAt && (
              <p className='mt-2 text-xs text-slate-400'>
                Giá cập nhật lúc {lastRefreshedAt.toLocaleTimeString('vi-VN')}
              </p>
            )}
            <button
              type='button'
              onClick={goToPayment}
              disabled={isSubmitting}
              className='mt-7 w-full rounded-xl bg-[#ff9d1c] py-4 font-bold text-white shadow-sm transition hover:bg-[#e88908]'
            >
              {isSubmitting ? 'Đang tạo booking...' : 'Xác nhận đặt phòng'}
            </button>
            {error && <p className='mt-3 text-sm text-red-600'>{error}</p>}
          </aside>
        </div>
      </div>
    </main>
  )
}

export default RoomConfirmation
