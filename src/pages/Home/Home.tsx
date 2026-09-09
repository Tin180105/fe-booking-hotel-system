import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FiSearch,
  FiCalendar,
  FiUsers,
  FiMinus,
  FiPlus,
  FiChevronDown
} from 'react-icons/fi'

import homeHero from '../../assets/images/image.png'
import searchApi from '../../apis/search.api'
import BestCombo from '../../components/BestCombo/BestCombo'
import path from '../../constants/path'

const Home = () => {
  const [destination, setDestination] = useState('')
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')

  const [rooms, setRooms] = useState(1)
  const [adults, setAdults] = useState(2)
  const [children, setChildren] = useState(0)

  const [isGuestOpen, setIsGuestOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const guestRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  // ==============================
  // SEARCH API
  // ==============================

  const handleSearch = async () => {
    try {
      // Validate destination
      if (!destination.trim()) {
        alert('Vui lòng nhập địa điểm')
        return
      }

      // Validate check in
      if (!checkIn) {
        alert('Vui lòng chọn ngày nhận phòng')
        return
      }

      // Validate check out
      if (!checkOut) {
        alert('Vui lòng chọn ngày trả phòng')
        return
      }

      // Validate date
      if (new Date(checkOut) <= new Date(checkIn)) {
        alert('Ngày trả phòng phải sau ngày nhận phòng')
        return
      }

      // Validate rooms
      if (rooms < 1) {
        alert('Số phòng phải lớn hơn 0')
        return
      }

      // Validate adults
      if (adults < 1) {
        alert('Phải có ít nhất 1 người lớn')
        return
      }

      setIsLoading(true)

      // CALL API
      const response = await searchApi.searchHotels({
        destination,
        checkIn,
        checkOut,
        rooms,
        adults,
        children
      })

      const hotels =
        response.data?.data ??
        response.data?.hotels ??
        []

      console.log(
        'Kết quả tìm kiếm:',
        hotels
      )

      navigate(path.search, {
        state: {
          hotels,
          destination,
          checkIn,
          checkOut,
          rooms,
          adults,
          children
        }
      })

    } catch (error) {
      console.error(
        'Lỗi tìm kiếm khách sạn:',
        error
      )

      const message =
        error instanceof Error && error.message
          ? error.message
          : 'Không thể tìm kiếm khách sạn'

      alert(message)

    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>

      {/* ================= HERO ================= */}

      <section className='relative w-full min-h-[650px] overflow-visible'>

        {/* BACKGROUND IMAGE */}

        <img
          src={homeHero}
          alt='Travel background'
          className='absolute inset-0 w-full h-full object-cover'
        />

        {/* DARK OVERLAY */}

        <div className='absolute inset-0 bg-black/30' />

        {/* CONTENT */}

        <div className='relative z-10 max-w-[1450px] mx-auto px-6 pt-16'>

          {/* TITLE */}

          <div className='mb-10'>

            <h1 className='text-white text-[42px] font-bold'>
              Trải nghiệm kỳ nghỉ tuyệt vời
            </h1>

            <p className='text-white text-[24px] mt-2'>
              Khám phá khách sạn và ưu đãi tốt nhất cho chuyến đi của bạn
            </p>

          </div>

          {/* SEARCH BOX */}

          <div className='max-w-[1160px]'>

            {/* DESTINATION */}

            <div className='bg-white rounded-2xl h-[76px] flex items-center px-6 shadow-lg'>

              <FiSearch
                size={30}
                className='text-slate-500'
              />

              <input
                type='text'
                value={destination}
                onChange={(e) =>
                  setDestination(e.target.value)
                }
                placeholder='Bạn muốn đi đâu?'
                className='flex-1 ml-5 outline-none text-[21px] text-slate-700'
              />

            </div>

            {/* SEARCH INFORMATION */}

            <div className='mt-4 flex gap-4'>

              {/* CHECK IN */}

              <div className='flex-1 bg-white rounded-2xl min-h-[90px] flex items-center px-5 shadow-lg'>

                <FiCalendar
                  size={28}
                  className='text-slate-500'
                />

                <div className='ml-4 flex flex-col'>

                  <span className='text-slate-500 text-[15px]'>
                    Nhận phòng
                  </span>

                  <input
                    type='date'
                    value={checkIn}
                    onChange={(e) =>
                      setCheckIn(e.target.value)
                    }
                    className='font-semibold text-[17px] outline-none'
                  />

                </div>

              </div>

              {/* CHECK OUT */}

              <div className='flex-1 bg-white rounded-2xl min-h-[90px] flex items-center px-5 shadow-lg'>

                <FiCalendar
                  size={28}
                  className='text-slate-500'
                />

                <div className='ml-4 flex flex-col'>

                  <span className='text-slate-500 text-[15px]'>
                    Trả phòng
                  </span>

                  <input
                    type='date'
                    value={checkOut}
                    onChange={(e) =>
                      setCheckOut(e.target.value)
                    }
                    className='font-semibold text-[17px] outline-none'
                  />

                </div>

              </div>

              {/* GUEST */}

              <div
                ref={guestRef}
                className='relative flex-1'
              >

                <button
                  type='button'
                  onClick={() =>
                    setIsGuestOpen(!isGuestOpen)
                  }
                  className='w-full bg-white rounded-2xl min-h-[90px] flex items-center px-5 shadow-lg text-left'
                >

                  <FiUsers
                    size={30}
                    className='text-slate-500'
                  />

                  <div className='ml-4 flex-1'>

                    <div className='text-slate-500 text-[15px]'>
                      Khách và phòng
                    </div>

                    <div className='font-semibold text-[17px]'>

                      {rooms} phòng

                    </div>

                    <div className='text-[15px] text-slate-600'>

                      {adults} người lớn, {children} trẻ em

                    </div>

                  </div>

                  <FiChevronDown
                    className={`text-slate-500 transition-transform ${
                      isGuestOpen
                        ? 'rotate-180'
                        : ''
                    }`}
                  />

                </button>

                {/* ================= GUEST DROPDOWN ================= */}

                {isGuestOpen && (

                  <div className='absolute top-[100px] left-0 w-full min-w-[320px] bg-white rounded-2xl shadow-xl p-5 z-50'>

                    {/* ROOMS */}

                    <div className='flex justify-between items-center py-3 border-b'>

                      <div>

                        <div className='font-semibold'>
                          Phòng
                        </div>

                      </div>

                      <div className='flex items-center gap-4'>

                        <button
                          type='button'
                          onClick={() =>
                            setRooms(
                              Math.max(
                                1,
                                rooms - 1
                              )
                            )
                          }
                          className='w-8 h-8 rounded-full border flex items-center justify-center'
                        >

                          <FiMinus />

                        </button>

                        <span className='w-5 text-center'>
                          {rooms}
                        </span>

                        <button
                          type='button'
                          onClick={() =>
                            setRooms(
                              rooms + 1
                            )
                          }
                          className='w-8 h-8 rounded-full border flex items-center justify-center'
                        >

                          <FiPlus />

                        </button>

                      </div>

                    </div>

                    {/* ADULTS */}

                    <div className='flex justify-between items-center py-3 border-b'>

                      <div>

                        <div className='font-semibold'>
                          Người lớn
                        </div>

                        <div className='text-sm text-slate-500'>
                          Từ 18 tuổi trở lên
                        </div>

                      </div>

                      <div className='flex items-center gap-4'>

                        <button
                          type='button'
                          onClick={() =>
                            setAdults(
                              Math.max(
                                1,
                                adults - 1
                              )
                            )
                          }
                          className='w-8 h-8 rounded-full border flex items-center justify-center'
                        >

                          <FiMinus />

                        </button>

                        <span className='w-5 text-center'>
                          {adults}
                        </span>

                        <button
                          type='button'
                          onClick={() =>
                            setAdults(
                              adults + 1
                            )
                          }
                          className='w-8 h-8 rounded-full border flex items-center justify-center'
                        >

                          <FiPlus />

                        </button>

                      </div>

                    </div>

                    {/* CHILDREN */}

                    <div className='flex justify-between items-center py-3'>

                      <div>

                        <div className='font-semibold'>
                          Trẻ em
                        </div>

                        <div className='text-sm text-slate-500'>
                          Dưới 18 tuổi
                        </div>

                      </div>

                      <div className='flex items-center gap-4'>

                        <button
                          type='button'
                          onClick={() =>
                            setChildren(
                              Math.max(
                                0,
                                children - 1
                              )
                            )
                          }
                          className='w-8 h-8 rounded-full border flex items-center justify-center'
                        >

                          <FiMinus />

                        </button>

                        <span className='w-5 text-center'>
                          {children}
                        </span>

                        <button
                          type='button'
                          onClick={() =>
                            setChildren(
                              children + 1
                            )
                          }
                          className='w-8 h-8 rounded-full border flex items-center justify-center'
                        >

                          <FiPlus />

                        </button>

                      </div>

                    </div>

                  </div>

                )}

              </div>

              {/* ================= SEARCH BUTTON ================= */}

              <button
                type='button'
                onClick={handleSearch}
                disabled={isLoading}
                className='bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 disabled:cursor-not-allowed text-white px-10 rounded-2xl text-[22px] font-bold shadow-lg transition'
              >

                {isLoading
                  ? 'Đang tìm...'
                  : 'Tìm'}

              </button>

            </div>

          </div>

        </div>

      </section>
      <BestCombo />
    </div>
  )
}

export default Home