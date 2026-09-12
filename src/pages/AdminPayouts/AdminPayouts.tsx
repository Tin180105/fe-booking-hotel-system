import { useEffect, useState } from 'react'
import axios from 'axios'
import { MdClose } from 'react-icons/md'

import payoutApi, { type Payout } from '../../apis/payout.api'
import hotelApi from '../../apis/hotel.api'
import type { HotelOverview } from '../../types/hotel.type'

const statusOptions = ['PENDING', 'PAID', 'CANCELLED']

const statusLabel: Record<string, { text: string; className: string }> = {
  PENDING: { text: 'Chờ chi trả', className: 'bg-amber-50 text-amber-600' },
  PAID: { text: 'Đã chi trả', className: 'bg-emerald-50 text-emerald-600' },
  CANCELLED: { text: 'Đã hủy', className: 'bg-red-50 text-red-600' }
}

const formatMoney = (value: number) =>
  new Intl.NumberFormat('vi-VN').format(Number(value || 0)) + 'đ'

const AdminPayouts = () => {
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [hotels, setHotels] = useState<HotelOverview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [statusUpdatingId, setStatusUpdatingId] = useState<number | null>(null)

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [createForm, setCreateForm] = useState({ hotel_id: '', payout_code: '' })
  const [createError, setCreateError] = useState('')
  const [creating, setCreating] = useState(false)

  const fetchPayouts = async () => {
    try {
      setLoading(true)
      setError('')
      const res = await payoutApi.getAll()
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
    hotelApi.getOverview().then((res) => setHotels(res.data?.hotels || [])).catch(() => {})
  }, [])

  const openCreateForm = () => {
    setCreateForm({ hotel_id: '', payout_code: `PO${Date.now()}` })
    setCreateError('')
    setIsCreateOpen(true)
  }

  const handleCreateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!createForm.hotel_id || !createForm.payout_code.trim()) {
      setCreateError('Vui lòng chọn khách sạn và nhập mã payout')
      return
    }

    try {
      setCreating(true)
      setCreateError('')

      await payoutApi.create({
        hotel_id: Number(createForm.hotel_id),
        payout_code: createForm.payout_code.trim()
      })

      setIsCreateOpen(false)
      await fetchPayouts()
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setCreateError(err.response?.data?.message || 'Tạo payout thất bại')
      } else {
        setCreateError('Đã xảy ra lỗi không xác định')
      }
    } finally {
      setCreating(false)
    }
  }

  const handleChangeStatus = async (payout: Payout, status: string) => {
    try {
      setStatusUpdatingId(payout.id)
      setError('')

      await payoutApi.update(payout.id, {
        status,
        payout_date: status === 'PAID' ? new Date().toISOString() : payout.payout_date
      })

      setPayouts((prev) =>
        prev.map((p) => (p.id === payout.id ? { ...p, status } : p))
      )
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Không thể cập nhật trạng thái')
      } else {
        setError('Đã xảy ra lỗi không xác định')
      }
    } finally {
      setStatusUpdatingId(null)
    }
  }

  const handleDelete = async (payout: Payout) => {
    const confirmed = window.confirm(`Xóa payout "${payout.payout_code}"?`)
    if (!confirmed) return

    try {
      setDeletingId(payout.id)
      setError('')
      await payoutApi.delete(payout.id)
      setPayouts((prev) => prev.filter((p) => p.id !== payout.id))
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Không thể xóa payout')
      } else {
        setError('Đã xảy ra lỗi không xác định')
      }
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className='p-8'>
      <div className='mb-6 flex items-center justify-between'>
        <div>
          <p className='mb-1 text-sm font-semibold uppercase tracking-[0.2em] text-blue-600'>Admin</p>
          <h1 className='text-3xl font-bold text-slate-800'>Quản lý chi trả (Payout)</h1>
        </div>

        <button
          type='button'
          onClick={openCreateForm}
          className='px-5 py-2.5 rounded-md bg-[#0280ff] text-white font-semibold hover:bg-[#1612eb] transition'
        >
          + Tạo payout
        </button>
      </div>

      {error && (
        <div className='mb-6 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-red-600'>
          {error}
        </div>
      )}

      <div className='rounded-xl bg-white shadow-sm ring-1 ring-slate-200 overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full text-left text-sm'>
            <thead className='bg-slate-50 text-slate-500'>
              <tr>
                <th className='px-6 py-3 font-medium'>Mã payout</th>
                <th className='px-6 py-3 font-medium'>Khách sạn</th>
                <th className='px-6 py-3 font-medium'>Tổng booking</th>
                <th className='px-6 py-3 font-medium'>Hoa hồng</th>
                <th className='px-6 py-3 font-medium'>Số tiền chi trả</th>
                <th className='px-6 py-3 font-medium'>Trạng thái</th>
                <th className='px-6 py-3 font-medium'>Ngày tạo</th>
                <th className='px-6 py-3 font-medium'>Thao tác</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-100'>
              {loading && (
                <tr><td colSpan={8} className='px-6 py-6 text-center text-slate-400'>Đang tải dữ liệu...</td></tr>
              )}
              {!loading && payouts.length === 0 && !error && (
                <tr><td colSpan={8} className='px-6 py-6 text-center text-slate-400'>Chưa có payout nào</td></tr>
              )}
              {!loading && payouts.map((p) => (
                <tr key={p.id} className='hover:bg-slate-50'>
                  <td className='px-6 py-3 font-medium text-slate-800'>{p.payout_code}</td>
                  <td className='px-6 py-3 text-slate-600'>{p.hotel_name}</td>
                  <td className='px-6 py-3 text-slate-600'>{formatMoney(p.total_booking_amount)}</td>
                  <td className='px-6 py-3 text-slate-600'>{formatMoney(p.total_commission)}</td>
                  <td className='px-6 py-3 font-medium text-slate-800'>{formatMoney(p.payout_amount)}</td>
                  <td className='px-6 py-3'>
                    <select
                      value={p.status}
                      disabled={statusUpdatingId === p.id}
                      onChange={(e) => handleChangeStatus(p, e.target.value)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium border-none outline-none cursor-pointer ${
                        statusLabel[p.status]?.className || 'bg-slate-100 text-slate-500'
                      } disabled:opacity-50`}
                    >
                      {statusOptions.map((s) => (
                        <option key={s} value={s}>{statusLabel[s]?.text || s}</option>
                      ))}
                    </select>
                  </td>
                  <td className='px-6 py-3 text-slate-500'>{new Date(p.created_at).toLocaleDateString('vi-VN')}</td>
                  <td className='px-6 py-3'>
                    <button
                      type='button'
                      disabled={deletingId === p.id}
                      onClick={() => handleDelete(p)}
                      className='text-red-500 hover:underline text-[13px] disabled:opacity-50'
                    >
                      {deletingId === p.id ? 'Đang xóa...' : 'Xóa'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isCreateOpen && (
        <div className='fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-xl w-full max-w-[460px]'>
            <div className='flex items-center justify-between px-6 py-4 border-b border-slate-200'>
              <h2 className='text-lg font-semibold text-slate-800'>Tạo payout mới</h2>
              <button type='button' onClick={() => setIsCreateOpen(false)} className='text-slate-400 hover:text-slate-700'>
                <MdClose size={22} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className='px-6 py-5'>
              {createError && (
                <div className='mb-4 rounded-md bg-red-50 border border-red-200 px-4 py-2.5 text-red-600 text-sm'>
                  {createError}
                </div>
              )}

              <div className='mb-4'>
                <label className='block text-sm font-medium text-slate-600 mb-1.5'>
                  Khách sạn <span className='text-red-500'>*</span>
                </label>
                <select
                  value={createForm.hotel_id}
                  onChange={(e) => setCreateForm({ ...createForm, hotel_id: e.target.value })}
                  className='w-full h-11 rounded-md border border-slate-300 px-3.5 text-sm outline-none focus:border-[#173f67]'
                >
                  <option value=''>-- Chọn khách sạn --</option>
                  {hotels.map((h) => (
                    <option key={h.hotelId} value={h.hotelId}>{h.hotelName}</option>
                  ))}
                </select>
                <p className='mt-1.5 text-xs text-slate-400'>Chỉ tạo được nếu khách sạn có booking đã thanh toán thành công.</p>
              </div>

              <div className='mb-6'>
                <label className='block text-sm font-medium text-slate-600 mb-1.5'>
                  Mã payout <span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  value={createForm.payout_code}
                  onChange={(e) => setCreateForm({ ...createForm, payout_code: e.target.value })}
                  className='w-full h-11 rounded-md border border-slate-300 px-3.5 text-sm outline-none focus:border-[#173f67]'
                />
              </div>

              <div className='flex justify-end gap-3'>
                <button
                  type='button'
                  onClick={() => setIsCreateOpen(false)}
                  className='px-5 py-2.5 rounded-md border border-slate-300 text-slate-600 font-medium hover:bg-slate-50'
                >
                  Hủy
                </button>
                <button
                  type='submit'
                  disabled={creating}
                  className='px-5 py-2.5 rounded-md bg-[#0280ff] text-white font-semibold hover:bg-[#1612eb] disabled:opacity-60'
                >
                  {creating ? 'Đang tạo...' : 'Tạo payout'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminPayouts