import { useEffect, useState } from 'react'
import axios from 'axios'
import { MdClose } from 'react-icons/md'

import roomApi, { type RoomType } from '../../apis/room.api'
import { useAuth } from '../../contexts/app.context'

interface RoomTypeFormState {
  name: string
  capacity: string
  totalRooms: string
  basePrice: string
  description: string
}

const emptyForm: RoomTypeFormState = {
  name: '',
  capacity: '2',
  totalRooms: '1',
  basePrice: '0',
  description: ''
}

const HotelRoomTypes = () => {
  const { profile } = useAuth()
  const hotelId = profile?.hotel_id

  const [roomTypes, setRoomTypes] = useState<RoomType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<RoomTypeFormState>(emptyForm)
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchRoomTypes = async () => {
    if (!hotelId) return
    try {
      setLoading(true)
      setError('')
      const res = await roomApi.getByHotelId(hotelId)
      setRoomTypes(res.data?.data || [])
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Không thể tải danh sách phòng')
      } else {
        setError('Đã xảy ra lỗi không xác định')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRoomTypes()
  }, [hotelId])

  const openCreateForm = () => {
    setFormMode('create')
    setEditingId(null)
    setForm(emptyForm)
    setFormError('')
    setIsFormOpen(true)
  }

  const openEditForm = (room: RoomType) => {
    setFormMode('edit')
    setEditingId(room.id)
    setForm({
      name: room.name,
      capacity: String(room.capacity),
      totalRooms: String(room.total_rooms),
      basePrice: String(room.base_price),
      description: room.description || ''
    })
    setFormError('')
    setIsFormOpen(true)
  }

  const closeForm = () => {
    setIsFormOpen(false)
    setFormError('')
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!hotelId) return

    if (!form.name.trim()) {
      setFormError('Vui lòng nhập tên loại phòng')
      return
    }

    const capacity = Number(form.capacity)
    const totalRooms = Number(form.totalRooms)
    const basePrice = Number(form.basePrice)

    if (!Number.isInteger(capacity) || capacity <= 0) {
      setFormError('Sức chứa phải lớn hơn 0')
      return
    }
    if (!Number.isInteger(totalRooms) || totalRooms <= 0) {
      setFormError('Số lượng phòng phải lớn hơn 0')
      return
    }
    if (Number.isNaN(basePrice) || basePrice < 0) {
      setFormError('Giá phòng không hợp lệ')
      return
    }

    const payload = {
      hotel_id: hotelId,
      name: form.name.trim(),
      capacity,
      total_rooms: totalRooms,
      base_price: basePrice,
      description: form.description.trim() || undefined
    }

    try {
      setSubmitting(true)
      setFormError('')

      if (formMode === 'create') {
        await roomApi.create(payload)
      } else if (editingId) {
        await roomApi.update(editingId, payload)
      }

      setIsFormOpen(false)
      await fetchRoomTypes()
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setFormError(err.response?.data?.message || 'Thao tác thất bại')
      } else {
        setFormError('Đã xảy ra lỗi không xác định')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (room: RoomType) => {
    const confirmed = window.confirm(`Xóa loại phòng "${room.name}"?`)
    if (!confirmed) return

    try {
      setDeletingId(room.id)
      setError('')
      await roomApi.delete(room.id)
      setRoomTypes((prev) => prev.filter((r) => r.id !== room.id))
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Không thể xóa loại phòng')
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
          <p className='mb-1 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600'>Hotel</p>
          <h1 className='text-3xl font-bold text-slate-800'>Quản lý loại phòng</h1>
        </div>
        <button
          type='button'
          onClick={openCreateForm}
          className='px-5 py-2.5 rounded-md bg-[#0280ff] text-white font-semibold hover:bg-[#1612eb] transition'
        >
          + Thêm loại phòng
        </button>
      </div>

      {error && (
        <div className='mb-6 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-red-600'>{error}</div>
      )}

      <div className='rounded-xl bg-white shadow-sm ring-1 ring-slate-200 overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full text-left text-sm'>
            <thead className='bg-slate-50 text-slate-500'>
              <tr>
                <th className='px-6 py-3 font-medium'>Tên loại phòng</th>
                <th className='px-6 py-3 font-medium'>Sức chứa</th>
                <th className='px-6 py-3 font-medium'>Số lượng</th>
                <th className='px-6 py-3 font-medium'>Giá / đêm</th>
                <th className='px-6 py-3 font-medium'>Thao tác</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-100'>
              {loading && (
                <tr><td colSpan={5} className='px-6 py-6 text-center text-slate-400'>Đang tải dữ liệu...</td></tr>
              )}
              {!loading && roomTypes.length === 0 && !error && (
                <tr><td colSpan={5} className='px-6 py-6 text-center text-slate-400'>Chưa có loại phòng nào</td></tr>
              )}
              {!loading && roomTypes.map((room) => (
                <tr key={room.id} className='hover:bg-slate-50'>
                  <td className='px-6 py-3 font-medium text-slate-800'>{room.name}</td>
                  <td className='px-6 py-3 text-slate-600'>{room.capacity} khách</td>
                  <td className='px-6 py-3 text-slate-600'>{room.total_rooms}</td>
                  <td className='px-6 py-3 text-slate-600'>
                    {new Intl.NumberFormat('vi-VN').format(room.base_price)} đ
                  </td>
                  <td className='px-6 py-3'>
                    <button type='button' onClick={() => openEditForm(room)} className='text-blue-600 hover:underline text-[13px] mr-3'>
                      Sửa
                    </button>
                    <button
                      type='button'
                      disabled={deletingId === room.id}
                      onClick={() => handleDelete(room)}
                      className='text-red-500 hover:underline text-[13px] disabled:opacity-50'
                    >
                      {deletingId === room.id ? 'Đang xóa...' : 'Xóa'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isFormOpen && (
        <div className='fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-xl w-full max-w-[520px] max-h-[90vh] overflow-y-auto'>
            <div className='flex items-center justify-between px-6 py-4 border-b border-slate-200'>
              <h2 className='text-lg font-semibold text-slate-800'>
                {formMode === 'create' ? 'Thêm loại phòng mới' : 'Sửa loại phòng'}
              </h2>
              <button type='button' onClick={closeForm} className='text-slate-400 hover:text-slate-700'>
                <MdClose size={22} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className='px-6 py-5'>
              {formError && (
                <div className='mb-4 rounded-md bg-red-50 border border-red-200 px-4 py-2.5 text-red-600 text-sm'>{formError}</div>
              )}

              <div className='mb-4'>
                <label className='block text-sm font-medium text-slate-600 mb-1.5'>
                  Tên loại phòng <span className='text-red-500'>*</span>
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
                  <label className='block text-sm font-medium text-slate-600 mb-1.5'>Sức chứa</label>
                  <input
                    type='number'
                    min={1}
                    value={form.capacity}
                    onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                    className='w-full h-11 rounded-md border border-slate-300 px-3.5 text-sm outline-none focus:border-[#173f67]'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-slate-600 mb-1.5'>Số lượng phòng</label>
                  <input
                    type='number'
                    min={1}
                    value={form.totalRooms}
                    onChange={(e) => setForm({ ...form, totalRooms: e.target.value })}
                    className='w-full h-11 rounded-md border border-slate-300 px-3.5 text-sm outline-none focus:border-[#173f67]'
                  />
                </div>
              </div>

              <div className='mb-4'>
                <label className='block text-sm font-medium text-slate-600 mb-1.5'>Giá / đêm</label>
                <input
                  type='number'
                  min={0}
                  step='1000'
                  value={form.basePrice}
                  onChange={(e) => setForm({ ...form, basePrice: e.target.value })}
                  className='w-full h-11 rounded-md border border-slate-300 px-3.5 text-sm outline-none focus:border-[#173f67]'
                />
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
                <button type='button' onClick={closeForm} className='px-5 py-2.5 rounded-md border border-slate-300 text-slate-600 font-medium hover:bg-slate-50'>
                  Hủy
                </button>
                <button
                  type='submit'
                  disabled={submitting}
                  className='px-5 py-2.5 rounded-md bg-[#0280ff] text-white font-semibold hover:bg-[#1612eb] disabled:opacity-60'
                >
                  {submitting ? 'Đang lưu...' : formMode === 'create' ? 'Tạo loại phòng' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default HotelRoomTypes