import { useEffect, useState } from 'react'
import axios from 'axios'

import payoutApi, { type Payout } from '../../apis/payout.api'
import { useAuth } from '../../contexts/app.context'

const statusLabel: Record<string, { text: string; className: string }> = {
  PENDING: { text: 'Chờ chi trả', className: 'bg-amber-50 text-amber-600' },
  PAID: { text: 'Đã chi trả', className: 'bg-emerald-50 text-emerald-600' },
  CANCELLED: { text: 'Đã hủy', className: 'bg-red-50 text-red-600' }
}

const formatMoney = (value: number) =>
  new Intl.NumberFormat('vi-VN').format(Number(value || 0)) + 'đ'

const HotelPayouts = () => {
  const { profile } = useAuth()
  const hotelId = profile?.hotel_id

  const [payouts, setPayouts] = useState<Payout[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchPayouts = async () => {
    if (!hotelId) return
    try {
      setLoading(true)
      setError('')
      const res = await payoutApi.getByHotelId(hotelId)
      setPayouts(res.data?.data || [])
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Không thể tải danh sách payout')
      } else {
        setError('Đã xảy ra lỗi không xác định')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPayouts()
  }, [hotelId])

  const totalReceived = payouts
    .filter((p) => p.status === 'PAID')
    .reduce((sum, p) => sum + Number(p.payout_amount || 0), 0)

  return (
    <div className='p-8'>
      <div className='mb-6'>
        <p className='mb-1 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600'>Hotel</p>
        <h1 className='text-3xl font-bold text-slate-800'>Chi trả (Payout)</h1>
        <p className='mt-2 text-slate-600'>Lịch sử các đợt chi trả từ StayFlow cho khách sạn của bạn.</p>
      </div>

      <div className='mb-6 rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200 max-w-sm'>
        <p className='text-sm text-slate-500'>Tổng đã nhận</p>
        <p className='mt-1 text-2xl font-bold text-emerald-600'>{formatMoney(totalReceived)}</p>
      </div>

      {error && (
        <div className='mb-6 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-red-600'>{error}</div>
      )}

      <div className='rounded-xl bg-white shadow-sm ring-1 ring-slate-200 overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full text-left text-sm'>
            <thead className='bg-slate-50 text-slate-500'>
              <tr>
                <th className='px-6 py-3 font-medium'>Mã payout</th>
                <th className='px-6 py-3 font-medium'>Tổng booking</th>
                <th className='px-6 py-3 font-medium'>Hoa hồng</th>
                <th className='px-6 py-3 font-medium'>Số tiền nhận</th>
                <th className='px-6 py-3 font-medium'>Trạng thái</th>
                <th className='px-6 py-3 font-medium'>Ngày tạo</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-100'>
              {loading && (
                <tr><td colSpan={6} className='px-6 py-6 text-center text-slate-400'>Đang tải dữ liệu...</td></tr>
              )}
              {!loading && payouts.length === 0 && !error && (
                <tr><td colSpan={6} className='px-6 py-6 text-center text-slate-400'>Chưa có payout nào</td></tr>
              )}
              {!loading && payouts.map((p) => (
                <tr key={p.id} className='hover:bg-slate-50'>
                  <td className='px-6 py-3 font-medium text-slate-800'>{p.payout_code}</td>
                  <td className='px-6 py-3 text-slate-600'>{formatMoney(p.total_booking_amount)}</td>
                  <td className='px-6 py-3 text-slate-600'>{formatMoney(p.total_commission)}</td>
                  <td className='px-6 py-3 font-medium text-slate-800'>{formatMoney(p.payout_amount)}</td>
                  <td className='px-6 py-3'>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusLabel[p.status]?.className || 'bg-slate-100 text-slate-500'}`}>
                      {statusLabel[p.status]?.text || p.status}
                    </span>
                  </td>
                  <td className='px-6 py-3 text-slate-500'>{new Date(p.created_at).toLocaleDateString('vi-VN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default HotelPayouts