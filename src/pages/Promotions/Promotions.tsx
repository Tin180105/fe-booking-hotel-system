import { useEffect, useState } from 'react'
import axios from 'axios'
import {
  FiClock,
  FiPercent,
  FiCopy,
  FiBookmark
} from 'react-icons/fi'
import promotionApi, { type Promotion } from '../../apis/promotion.api'
import customerPromotionApi from '../../apis/customerPromotion.api'
import { useAuth } from '../../contexts/app.context'

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('vi-VN').format(new Date(value))

const formatMoney = (value: number) =>
  new Intl.NumberFormat('vi-VN').format(value) + 'đ'

const isPercentageDiscount = (type: string) =>
  type.toLowerCase().includes('percent') || type.includes('%')

const getDiscountLabel = (promotion: Promotion) => {
  if (isPercentageDiscount(promotion.discount_type)) {
    return `${promotion.discount_value}%`
  }

  return formatMoney(promotion.discount_value)
}

const getDiscountTypeLabel = (type: string) =>
  isPercentageDiscount(type) ? 'GIẢM' : 'GIẢM TỐI ĐA'

const Promotions = () => {
  const { isAuthenticated } = useAuth()
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [savedPromotionIds, setSavedPromotionIds] = useState<number[]>([])
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [savingPromotionId, setSavingPromotionId] = useState<number | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let isCancelled = false

    promotionApi.getAll()
      .then(({ data }) => {
        if (!isCancelled) {
          const now = Date.now()
          setPromotions(
            data.data.filter((promotion: Promotion) => (
              promotion.is_active &&
              new Date(promotion.start_date).getTime() <= now &&
              new Date(promotion.end_date).getTime() >= now
            ))
          )
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setError('Không thể tải danh sách khuyến mãi.')
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoading(false)
        }
      })

    return () => {
      isCancelled = true
    }
  }, [])

  useEffect(() => {
    if (!isAuthenticated) {
      return
    }

    customerPromotionApi.getMine()
      .then(({ data }) => {
        setSavedPromotionIds(data.data.map((item) => item.promotion_id))
      })
      .catch(() => {
        setSavedPromotionIds([])
      })
  }, [isAuthenticated])

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)

    setTimeout(() => {
      setCopiedCode(null)
    }, 2000)
  }

  const savePromotion = async (promotionId: number) => {
    if (!isAuthenticated) {
      setError('Vui lòng đăng nhập để lưu mã khuyến mãi.')
      return
    }

    if (savedPromotionIds.includes(promotionId)) {
      return
    }

    setSavingPromotionId(promotionId)
    setError('')

    try {
      await customerPromotionApi.save(promotionId)
      setSavedPromotionIds((current) => [...current, promotionId])
    } catch (saveError: unknown) {
      if (axios.isAxiosError(saveError) && saveError.response?.status === 409) {
        setSavedPromotionIds((current) => (
          current.includes(promotionId)
            ? current
            : [...current, promotionId]
        ))
      } else {
        if (!axios.isAxiosError(saveError) || !saveError.response) {
          setError('Không thể kết nối tới máy chủ. Vui lòng khởi động lại backend.')
          return
        }

        if (saveError.response.status === 401) {
          setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.')
          return
        }

        if (saveError.response.status === 404) {
          setError('Backend chưa có API lưu mã. Vui lòng khởi động lại backend.')
          return
        }

        const message = saveError.response.data?.message
        setError(message || 'Không thể lưu mã khuyến mãi. Hãy kiểm tra bảng customer_promotions.')
      }
    } finally {
      setSavingPromotionId(null)
    }
  }

  return (
    <div className='bg-[#f5f7fa] min-h-screen pb-16'>

      {/* Banner */}
      <section className='relative overflow-hidden bg-[#173f67]'>
        <div className='absolute inset-0'>
          <img
            src='https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1600'
            alt='Khuyến mãi khách sạn'
            className='w-full h-full object-cover opacity-30'
          />
        </div>

        <div className='relative max-w-7xl mx-auto px-6 py-16'>
          <div className='max-w-2xl text-white'>
            <div className='inline-flex items-center gap-2 bg-[#ff9d1c] px-4 py-2 rounded-full text-sm font-semibold mb-5'>
              <FiPercent />
              ƯU ĐÃI ĐẶC BIỆT
            </div>

            <h1 className='text-4xl md:text-5xl font-bold mb-4'>
              Khuyến mãi & Ưu đãi
            </h1>

            <p className='text-lg text-white/85 leading-relaxed'>
              Khám phá những chương trình khuyến mãi hấp dẫn và tiết kiệm
              hơn cho chuyến đi tiếp theo của bạn.
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <main className='max-w-7xl mx-auto px-6'>

        <div className='py-7'>
          <span className='inline-flex items-center bg-[#173f67] text-white px-6 py-2.5 rounded-full font-medium'>
            Tất cả ưu đãi
          </span>
        </div>

        {/* Promotion list */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>

          {isLoading && (
            <p className='md:col-span-2 text-center text-gray-500 py-12'>
              Đang tải khuyến mãi...
            </p>
          )}

          {!isLoading && error && (
            <p className='md:col-span-2 text-center text-red-500 py-12'>
              {error}
            </p>
          )}

          {!isLoading && !error && promotions.length === 0 && (
            <p className='md:col-span-2 text-center text-gray-500 py-12'>
              Hiện chưa có khuyến mãi đang hoạt động.
            </p>
          )}

          {!isLoading && !error && promotions.map((promotion) => (
            <div
              key={promotion.id}
              className='bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition duration-300 border border-gray-100'
            >
              <div className='relative h-32 overflow-hidden bg-[#173f67] flex items-center justify-center'>
                <span className='text-white/90 text-2xl font-bold tracking-widest'>
                  {promotion.code}
                </span>

                {/* Discount */}
                <div className='absolute top-4 left-4 bg-[#ff9d1c] text-white px-4 py-3 rounded-xl shadow-lg text-center'>
                  <div className='text-xs font-medium'>
                    {getDiscountTypeLabel(promotion.discount_type)}
                  </div>

                  <div className='text-2xl font-bold'>
                    {getDiscountLabel(promotion)}
                  </div>
                </div>
              </div>

              <div className='p-6'>

                <h2 className='text-xl font-bold text-[#173f67] mb-2'>
                  Ưu đãi với mã {promotion.code}
                </h2>

                <p className='text-gray-500 text-sm leading-relaxed mb-5'>
                  Tiết kiệm {getDiscountLabel(promotion)} khi sử dụng mã ưu đãi này.
                </p>

                {/* Location + expiry */}
                <div className='flex flex-wrap gap-4 text-sm text-gray-500 mb-5'>

                  <div className='flex items-center gap-2'>
                    <FiClock className='text-[#ff9d1c]' />
                    HSD: {formatDate(promotion.end_date)}
                  </div>

                </div>

                {/* Condition */}
                <div className='bg-[#f5f8fb] rounded-xl p-3 text-sm text-gray-600 mb-5'>
                  <span className='font-semibold'>
                    Điều kiện:
                  </span>{' '}
                  Áp dụng từ {formatDate(promotion.start_date)} đến {formatDate(promotion.end_date)}.
                  {promotion.max_discount !== null && (
                    <> Mức giảm tối đa {formatMoney(promotion.max_discount)}.</>
                  )}
                </div>

                {/* Bottom */}
                <div className='flex items-center justify-between gap-3'>

                  {/* Code */}
                  <button
                    onClick={() => copyCode(promotion.code)}
                    className='flex items-center gap-2 border-2 border-dashed border-[#5dc4d4] px-4 py-2 rounded-lg text-[#173f67] font-bold hover:bg-[#f0fbfd] transition'
                  >
                    <FiCopy />

                    {copiedCode === promotion.code
                      ? 'Đã sao chép!'
                      : promotion.code}
                  </button>

                  <button
                    onClick={() => savePromotion(promotion.id)}
                    disabled={savingPromotionId === promotion.id || (isAuthenticated && savedPromotionIds.includes(promotion.id))}
                    className='flex items-center gap-2 bg-[#173f67] text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-[#123452] transition disabled:opacity-70 disabled:cursor-default'
                  >
                    <FiBookmark />
                    {savingPromotionId === promotion.id
                      ? 'Đang lưu...'
                      : isAuthenticated && savedPromotionIds.includes(promotion.id)
                        ? 'Đã lưu'
                        : 'Lưu mã'}
                  </button>

                </div>
              </div>
            </div>
          ))}

        </div>

        {/* Bottom banner */}
        <section className='mt-10 bg-white rounded-2xl p-8 md:p-10 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6'>

          <div>
            <h2 className='text-2xl font-bold text-[#173f67] mb-2'>
              Đừng bỏ lỡ những ưu đãi mới nhất!
            </h2>

            <p className='text-gray-500'>
              Theo dõi StayFlow để nhận thông báo về các chương trình
              khuyến mãi hấp dẫn.
            </p>
          </div>

          <button className='bg-[#ff9d1c] hover:bg-[#f18d0b] text-white font-bold px-7 py-3 rounded-xl transition whitespace-nowrap'>
            Khám phá khách sạn
          </button>

        </section>

      </main>
    </div>
  )
}

export default Promotions