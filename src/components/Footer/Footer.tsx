import {
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaTiktok,
  FaEnvelope,
  FaPhoneAlt,
  FaApple,
  FaGooglePlay
} from 'react-icons/fa'

import { SiZalo } from 'react-icons/si'

const Footer = () => {
  return (
    <footer className='w-full bg-[#f5f6f8] text-[#374151]'>
      <div className='max-w-[1450px] mx-auto px-6 py-5'>

        {/* ================= TOP ================= */}
        <div className='grid grid-cols-1 lg:grid-cols-5 gap-8 border-b border-gray-300 pb-6'>

          {/* VỀ  */}
          <div>
            <h3 className='font-bold text-[18px] mb-2'>
              Về StayFlow.com
            </h3>

            <ul className='space-y-2 text-[16px] text-gray-500'>
              <li>
                <a href='#' className='hover:text-[#e67e00]'>
                  Về chúng tôi
                </a>
              </li>

              <li>
                <a href='#' className='hover:text-[#e67e00]'>
                  StayFlow Blog
                </a>
              </li>
            </ul>
          </div>

          {/* THÔNG TIN */}
          <div>
            <h3 className='font-bold text-[18px] mb-2'>
              Thông tin cần biết
            </h3>

            <ul className='space-y-2 text-[16px] text-gray-500'>
              <li>
                <a href='#'>Điều kiện & Điều khoản</a>
              </li>

              <li>
                <a href='#'>Quy chế hoạt động</a>
              </li>

              <li>
                <a href='#'>Câu hỏi thường gặp</a>
              </li>
            </ul>
          </div>

          {/* ĐỐI TÁC */}
          <div>
            <h3 className='font-bold text-[18px] mb-2'>
              Đối tác
            </h3>

            <ul className='space-y-2 text-[16px] text-gray-500'>
              <li>
                <a href='#'>Quy chế bảo hiểm Catay</a>
              </li>

              <li>
                <a href='#'>Yêu cầu bồi thường Catay</a>
              </li>

              <li>
                <a href='#'>Quy chế trả góp</a>
              </li>
            </ul>
          </div>

          {/* CMU */}
          <div>
            <h3 className='font-bold text-[18px] mb-2'>
              Thành viên của
            </h3>

            <div className='mt-2'>
              <div className='text-[50px] leading-none font-bold text-[#193f69]'>
                CMU
              </div>

              <div className='text-[12px] text-[#77a53b] text-center w-[140px]'>
                Inspiring People
              </div>
            </div>
          </div>

          {/* CERTIFICATE */}
          <div>
            <h3 className='font-bold text-[18px] mb-2'>
              Được chứng nhận
            </h3>

            <div className='flex items-center gap-3 mt-3'>
              <div className='bg-[#d92d2d] text-white px-3 py-3 rounded-full font-bold'>
                ✓
              </div>

              <div className='bg-[#d92d2d] text-white px-3 py-3 text-[18px] font-bold'>
                ĐÃ ĐĂNG KÝ
              </div>

              <div className='border-2 border-[#1f4e9b] text-[#1f4e9b] rounded-full px-2 py-3 font-bold'>
                TIA
              </div>
            </div>
          </div>
        </div>

        {/* ================= CONTENT ================= */}
        <div className='grid grid-cols-1 lg:grid-cols-[1.65fr_1fr] gap-12 pt-5'>

          {/* LEFT */}
          <div>

            {/* AWARDS */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-8 mb-6'>

              <div className="flex items-center gap-4">
                <div className="text-[#c6a34a]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-[55px] h-[55px]"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418"
                    />
                  </svg>
                </div>

                <p className="font-semibold text-[17px] leading-6">
                  Đại lý Du lịch trực
                  <br />
                  tuyến hàng đầu
                  <br />
                  Việt Nam
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-[#c6a34a]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-[55px] h-[55px]"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
                    />
                  </svg>
                </div>
                <p className="font-semibold text-[17px] leading-6">
                  Nơi làm việc tốt
                  <br />
                  nhất Châu Á
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-[#c6a34a]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-[55px] h-[55px]"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"
                    />
                  </svg>
                </div>

                <p className="font-semibold text-[17px] leading-6">
                  Thương hiệu
                  <br />
                  truyền cảm hứng
                  <br />
                  APEA
                </p>
              </div>
            </div>

            {/* SOCIAL */}
            <div className='flex items-center gap-3 mt-6'>

              <a
                href='#'
                className='w-11 h-11 rounded-full bg-[#3fa7bc] text-white flex items-center justify-center hover:scale-105 transition'
              >
                <SiZalo size={19} />
              </a>

              <a
                href='#'
                className='w-11 h-11 rounded-full bg-[#3fa7bc] text-white flex items-center justify-center hover:scale-105 transition'
              >
                <FaFacebookF size={20} />
              </a>

              <a
                href='#'
                className='w-11 h-11 rounded-full bg-[#3fa7bc] text-white flex items-center justify-center hover:scale-105 transition'
              >
                <FaInstagram size={20} />
              </a>

              <a
                href='#'
                className='w-11 h-11 rounded-full bg-[#3fa7bc] text-white flex items-center justify-center hover:scale-105 transition'
              >
                <FaYoutube size={20} />
              </a>

              <a
                href='#'
                className='w-11 h-11 rounded-full bg-[#3fa7bc] text-white flex items-center justify-center hover:scale-105 transition'
              >
                <FaTiktok size={18} />
              </a>

              <a
                href='#'
                className='w-11 h-11 rounded-full bg-[#3fa7bc] text-white flex items-center justify-center hover:scale-105 transition'
              >
                <FaEnvelope size={19} />
              </a>

            </div>

          </div>

          {/* RIGHT */}
          <div>

            <h3 className='font-bold text-[18px]'>
              Bạn cần trợ giúp? Hãy gọi ngay
            </h3>

            {/* HOTLINE */}
            <div className='flex items-center gap-3 mt-4'>
              <FaPhoneAlt className='text-[#f28c00]' size={27} />

              <span className='font-bold text-[32px] text-[#e97900]'>
                1900 1870
              </span>

              <span className='text-gray-500 text-[17px]'>
                ◷ 7h30 → 21h
              </span>
            </div>

            {/* VIBER */}
            <div className='flex items-center gap-3 mt-6'>
              <div className='w-11 h-11 rounded-full bg-[#76529c] text-white flex items-center justify-center'>
                <FaPhoneAlt size={20} />
              </div>

              <span className='font-bold text-[22px] text-[#193f69]'>
                StayFlow Viber
              </span>
            </div>

            <p className='mt-4 text-[16px]'>
              Tư vấn với Olivia - chatbot của StayFlow
            </p>

            {/* APP */}
            <h3 className='font-bold text-[18px] mt-6'>
              Quét mã QRcode để tải ứng dụng StayFlow ngay
            </h3>

            <div className='flex items-center gap-4 mt-3'>

              {/* QR PLACEHOLDER */}
              <div className='w-[95px] h-[95px] bg-white border-4 border-black flex items-center justify-center text-[11px] text-center'>
                QR CODE
              </div>

              <div className='space-y-2'>

                <button className='w-[150px] bg-black text-white rounded-lg px-3 py-2 flex items-center gap-2'>
                  <FaApple size={25} />

                  <span className='text-left text-[12px] leading-3'>
                    Tải trên
                    <br />
                    <strong className='text-[18px]'>App Store</strong>
                  </span>
                </button>

                <button className='w-[150px] bg-black text-white rounded-lg px-3 py-2 flex items-center gap-2'>
                  <FaGooglePlay size={23} />

                  <span className='text-left text-[12px] leading-3'>
                    TẢI ỨNG DỤNG TRÊN
                    <br />
                    <strong className='text-[16px]'>Google Play</strong>
                  </span>
                </button>

              </div>
            </div>

          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer