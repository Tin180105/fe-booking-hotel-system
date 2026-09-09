import { useEffect, useState } from 'react'
import axios from 'axios'
import { MdClose } from 'react-icons/md'

import hotelApi from '../../apis/hotel.api'
import type { HotelOverview } from '../../types/hotel.type'

const statusOptions = ['PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'ACTIVE', 'INACTIVE']

const statusLabel: Record<string, { text: string; className: string }> = {
  ACTIVE: { text: 'Hoạt động', className: 'bg-emerald-50 text-emerald-600' },
  PENDING_APPROVAL: { text: 'Chờ duyệt', className: 'bg-amber-50 text-amber-600' },
  APPROVED: { text: 'Đã duyệt', className: 'bg-blue-50 text-blue-600' },
  REJECTED: { text: 'Từ chối', className: 'bg-red-50 text-red-600' },
  INACTIVE: { text: 'Ngưng hoạt động', className: 'bg-slate-100 text-slate-500' }
}

interface HotelFormState {
  name: string
  city: string
  address: string
  phone: string
  description: string
  commissionRate: string
  starRating: string
}

const emptyForm: HotelFormState = {
  name: '',
  city: '',
  address: '',
  phone: '',
  description: '',
  commissionRate: '15',
  starRating: '3'
}

const AdminHotels = () => {
  const [hotels, setHotels] = useState<HotelOverview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [statusUpdatingId, setStatusUpdatingId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  // ===== FORM MODAL STATE =====
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<HotelFormState>(emptyForm)
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchHotels = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await hotelApi.getOverview()
      setHotels(response.data?.hotels || [])
    } catch (err: unknown) {
      console.error('[AdminHotels] failed', err)

      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Không thể tải danh sách khách sạn')
      } else {
        setError('Đã xảy ra lỗi không xác định')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHotels()
  }, [])

  // ===== OPEN CREATE =====
  const openCreateForm = () => {
    setFormMode('create')
    setEditingId(null)
    setForm(emptyForm)
    setFormError('')
    setIsFormOpen(true)
  }

  // ===== OPEN EDIT (fetch chi tiết để lấy đủ description) =====
  const openEditForm = async (hotelId: number) => {
    try {
      setFormError('')
      const response = await hotelApi.getById(hotelId)
      const hotel = response.data.hotel

      setFormMode('edit')
      setEditingId(hotel.id)
      setForm({
        name: hotel.name || '',
        city: hotel.city || '',
        address: hotel.address || '',
        phone: hotel.phone || '',
        description: hotel.description || '',
        commissionRate: String(hotel.commissionRate ?? 15),
        starRating: String(hotel.starRating ?? 3)
      })
      setIsFormOpen(true)
    } catch (err: unknown) {
      console.error('[AdminHotels] get by id failed', err)
      setError('Không thể tải thông tin khách sạn để sửa')
    }
  }

  const closeForm = () => {
    setIsFormOpen(false)
    setFormError('')
  }

  // ===== SUBMIT CREATE / EDIT =====
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!form.name.trim() || !form.city.trim() || !form.address.trim()) {
      setFormError('Vui lòng nhập đầy đủ Tên, Thành phố, Địa chỉ')
      return
    }

    const commissionRate = Number(form.commissionRate)
    const starRating = Number(form.starRating)

    if (Number.isNaN(commissionRate) || commissionRate < 0 || commissionRate > 100) {
      setFormError('Hoa hồng phải từ 0 đến 100')
      return
    }

    if (Number.isNaN(starRating) || starRating < 1 || starRating > 5) {
      setFormError('Hạng sao phải từ 1 đến 5')
      return
    }

    const payload = {
      name: form.name.trim(),
      city: form.city.trim(),
      address: form.address.trim(),
      phone: form.phone.trim() || undefined,
      description: form.description.trim() || undefined,
      commissionRate,
      starRating
    }

    try {
      setSubmitting(true)
      setFormError('')

      if (formMode === 'create') {
        await hotelApi.create(payload)
      } else if (editingId) {
        await hotelApi.update(editingId, payload)
      }

      setIsFormOpen(false)
      await fetchHotels()
    } catch (err: unknown) {
      console.error('[AdminHotels] submit failed', err)

      if (axios.isAxiosError(err)) {
        setFormError(err.response?.data?.message || 'Thao tác thất bại')
      } else {
        setFormError('Đã xảy ra lỗi không xác định')
      }
    } finally {
      setSubmitting(false)
    }
  }

  // ===== CHANGE STATUS =====
  const handleChangeStatus = async (hotelId: number, status: string) => {
    try {
      setStatusUpdatingId(hotelId)
      setError('')

      await hotelApi.updateStatus(hotelId, status)

      setHotels((prev) =>
        prev.map((h) => (h.hotelId === hotelId ? { ...h, status } : h))
      )
    } catch (err: unknown) {
      console.error('[AdminHotels] update status failed', err)

      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Không thể cập nhật trạng thái')
      } else {
        setError('Đã xảy ra lỗi không xác định')
      }
    } finally {
      setStatusUpdatingId(null)
    }
  }

  // ===== DELETE =====
  const handleDelete = async (hotelId: number, hotelName: string) => {
    const confirmed = window.confirm(`Xóa khách sạn "${hotelName}"? Hành động này không thể hoàn tác.`)

    if (!confirmed) return

    try {
      setDeletingId(hotelId)
      setError('')

      await hotelApi.delete(hotelId)

      setHotels((prev) => prev.filter((h) => h.hotelId !== hotelId))
    } catch (err: unknown) {
      console.error('[AdminHotels] delete failed', err)

      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Không thể xóa khách sạn (có thể đang có dữ liệu liên quan)')
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
          <h1 className='text-3xl font-bold text-slate-800'>Quản lý khách sạn</h1>
        </div>

        <button
          type='button'
          onClick={openCreateForm}
          className='px-5 py-2.5 rounded-md bg-[#0280ff] text-white font-semibold hover:bg-[#1612eb] transition'
        >
          + Thêm khách sạn
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
                <th className='px-6 py-3 font-medium'>ID</th>
                <th className='px-6 py-3 font-medium'>Khách sạn</th>
                <th className='px-6 py-3 font-medium'>Thành phố</th>
                <th className='px-6 py-3 font-medium'>Địa chỉ</th>
                <th className='px-6 py-3 font-medium'>SĐT</th>
                <th className='px-6 py-3 font-medium'>Hạng sao</th>
                <th className='px-6 py-3 font-medium'>Trạng thái</th>
                <th className='px-6 py-3 font-medium'>Thao tác</th>
              </tr>
            </thead>

            <tbody className='divide-y divide-slate-100'>
              {loading && (
                <tr>
                  <td colSpan={8} className='px-6 py-6 text-center text-slate-400'>
                    Đang tải dữ liệu...
                  </td>
                </tr>
              )}

              {!loading && hotels.length === 0 && !error && (
                <tr>
                  <td colSpan={8} className='px-6 py-6 text-center text-slate-400'>
                    Chưa có khách sạn nào
                  </td>
                </tr>
              )}

              {!loading &&
                hotels.map((hotel) => (
                  <tr key={hotel.hotelId} className='hover:bg-slate-50'>
                    <td className='px-6 py-3 text-slate-500'>#{hotel.hotelId}</td>
                    <td className='px-6 py-3 font-medium text-slate-800'>{hotel.hotelName}</td>
                    <td className='px-6 py-3 text-slate-600'>{hotel.city}</td>
                    <td className='px-6 py-3 text-slate-600 max-w-[220px] truncate'>{hotel.address}</td>
                    <td className='px-6 py-3 text-slate-600'>{hotel.phone || '—'}</td>
                    <td className='px-6 py-3 text-slate-600'>{'⭐'.repeat(hotel.starRating)}</td>
                    <td className='px-6 py-3'>
                      <select
                        value={hotel.status}
                        disabled={statusUpdatingId === hotel.hotelId}
                        onChange={(e) => handleChangeStatus(hotel.hotelId, e.target.value)}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium border-none outline-none cursor-pointer ${
                          statusLabel[hotel.status]?.className || 'bg-slate-100 text-slate-500'
                        } disabled:opacity-50`}
                      >
                        {statusOptions.map((option) => (
                          <option key={option} value={option}>
                            {statusLabel[option]?.text || option}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className='px-6 py-3'>
                      <button
                        type='button'
                        onClick={() => openEditForm(hotel.hotelId)}
                        className='text-blue-600 hover:underline text-[13px] mr-3'
                      >
                        Sửa
                      </button>
                      <button
                        type='button'
                        disabled={deletingId === hotel.hotelId}
                        onClick={() => handleDelete(hotel.hotelId, hotel.hotelName)}
                        className='text-red-500 hover:underline text-[13px] disabled:opacity-50'
                      >
                        {deletingId === hotel.hotelId ? 'Đang xóa...' : 'Xóa'}
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== FORM MODAL (CREATE / EDIT) ===== */}
      {isFormOpen && (
        <div className='fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-xl w-full max-w-[560px] max-h-[90vh] overflow-y-auto'>
            <div className='flex items-center justify-between px-6 py-4 border-b border-slate-200'>
              <h2 className='text-lg font-semibold text-slate-800'>
                {formMode === 'create' ? 'Thêm khách sạn mới' : 'Sửa thông tin khách sạn'}
              </h2>
              <button type='button' onClick={closeForm} className='text-slate-400 hover:text-slate-700'>
                <MdClose size={22} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className='px-6 py-5'>
              {formError && (
                <div className='mb-4 rounded-md bg-red-50 border border-red-200 px-4 py-2.5 text-red-600 text-sm'>
                  {formError}
                </div>
              )}

              <div className='mb-4'>
                <label className='block text-sm font-medium text-slate-600 mb-1.5'>
                  Tên khách sạn <span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className='w-full h-11 rounded-md border border-slate-300 px-3.5 text-sm outline-none focus:border-[#173f67]'
                />
              </div>

              <div className='grid grid-cols-2 gap-4 mb-4'>
                <div>
                  <label className='block text-sm font-medium text-slate-600 mb-1.5'>
                    Thành phố <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='text'
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className='w-full h-11 rounded-md border border-slate-300 px-3.5 text-sm outline-none focus:border-[#173f67]'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-slate-600 mb-1.5'>Số điện thoại</label>
                  <input
                    type='text'
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className='w-full h-11 rounded-md border border-slate-300 px-3.5 text-sm outline-none focus:border-[#173f67]'
                  />
                </div>
              </div>

              <div className='mb-4'>
                <label className='block text-sm font-medium text-slate-600 mb-1.5'>
                  Địa chỉ <span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className='w-full h-11 rounded-md border border-slate-300 px-3.5 text-sm outline-none focus:border-[#173f67]'
                />
              </div>

              <div className='grid grid-cols-2 gap-4 mb-4'>
                <div>
                  <label className='block text-sm font-medium text-slate-600 mb-1.5'>Hạng sao (1-5)</label>
                  <input
                    type='number'
                    min={1}
                    max={5}
                    value={form.starRating}
                    onChange={(e) => setForm({ ...form, starRating: e.target.value })}
                    className='w-full h-11 rounded-md border border-slate-300 px-3.5 text-sm outline-none focus:border-[#173f67]'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-slate-600 mb-1.5'>Hoa hồng (%)</label>
                  <input
                    type='number'
                    min={0}
                    max={100}
                    step='0.01'
                    value={form.commissionRate}
                    onChange={(e) => setForm({ ...form, commissionRate: e.target.value })}
                    className='w-full h-11 rounded-md border border-slate-300 px-3.5 text-sm outline-none focus:border-[#173f67]'
                  />
                </div>
              </div>

              <div className='mb-6'>
                <label className='block text-sm font-medium text-slate-600 mb-1.5'>Mô tả</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className='w-full rounded-md border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-[#173f67] resize-none'
                />
              </div>

              <div className='flex justify-end gap-3'>
                <button
                  type='button'
                  onClick={closeForm}
                  className='px-5 py-2.5 rounded-md border border-slate-300 text-slate-600 font-medium hover:bg-slate-50'
                >
                  Hủy
                </button>
                <button
                  type='submit'
                  disabled={submitting}
                  className='px-5 py-2.5 rounded-md bg-[#0280ff] text-white font-semibold hover:bg-[#1612eb] disabled:opacity-60'
                >
                  {submitting ? 'Đang lưu...' : formMode === 'create' ? 'Tạo khách sạn' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminHotels