import {
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaTiktok,
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
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

          {/* VỀ iVIVU */}
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
                  iVIVU Blog
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

          {/* TMC */}
          <div>
            <h3 className='font-bold text-[18px] mb-2'>
              Thành viên của
            </h3>

            <div className='mt-2'>
              <div className='text-[50px] leading-none font-bold text-[#193f69]'>
                TMC
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

              <div className='flex items-center gap-4'>
                <div className='text-[#c6a34a] text-[55px]'>
                  🏆
                </div>

                <p className='font-semibold text-[17px] leading-6'>
                  Đại lý Du lịch trực
                  <br />
                  tuyến hàng đầu
                  <br />
                  Việt Nam
                </p>
              </div>

              <div className='flex items-center gap-4'>
                <div className='text-[45px]'>
                  ♟️
                </div>

                <p className='font-semibold text-[17px] leading-6'>
                  Nơi làm việc tốt
                  <br />
                  nhất Châu Á
                </p>
              </div>

              <div className='flex items-center gap-4'>
                <div className='text-[45px]'>
                  🏆
                </div>

                <p className='font-semibold text-[17px] leading-6'>
                  Thương hiệu
                  <br />
                  truyền cảm hứng
                  <br />
                  APEA
                </p>
              </div>

            </div>

            {/* COMPANY INFO */}
            <div className='space-y-3 text-[16px] text-[#4b5563]'>

              <p>
                ĐKKD: 0312788481, Ngày cấp: 21/05/2014, Sở kế hoạch đầu tư
                thành phố Hồ Chí Minh
              </p>

              <div className='flex items-center gap-2'>
                <FaMapMarkerAlt className='text-gray-500' />

                <p>
                  <strong>HCM:</strong> Tầng 2, Tòa nhà Anh Đăng, 215 Nam Kỳ
                  Khởi Nghĩa, Phường Xuân Hòa, TP.Hồ Chí Minh
                  <span className='text-gray-400'> (Xem bản đồ)</span>
                </p>
              </div>

              <div className='flex items-center gap-2'>
                <FaMapMarkerAlt className='text-gray-500' />

                <p>
                  <strong>HN:</strong> Tầng 8, Tòa nhà VietBank, 70-72 Bà Triệu,
                  Phường Cửa Nam, Hà Nội
                  <span className='text-gray-400'> (Xem bản đồ)</span>
                </p>
              </div>

              <div className='flex items-center gap-2'>
                <FaMapMarkerAlt className='text-gray-500' />

                <p>
                  <strong>Cần Thơ:</strong> Tầng 7 - Tòa nhà STS - 11B Đại Lộ
                  Hòa Bình, Phường Ninh Kiều, TP.Cần Thơ
                  <span className='text-gray-400'> (Xem bản đồ)</span>
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
                iVIVU Viber
              </span>
            </div>

            <p className='mt-4 text-[16px]'>
              Tư vấn với Olivia - chatbot của iVIVU
            </p>

            {/* APP */}
            <h3 className='font-bold text-[18px] mt-6'>
              Quét mã QRcode để tải ứng dụng iVIVU ngay
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