import { useEffect, useState } from 'react'
import axios from 'axios'
import { MdCheck, MdClose, MdEdit, MdDelete, MdAdd } from 'react-icons/md'

import amenityApi, { type Amenity } from '../../apis/amenity.api'
import hotelAmenityApi from '../../apis/hotelAmenity.api'
import { useAuth } from '../../contexts/app.context'

interface AmenityFormState {
  name: string
  icon_code: string
}

const emptyForm: AmenityFormState = { name: '', icon_code: '' }

const HotelAmenities = () => {
  const { profile } = useAuth()
  const hotelId = profile?.hotel_id

  const [allAmenities, setAllAmenities] = useState<Amenity[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [togglingId, setTogglingId] = useState<number | null>(null)

  // ===== FORM MODAL STATE (create/edit tiện ích dùng chung) =====
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<AmenityFormState>(emptyForm)
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const fetchData = async () => {
    if (!hotelId) return
    try {
      setLoading(true)
      setError('')
      const [allRes, hotelRes] = await Promise.all([
        amenityApi.getAll(),
        hotelAmenityApi.getByHotelId(hotelId)
      ])
      setAllAmenities(allRes.data?.data || [])
      setSelectedIds(new Set((hotelRes.data?.data || []).map((item) => item.amenity_id)))
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Không thể tải tiện nghi')
      } else {
        setError('Đã xảy ra lỗi không xác định')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [hotelId])

  const toggleAmenity = async (amenityId: number) => {
    if (!hotelId) return
    const isSelected = selectedIds.has(amenityId)

    try {
      setTogglingId(amenityId)
      setError('')

      if (isSelected) {
        await hotelAmenityApi.remove(hotelId, amenityId)
        setSelectedIds((prev) => {
          const next = new Set(prev)
          next.delete(amenityId)
          return next
        })
      } else {
        await hotelAmenityApi.add(hotelId, amenityId)
        setSelectedIds((prev) => new Set(prev).add(amenityId))
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Thao tác thất bại')
      } else {
        setError('Đã xảy ra lỗi không xác định')
      }
    } finally {
      setTogglingId(null)
    }
  }

  // ===== OPEN CREATE =====
  const openCreateForm = () => {
    setFormMode('create')
    setEditingId(null)
    setForm(emptyForm)
    setFormError('')
    setIsFormOpen(true)
  }

  // ===== OPEN EDIT =====
  const openEditForm = (amenity: Amenity) => {
    setFormMode('edit')
    setEditingId(amenity.id)
    setForm({ name: amenity.name, icon_code: amenity.icon_code || '' })
    setFormError('')
    setIsFormOpen(true)
  }

  const closeForm = () => {
    setIsFormOpen(false)
    setFormError('')
  }

  // ===== SUBMIT CREATE / EDIT =====
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!form.name.trim()) {
      setFormError('Vui lòng nhập tên tiện ích')
      return
    }

    const payload = {
      name: form.name.trim(),
      icon_code: form.icon_code.trim() || undefined
    }

    try {
      setSubmitting(true)
      setFormError('')

      if (formMode === 'create') {
        await amenityApi.create(payload)
      } else if (editingId) {
        await amenityApi.update(editingId, payload)
      }

      setIsFormOpen(false)
      await fetchData()
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

  // ===== DELETE =====
  const handleDelete = async (amenity: Amenity) => {
    const confirmed = window.confirm(
      `Xóa tiện ích "${amenity.name}"? Tiện ích này sẽ bị gỡ khỏi tất cả khách sạn đang dùng.`
    )

    if (!confirmed) return

    try {
      setDeletingId(amenity.id)
      setError('')

      await amenityApi.delete(amenity.id)

      setAllAmenities((prev) => prev.filter((a) => a.id !== amenity.id))
      setSelectedIds((prev) => {
        const next = new Set(prev)
        next.delete(amenity.id)
        return next
      })
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Không thể xóa tiện ích (có thể đang được khách sạn khác sử dụng)')
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
          <h1 className='text-3xl font-bold text-slate-800'>Tiện nghi khách sạn</h1>
          <p className='mt-2 text-slate-600'>
            Danh sách tiện ích dùng chung cho tất cả khách sạn. Bấm vào thẻ để bật/tắt cho khách sạn của bạn.
          </p>
        </div>

        <button
          type='button'
          onClick={openCreateForm}
          className='flex items-center gap-2 px-5 py-2.5 rounded-md bg-[#0280ff] text-white font-semibold hover:bg-[#1612eb] transition'
        >
          <MdAdd size={20} />
          Thêm tiện ích
        </button>
      </div>

      {error && (
        <div className='mb-6 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-red-600'>{error}</div>
      )}

      {loading ? (
        <p className='text-slate-400'>Đang tải...</p>
      ) : allAmenities.length === 0 ? (
        <p className='text-slate-400'>Chưa có tiện ích nào. Hãy bấm "Thêm tiện ích" để tạo mới.</p>
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
          {allAmenities.map((amenity) => {
            const isSelected = selectedIds.has(amenity.id)
            return (
              <div
                key={amenity.id}
                className={`flex items-center justify-between rounded-xl border px-5 py-4 transition ${
                  isSelected ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <button
                  type='button'
                  disabled={togglingId === amenity.id}
                  onClick={() => toggleAmenity(amenity.id)}
                  className='flex-1 flex items-center gap-2 text-left disabled:opacity-50'
                >
                  <span className='font-medium text-slate-700'>{amenity.name}</span>
                  {isSelected && <MdCheck className='text-emerald-600 shrink-0' />}
                </button>

                <div className='flex items-center gap-2 pl-3 ml-2 border-l border-slate-200'>
                  <button
                    type='button'
                    onClick={() => openEditForm(amenity)}
                    className='text-blue-600 hover:text-blue-800 transition'
                    title='Sửa tiện ích'
                  >
                    <MdEdit size={18} />
                  </button>

                  <button
                    type='button'
                    disabled={deletingId === amenity.id}
                    onClick={() => handleDelete(amenity)}
                    className='text-red-500 hover:text-red-700 transition disabled:opacity-50'
                    title='Xóa tiện ích'
                  >
                    <MdDelete size={18} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ===== FORM MODAL (CREATE / EDIT) ===== */}
      {isFormOpen && (
        <div className='fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-xl w-full max-w-[460px]'>
            <div className='flex items-center justify-between px-6 py-4 border-b border-slate-200'>
              <h2 className='text-lg font-semibold text-slate-800'>
                {formMode === 'create' ? 'Thêm tiện ích mới' : 'Sửa tiện ích'}
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
                  Tên tiện ích <span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder='VD: Hồ bơi, Wifi miễn phí...'
                  className='w-full h-11 rounded-md border border-slate-300 px-3.5 text-sm outline-none focus:border-[#173f67]'
                />
              </div>

              <div className='mb-6'>
                <label className='block text-sm font-medium text-slate-600 mb-1.5'>
                  Icon code (tùy chọn)
                </label>
                <input
                  type='text'
                  value={form.icon_code}
                  onChange={(e) => setForm({ ...form, icon_code: e.target.value })}
                  placeholder='VD: wifi, pool...'
                  className='w-full h-11 rounded-md border border-slate-300 px-3.5 text-sm outline-none focus:border-[#173f67]'
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
                  {submitting ? 'Đang lưu...' : formMode === 'create' ? 'Tạo tiện ích' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default HotelAmenities