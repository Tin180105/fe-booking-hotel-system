import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  FiCalendar,
  FiMapPin,
  FiUser,
  FiMail,
  FiPhone,
  FiCreditCard,
  FiShield,
  FiCheck,
  FiTag,
  FiXCircle
} from 'react-icons/fi'
import bookingApi from '../../apis/booking.api'
import paymentApi from '../../apis/payment.api'
import promotionApi, { type Promotion } from '../../apis/promotion.api'
import customerPromotionApi from '../../apis/customerPromotion.api'
import { useAuth } from '../../contexts/app.context'

interface PaymentState {
  hotelId?: number
  hotelName?: string
  hotelAddress?: string
  roomTypeId?: number
  roomName?: string
  imageUrl?: string
  checkIn?: string
  checkOut?: string
  rooms?: number
  adults?: number
  children?: number
  price?: number
  bookingId?: number
  bookingCode?: string
  bookingStatus?: string
  finalAmount?: number
}

const Payment = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, profile } = useAuth()

  const state = (location.state || {}) as PaymentState

  const [paymentMethod, setPaymentMethod] = useState('card')
  const [promoCode, setPromoCode] = useState('')
  const [savedPromotions, setSavedPromotions] = useState<Promotion[]>([])
  const [discount, setDiscount] = useState(0)
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null)
  const [isApplyingPromo, setIsApplyingPromo] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bookingId, setBookingId] = useState<number | null>(state.bookingId ?? null)
  const [bookingCode, setBookingCode] = useState(state.bookingCode || '')
  const [bookingStatus, setBookingStatus] = useState<string | null>(state.bookingStatus || null)
  const [isCancelling, setIsCancelling] = useState(false)
  const [error, setError] = useState('')
  const [cancelError, setCancelError] = useState('')
  const [nonRepeatableWarning, setNonRepeatableWarning] = useState<{
    firstReadStatus: string
    secondReadStatus: string
  } | null>(null)

  const [customer, setCustomer] = useState({
    fullName: '',
    email: '',
    phone: ''
  })

  useEffect(() => {
    if (!isAuthenticated) {
      return
    }

    const loadSavedPromotions = async () => {
      try {
        const [savedResponse, promotionsResponse] = await Promise.all([
          customerPromotionApi.getMine(),
          promotionApi.getAll()
        ])
        const savedIds = new Set(
          savedResponse.data.data.map((item) => item.promotion_id)
        )
        const now = Date.now()

        setSavedPromotions(
          promotionsResponse.data.data.filter((promotion) => (
            savedIds.has(promotion.id) &&
            promotion.is_active &&
            new Date(promotion.start_date).getTime() <= now &&
            new Date(promotion.end_date).getTime() >= now
          ))
        )
      } catch {
        setSavedPromotions([])
      }
    }

    loadSavedPromotions()
  }, [isAuthenticated])

  const hasUnitPrice = Boolean(state.price)
  const roomPrice = state.price || 0
  const roomQuantity = state.rooms || 1

  const totalRoomPrice = roomPrice * roomQuantity

  const finalPrice = totalRoomPrice - discount

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN') + 'đ'
  }


  const calculateNights = () => {
    if (!state.checkIn || !state.checkOut) {
      return 1
    }

    const checkIn = new Date(state.checkIn)
    const checkOut = new Date(state.checkOut)

    const diff =
      checkOut.getTime() - checkIn.getTime()

    const nights = Math.ceil(
      diff / (1000 * 60 * 60 * 24)
    )

    return nights > 0 ? nights : 1
  }

  const nights = calculateNights()

  // Khi vào bằng "Tiếp tục thanh toán" (booking đã tồn tại), không còn đơn giá
  // phòng gốc để tính lại từ đầu -> dùng thẳng final_amount đã lưu của booking.
  const displayTotal = hasUnitPrice
    ? Math.max(0, finalPrice * nights)
    : Math.max(0, Number(state.finalAmount ?? 0) - discount)

  const applyPromotion = (promotion: Promotion) => {
    const rawDiscount = promotion.discount_type === 'PERCENTAGE'
      ? totalRoomPrice * Number(promotion.discount_value) / 100
      : Number(promotion.discount_value)
    const cappedDiscount = promotion.max_discount === null
      ? rawDiscount
      : Math.min(rawDiscount, Number(promotion.max_discount))

    setPromoCode(promotion.code)
    setSelectedPromotion(promotion)
    setDiscount(Math.min(cappedDiscount, totalRoomPrice))
    setError('')
  }

  const handleApplyPromo = async () => {
    const promotion = savedPromotions.find((item) => item.code === promoCode)

    if (!promotion) {
      setSelectedPromotion(null)
      setDiscount(0)
      setError('Vui lòng chọn một mã khuyến mãi đã lưu.')
      return
    }

    setIsApplyingPromo(true)
    applyPromotion(promotion)
    setIsApplyingPromo(false)
  }

  const handlePayment = async () => {
    if (
      !customer.fullName ||
      !customer.email ||
      !customer.phone
    ) {
      setError('Vui lòng nhập đầy đủ thông tin khách hàng.')
      return
    }

    if (!isAuthenticated || !profile?.id) {
      setError('Vui lòng đăng nhập để tiếp tục đặt phòng.')
      return
    }

    if (!state.hotelId || !state.roomTypeId || !state.checkIn || !state.checkOut) {
      setError('Thông tin phòng hoặc ngày lưu trú chưa đầy đủ.')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      let paymentBookingId = bookingId
      let paymentAmount = Number(state.finalAmount ?? 0)

      if (!paymentBookingId) {
        const bookingResponse = await bookingApi.create({
          hotel_id: state.hotelId,
          customer_id: profile.id,
          room_type_id: state.roomTypeId,
          quantity: roomQuantity,
          check_in: state.checkIn,
          check_out: state.checkOut,
          promotion_id: selectedPromotion?.id ?? null
        })

        const createdBooking = bookingResponse.data.data
        paymentBookingId = createdBooking.booking_id
        paymentAmount = Number(createdBooking.final_amount)
        setBookingId(createdBooking.booking_id)
        setBookingCode(createdBooking.booking_code)
        setBookingStatus(createdBooking.status)
      }

      const paymentResponse = await paymentApi.create({
        booking_id: paymentBookingId,
        payment_method: paymentMethod,
        amount: paymentAmount
      })
      const check = paymentResponse.data.data.nonRepeatableCheck
      if (check?.changed) {
        setNonRepeatableWarning({
          firstReadStatus: check.firstReadStatus,
          secondReadStatus: check.secondReadStatus
        })
      } else {
        setNonRepeatableWarning(null)
      }

      if (paymentResponse.data.data.payment_status !== 'SUCCESS') {
        setBookingStatus('PENDING')
        setError('Thanh toán chưa thành công. Vui lòng kiểm tra lại thông tin.')
        return
      }

      setBookingStatus('CONFIRMED')
      alert(`Đặt phòng thành công! Mã đặt phòng: ${bookingCode}`)
      navigate('/')
    } catch (requestError: unknown) {
      const responseMessage = axios.isAxiosError(requestError)
        ? requestError.response?.data?.message
        : requestError instanceof Error
          ? requestError.message
          : ''

      setError(
        responseMessage ||
        'Không thể hoàn tất đặt phòng. Vui lòng thử lại.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancelPayment = async () => {
    if (!bookingId) {
      navigate(-1)
      return
    }

    // DEMO DEADLOCK: bỏ điều kiện "bookingStatus !== 'PENDING' return" và
    // bỏ window.confirm chặn thao tác, để có thể bấm "Hủy thanh toán" NGAY
    // trong lúc nút "Thanh toán" đang xử lý (isSubmitting = true), trên
    // cùng 1 tab, không cần rời trang Payment.

    try {
      setIsCancelling(true)
      setCancelError('')
      const response = await bookingApi.updateStatus(bookingId, 'CANCELLED')
      setBookingStatus(response.data.data?.status || 'CANCELLED')
    } catch (requestError: unknown) {
      const responseMessage = axios.isAxiosError(requestError)
        ? requestError.response?.data?.message
        : requestError instanceof Error
          ? requestError.message
          : ''

      setCancelError(responseMessage || 'Không thể hủy thanh toán. Vui lòng thử lại.')
    } finally {
      setIsCancelling(false)
    }
  }

  const bookingStatusText: Record<string, string> = {
    PENDING: 'Đang chờ thanh toán',
    CONFIRMED: 'Đã xác nhận',
    CANCELLED: 'Đã hủy'
  }

  return (
    <div className='min-h-screen bg-[#f5f7fa] py-8'>

      <div className='max-w-7xl mx-auto px-6'>

        {/* Breadcrumb */}
        <div className='flex items-center gap-2 text-sm text-gray-500 mb-6'>
          <span>Trang chủ</span>
          <span>›</span>
          <span>Chọn phòng</span>
          <span>›</span>
          <span className='text-[#173f67] font-semibold'>
            Thanh toán
          </span>
        </div>

        {/* Title */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-[#173f67]'>
            Thanh toán đặt phòng
          </h1>

          <p className='text-gray-500 mt-2'>
            Kiểm tra thông tin và hoàn tất đặt phòng của bạn.
          </p>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-7'>

          {/* LEFT */}
          <div className='space-y-6'>

            {/* Customer information */}
            <section className='bg-white rounded-2xl shadow-sm p-6'>

              <div className='flex items-center gap-3 mb-6'>
                <div className='w-10 h-10 rounded-full bg-[#eaf7fa] flex items-center justify-center'>
                  <FiUser className='text-[#173f67] text-xl' />
                </div>

                <div>
                  <h2 className='text-xl font-bold text-[#173f67]'>
                    Thông tin khách hàng
                  </h2>

                  <p className='text-sm text-gray-500'>
                    Thông tin dùng để xác nhận đặt phòng
                  </p>
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>

                {/* Full name */}
                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-2'>
                    Họ và tên
                  </label>

                  <div className='relative'>
                    <FiUser className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400' />

                    <input
                      type='text'
                      value={customer.fullName}
                      onChange={(e) =>
                        setCustomer({
                          ...customer,
                          fullName: e.target.value
                        })
                      }
                      placeholder='Nhập họ và tên'
                      className='w-full border border-gray-200 rounded-xl py-3 pl-11 pr-4 outline-none focus:border-[#5dc4d4] focus:ring-2 focus:ring-[#5dc4d4]/20'
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-2'>
                    Số điện thoại
                  </label>

                  <div className='relative'>
                    <FiPhone className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400' />

                    <input
                      type='tel'
                      value={customer.phone}
                      onChange={(e) =>
                        setCustomer({
                          ...customer,
                          phone: e.target.value
                        })
                      }
                      placeholder='Nhập số điện thoại'
                      className='w-full border border-gray-200 rounded-xl py-3 pl-11 pr-4 outline-none focus:border-[#5dc4d4] focus:ring-2 focus:ring-[#5dc4d4]/20'
                    />
                  </div>
                </div>

                {/* Email */}
                <div className='md:col-span-2'>
                  <label className='block text-sm font-semibold text-gray-700 mb-2'>
                    Email
                  </label>

                  <div className='relative'>
                    <FiMail className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400' />

                    <input
                      type='email'
                      value={customer.email}
                      onChange={(e) =>
                        setCustomer({
                          ...customer,
                          email: e.target.value
                        })
                      }
                      placeholder='Nhập địa chỉ email'
                      className='w-full border border-gray-200 rounded-xl py-3 pl-11 pr-4 outline-none focus:border-[#5dc4d4] focus:ring-2 focus:ring-[#5dc4d4]/20'
                    />
                  </div>
                </div>

              </div>
            </section>

            {/* Booking information */}
            <section className='bg-white rounded-2xl shadow-sm p-6'>

              <div className='flex items-center gap-3 mb-6'>
                <div className='w-10 h-10 rounded-full bg-[#eaf7fa] flex items-center justify-center'>
                  <FiCalendar className='text-[#173f67] text-xl' />
                </div>

                <div>
                  <h2 className='text-xl font-bold text-[#173f67]'>
                    Thông tin lưu trú
                  </h2>

                  <p className='text-sm text-gray-500'>
                    Thời gian và số lượng phòng
                  </p>
                </div>
              </div>

              <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>

                <div className='bg-[#f7f9fb] rounded-xl p-4'>
                  <p className='text-xs text-gray-500 mb-1'>
                    Nhận phòng
                  </p>

                  <p className='font-semibold text-[#173f67]'>
                    {state.checkIn || '--/--/----'}
                  </p>
                </div>

                <div className='bg-[#f7f9fb] rounded-xl p-4'>
                  <p className='text-xs text-gray-500 mb-1'>
                    Trả phòng
                  </p>

                  <p className='font-semibold text-[#173f67]'>
                    {state.checkOut || '--/--/----'}
                  </p>
                </div>

                <div className='bg-[#f7f9fb] rounded-xl p-4'>
                  <p className='text-xs text-gray-500 mb-1'>
                    Số đêm
                  </p>

                  <p className='font-semibold text-[#173f67]'>
                    {nights} đêm
                  </p>
                </div>

                <div className='bg-[#f7f9fb] rounded-xl p-4'>
                  <p className='text-xs text-gray-500 mb-1'>
                    Số phòng
                  </p>

                  <p className='font-semibold text-[#173f67]'>
                    {roomQuantity} phòng
                  </p>
                </div>

              </div>

              <div className='flex flex-wrap gap-5 mt-5 text-sm text-gray-600'>
                <span>
                  👤 {state.adults || 0} người lớn
                </span>

                <span>
                  👶 {state.children || 0} trẻ em
                </span>
              </div>

            </section>

            {/* Payment method */}
            <section className='bg-white rounded-2xl shadow-sm p-6'>

              <div className='flex items-center gap-3 mb-6'>
                <div className='w-10 h-10 rounded-full bg-[#eaf7fa] flex items-center justify-center'>
                  <FiCreditCard className='text-[#173f67] text-xl' />
                </div>

                <div>
                  <h2 className='text-xl font-bold text-[#173f67]'>
                    Phương thức thanh toán
                  </h2>

                  <p className='text-sm text-gray-500'>
                    Chọn phương thức thanh toán của bạn
                  </p>
                </div>
              </div>

              <div className='space-y-3'>

                {/* Card */}
                <button
                  type='button'
                  onClick={() => setPaymentMethod('card')}
                  className={`w-full flex items-center gap-4 border rounded-xl p-4 text-left transition ${
                    paymentMethod === 'card'
                      ? 'border-[#5dc4d4] bg-[#f1fbfd]'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >

                  <div className='w-11 h-11 bg-white rounded-lg flex items-center justify-center border'>
                    <FiCreditCard className='text-[#173f67] text-xl' />
                  </div>

                  <div className='flex-1'>
                    <p className='font-semibold text-gray-800'>
                      Thẻ tín dụng / ghi nợ
                    </p>

                    <p className='text-sm text-gray-500'>
                      Visa, Mastercard, JCB
                    </p>
                  </div>

                  {paymentMethod === 'card' && (
                    <FiCheck className='text-[#5dc4d4] text-xl' />
                  )}

                </button>

                {/* Bank */}
                <button
                  type='button'
                  onClick={() => setPaymentMethod('bank')}
                  className={`w-full flex items-center gap-4 border rounded-xl p-4 text-left transition ${
                    paymentMethod === 'bank'
                      ? 'border-[#5dc4d4] bg-[#f1fbfd]'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >

                  <div className='w-11 h-11 bg-white rounded-lg flex items-center justify-center border text-xl'>
                    🏦
                  </div>

                  <div className='flex-1'>
                    <p className='font-semibold text-gray-800'>
                      Chuyển khoản ngân hàng
                    </p>

                    <p className='text-sm text-gray-500'>
                      Thanh toán qua tài khoản ngân hàng
                    </p>
                  </div>

                  {paymentMethod === 'bank' && (
                    <FiCheck className='text-[#5dc4d4] text-xl' />
                  )}

                </button>

                {/* Cash */}
                <button
                  type='button'
                  onClick={() => setPaymentMethod('cash')}
                  className={`w-full flex items-center gap-4 border rounded-xl p-4 text-left transition ${
                    paymentMethod === 'cash'
                      ? 'border-[#5dc4d4] bg-[#f1fbfd]'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >

                  <div className='w-11 h-11 bg-white rounded-lg flex items-center justify-center border text-xl'>
                    💵
                  </div>

                  <div className='flex-1'>
                    <p className='font-semibold text-gray-800'>
                      Thanh toán tại khách sạn
                    </p>

                    <p className='text-sm text-gray-500'>
                      Thanh toán khi nhận phòng
                    </p>
                  </div>

                  {paymentMethod === 'cash' && (
                    <FiCheck className='text-[#5dc4d4] text-xl' />
                  )}

                </button>

              </div>

            </section>

          </div>

          {/* RIGHT */}
          <div>

            <div className='bg-white rounded-2xl shadow-sm overflow-hidden sticky top-6'>

              {/* Hotel image */}
              <div className='relative h-52'>

                {state.imageUrl ? (
                  <img
                    src={state.imageUrl}
                    alt={state.roomName}
                    className='w-full h-full object-cover'
                  />
                ) : (
                  <div className='w-full h-full bg-[#173f67] flex items-center justify-center text-white'>
                    Không có hình ảnh
                  </div>
                )}

              </div>

              <div className='p-6'>

                <p className='text-sm text-gray-500 mb-1'>
                  Khách sạn
                </p>

                <h2 className='text-xl font-bold text-[#173f67]'>
                  {state.hotelName || 'Khách sạn StayFlow'}
                </h2>

                <div className='flex items-center gap-2 text-sm text-gray-500 mt-2'>
                  <FiMapPin />
                  {state.hotelAddress || 'Việt Nam'}
                </div>

                <div className='border-t border-gray-100 my-5' />

                {/* Room */}
                <div className='mb-5'>

                  <p className='text-sm text-gray-500'>
                    Phòng đã chọn
                  </p>

                  <p className='font-bold text-gray-800 mt-1'>
                    {state.roomName || 'Phòng khách sạn'}
                  </p>

                </div>

                {/* Price */}
                {hasUnitPrice && (
                <div className='space-y-3 text-sm'>

                  <div className='flex justify-between'>
                    <span className='text-gray-500'>
                      Giá phòng
                    </span>

                    <span className='font-medium'>
                      {formatPrice(roomPrice)}
                    </span>
                  </div>

                  <div className='flex justify-between'>
                    <span className='text-gray-500'>
                      Số phòng
                    </span>

                    <span className='font-medium'>
                      × {roomQuantity}
                    </span>
                  </div>

                  <div className='flex justify-between'>
                    <span className='text-gray-500'>
                      Số đêm
                    </span>

                    <span className='font-medium'>
                      × {nights}
                    </span>
                  </div>

                  <div className='flex justify-between'>
                    <span className='text-gray-700 font-medium'>
                      Tạm tính
                    </span>

                    <span className='font-semibold'>
                      {formatPrice(
                        totalRoomPrice * nights
                      )}
                    </span>
                  </div>

                </div>
                )}

                {/* Promotion */}
                <div className='mt-5'>

                  <label className='text-sm font-semibold text-gray-700 mb-2 block'>
                    Mã khuyến mãi
                  </label>

                  <div className='flex gap-2'>

                    <div className='relative flex-1'>
                      <FiTag className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' />

                      <select
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        disabled={savedPromotions.length === 0}
                        className='w-full appearance-none border border-gray-200 rounded-lg py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#5dc4d4] disabled:bg-gray-100 disabled:text-gray-400'
                      >
                        <option value=''>
                          {savedPromotions.length === 0
                            ? 'Chưa có mã đã lưu'
                            : 'Chọn mã khuyến mãi'}
                        </option>
                        {savedPromotions.map((promotion) => (
                          <option key={promotion.id} value={promotion.code}>
                            {promotion.code} - {promotion.discount_type === 'PERCENTAGE'
                              ? `${promotion.discount_value}%`
                              : formatPrice(Number(promotion.discount_value))}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={handleApplyPromo}
                      disabled={isApplyingPromo}
                      className='px-4 bg-[#173f67] text-white rounded-lg text-sm font-semibold hover:bg-[#123452]'
                    >
                      {isApplyingPromo ? 'Đang áp dụng...' : 'Áp dụng'}
                    </button>

                  </div>

                  {selectedPromotion && discount > 0 && (
                    <p className='text-green-600 text-sm mt-2'>
                      ✓ Đã áp dụng mã giảm giá
                    </p>
                  )}

                </div>

                {/* Discount */}
                {discount > 0 && (
                  <div className='flex justify-between mt-4 text-sm'>
                    <span className='text-green-600'>
                      Giảm giá
                    </span>

                    <span className='text-green-600 font-semibold'>
                      -{formatPrice(discount)}
                    </span>
                  </div>
                )}

                {/* Total */}
                <div className='border-t border-gray-100 mt-5 pt-5'>

                  <div className='flex items-end justify-between'>

                    <div>
                      <p className='text-sm text-gray-500'>
                        Tổng thanh toán
                      </p>

                      <p className='text-xs text-gray-400 mt-1'>
                        Đã bao gồm các khoản phí
                      </p>
                    </div>

                    <p className='text-2xl font-bold text-[#ff9d1c]'>
                      {formatPrice(displayTotal)}
                    </p>

                  </div>

                </div>

                <div className='mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2'>
                  <button
                    type='button'
                    onClick={handleCancelPayment}
                    disabled={isCancelling || bookingStatus === 'CANCELLED'}
                    className='inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 py-4 font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50'
                  >
                    <FiXCircle />
                    {isCancelling ? 'Đang hủy...' : 'Hủy thanh toán'}
                  </button>

                  <button
                    type='button'
                    onClick={handlePayment}
                    disabled={isSubmitting || bookingStatus === 'CANCELLED'}
                    className='inline-flex items-center justify-center rounded-xl bg-[#ff9d1c] py-4 font-bold text-white shadow-sm transition hover:bg-[#f18d0b] disabled:cursor-not-allowed disabled:opacity-50'
                  >
                    {isSubmitting ? 'Đang xử lý...' : 'Thanh toán'}
                  </button>
                </div>

                {isSubmitting && (
                  <div className='mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700'>
                    ⏳ Đang chờ cổng thanh toán phản hồi, việc này có thể mất vài giây...
                    Nếu chờ quá lâu, bạn vẫn có thể bấm <strong>"Hủy thanh toán"</strong> ngay bây giờ.
                  </div>
                )}

                {bookingStatus && (
                  <div className='mt-4 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-[#173f67]'>
                    <div className='flex items-center justify-between gap-3'>
                      <span>
                        Trạng thái booking: <strong>{bookingStatusText[bookingStatus] || bookingStatus}</strong>
                      </span>
                    </div>
                  </div>
                )}

                {error && (
                  <p className='text-red-500 text-sm mt-3'>[Thanh toán] {error}</p>
                )}

                {cancelError && (
                  <p className='text-red-500 text-sm mt-3'>[Hủy thanh toán] {cancelError}</p>
                )}
                {nonRepeatableWarning && (
                <div className='mt-4 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-700'>
                  ⚠️ Trạng thái booking đã thay đổi trong lúc hệ thống chờ cổng thanh toán phản hồi
                  (Non-repeatable Read): lúc bắt đầu xử lý là{' '}
                  <strong>{nonRepeatableWarning.firstReadStatus}</strong>, nhưng khi xác nhận lại là{' '}
                  <strong>{nonRepeatableWarning.secondReadStatus}</strong>.
                </div>
              )}

                <div className='flex items-center justify-center gap-2 text-xs text-gray-500 mt-4'>
                  <FiShield className='text-green-500' />
                  Thông tin thanh toán được bảo mật
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  )
}

export default Payment