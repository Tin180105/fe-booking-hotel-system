import { useState } from 'react'
import {
  FiSearch,
  FiCalendar,
  FiUsers,
} from 'react-icons/fi'

import homeHero from '../../assets/images/image.png'

const Home = () => {
  const [destination, setDestination] = useState('')
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')

  return (
    <div>

      {/* HERO */}
      {/* HERO */}
        <section className='relative w-full min-h-[650px] overflow-hidden'>

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
                onChange={(e) => setDestination(e.target.value)}
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
                    onChange={(e) => setCheckIn(e.target.value)}
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
                    onChange={(e) => setCheckOut(e.target.value)}
                    className='font-semibold text-[17px] outline-none'
                    />
                </div>

                </div>

                {/* GUEST */}
                <div className='flex-1 bg-white rounded-2xl min-h-[90px] flex items-center px-5 shadow-lg'>

                <FiUsers
                    size={30}
                    className='text-slate-500'
                />

                <div className='ml-4'>
                    <div className='text-slate-500 text-[15px]'>
                    Khách và phòng
                    </div>

                    <div className='font-semibold text-[17px]'>
                    1 phòng
                    </div>

                    <div className='text-[15px] text-slate-600'>
                    2 người lớn, 0 trẻ em
                    </div>
                </div>

                </div>

                {/* SEARCH BUTTON */}
                <button
                type='button'
                className='bg-orange-500 hover:bg-orange-600 text-white px-10 rounded-2xl text-[22px] font-bold shadow-lg transition'
                >
                Tìm
                </button>

            </div>
            </div>

        </div>

        </section>
    </div>
  )
}

export default Home