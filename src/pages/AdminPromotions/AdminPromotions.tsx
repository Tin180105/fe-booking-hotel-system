import { useEffect, useState } from 'react'
import axios from 'axios'
import { MdClose } from 'react-icons/md'

import promotionApi, {
  type Promotion,
  type DiscountType
} from '../../apis/promotion.api'

interface PromotionFormState {
  code: string
  discount_type: DiscountType
  discount_value: string
  max_discount: string
  start_date: string
  end_date: string
  is_active: boolean
}

const emptyForm: PromotionFormState = {
  code: '',
  discount_type: 'PERCENTAGE',
  discount_value: '',
  max_discount: '',
  start_date: '',
  end_date: '',
  is_active: true
}

// yyyy-MM-ddTHH:mm:ss -> yyyy-MM-dd (cho input type="date")
const toDateInputValue = (value: string) => {
  if (!value) return ''
  return value.slice(0, 10)
}

const formatPrice = (value: number) => new Intl.NumberFormat('vi-VN').format(value)

const AdminPromotions = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState<number | null>(null)

  // ===== FORM MODAL STATE =====
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<PromotionFormState>(emptyForm)
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchPromotions = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await promotionApi.getAll()
      setPromotions(response.data?.data || [])
    } catch (err: unknown) {
      console.error('[AdminPromotions] failed', err)

      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Không thể tải danh sách mã giảm giá')
      } else {
        setError('Đã xảy ra lỗi không xác định')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPromotions()
  }, [])

  // ===== OPEN CREATE =====
  const openCreateForm = () => {
    setFormMode('create')
    setEditingId(null)
    setForm(emptyForm)
    setFormError('')
    setIsFormOpen(true)
  }

  // ===== OPEN EDIT =====
  const openEditForm = (promotion: Promotion) => {
    setFormMode('edit')
    setEditingId(promotion.id)
    setForm({
      code: promotion.code,
      discount_type: promotion.discount_type,
      discount_value: String(promotion.discount_value ?? ''),
      max_discount: promotion.max_discount !== null ? String(promotion.max_discount) : '',
      start_date: toDateInputValue(promotion.start_date),
      end_date: toDateInputValue(promotion.end_date),
      is_active: promotion.is_active
    })
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

    if (!form.code.trim() || !form.discount_value || !form.start_date || !form.end_date) {
      setFormError('Vui lòng nhập đầy đủ Mã, Giá trị giảm, Ngày bắt đầu và Ngày kết thúc')
      return
    }

    const discountValue = Number(form.discount_value)
    const maxDiscount = form.max_discount.trim() ? Number(form.max_discount) : null

    if (Number.isNaN(discountValue) || discountValue < 0) {
      setFormError('Giá trị giảm không hợp lệ')
      return
    }

    if (form.discount_type === 'PERCENTAGE' && discountValue > 100) {
      setFormError('Giảm theo % không được vượt quá 100')
      return
    }

    if (maxDiscount !== null && (Number.isNaN(maxDiscount) || maxDiscount < 0)) {
      setFormError('Giảm tối đa không hợp lệ')
      return
    }

    if (new Date(form.end_date) <= new Date(form.start_date)) {
      setFormError('Ngày kết thúc phải sau ngày bắt đầu')
      return
    }

    const payload = {
      code: form.code.trim().toUpperCase(),
      discount_type: form.discount_type,
      discount_value: discountValue,
      max_discount: maxDiscount,
      start_date: form.start_date,
      end_date: form.end_date,
      is_active: form.is_active
    }

    try {
      setSubmitting(true)
      setFormError('')

      if (formMode === 'create') {
        await promotionApi.create(payload)
      } else if (editingId) {
        await promotionApi.update(editingId, payload)
      }

      setIsFormOpen(false)
      await fetchPromotions()
    } catch (err: unknown) {
      console.error('[AdminPromotions] submit failed', err)

      if (axios.isAxiosError(err)) {
        setFormError(err.response?.data?.message || 'Thao tác thất bại')
      } else {
        setFormError('Đã xảy ra lỗi không xác định')
      }
    } finally {
      setSubmitting(false)
    }
  }

  // ===== TOGGLE ACTIVE (bật/tắt nhanh) =====
  const handleToggleActive = async (promotion: Promotion) => {
    try {
      setError('')

      await promotionApi.update(promotion.id, {
        code: promotion.code,
        discount_type: promotion.discount_type,
        discount_value: promotion.discount_value,
        max_discount: promotion.max_discount,
        start_date: promotion.start_date,
        end_date: promotion.end_date,
        is_active: !promotion.is_active
      })

      setPromotions((prev) =>
        prev.map((p) => (p.id === promotion.id ? { ...p, is_active: !p.is_active } : p))
      )
    } catch (err: unknown) {
      console.error('[AdminPromotions] toggle active failed', err)

      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Không thể cập nhật trạng thái')
      } else {
        setError('Đã xảy ra lỗi không xác định')
      }
    }
  }

  // ===== DELETE =====
  const handleDelete = async (promotion: Promotion) => {
    const confirmed = window.confirm(`Xóa mã giảm giá "${promotion.code}"? Hành động này không thể hoàn tác.`)

    if (!confirmed) return

    try {
      setDeletingId(promotion.id)
      setError('')

      await promotionApi.delete(promotion.id)

      setPromotions((prev) => prev.filter((p) => p.id !== promotion.id))
    } catch (err: unknown) {
      console.error('[AdminPromotions] delete failed', err)

      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Không thể xóa mã giảm giá (có thể đang được sử dụng)')
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
          <h1 className='text-3xl font-bold text-slate-800'>Quản lý mã giảm giá</h1>
        </div>

        <button
          type='button'
          onClick={openCreateForm}
          className='px-5 py-2.5 rounded-md bg-[#0280ff] text-white font-semibold hover:bg-[#1612eb] transition'
        >
          + Thêm mã giảm giá
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
                <th className='px-6 py-3 font-medium'>Mã</th>
                <th className='px-6 py-3 font-medium'>Loại giảm</th>
                <th className='px-6 py-3 font-medium'>Giá trị</th>
                <th className='px-6 py-3 font-medium'>Giảm tối đa</th>
                <th className='px-6 py-3 font-medium'>Bắt đầu</th>
                <th className='px-6 py-3 font-medium'>Kết thúc</th>
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

              {!loading && promotions.length === 0 && !error && (
                <tr>
                  <td colSpan={8} className='px-6 py-6 text-center text-slate-400'>
                    Chưa có mã giảm giá nào
                  </td>
                </tr>
              )}

              {!loading &&
                promotions.map((promotion) => (
                  <tr key={promotion.id} className='hover:bg-slate-50'>
                    <td className='px-6 py-3 font-semibold text-slate-800'>{promotion.code}</td>
                    <td className='px-6 py-3 text-slate-600'>
                      {promotion.discount_type === 'PERCENTAGE' ? 'Phần trăm' : 'Số tiền cố định'}
                    </td>
                    <td className='px-6 py-3 text-slate-600'>
                      {promotion.discount_type === 'PERCENTAGE'
                        ? `${promotion.discount_value}%`
                        : `${formatPrice(promotion.discount_value)}đ`}
                    </td>
                    <td className='px-6 py-3 text-slate-600'>
                      {promotion.max_discount !== null ? `${formatPrice(promotion.max_discount)}đ` : '—'}
                    </td>
                    <td className='px-6 py-3 text-slate-500'>
                      {new Date(promotion.start_date).toLocaleDateString('vi-VN')}
                    </td>
                    <td className='px-6 py-3 text-slate-500'>
                      {new Date(promotion.end_date).toLocaleDateString('vi-VN')}
                    </td>
                    <td className='px-6 py-3'>
                      <button
                        type='button'
                        onClick={() => handleToggleActive(promotion)}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium transition ${
                          promotion.is_active
                            ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        {promotion.is_active ? 'Đang bật' : 'Đang tắt'}
                      </button>
                    </td>
                    <td className='px-6 py-3'>
                      <button
                        type='button'
                        onClick={() => openEditForm(promotion)}
                        className='text-blue-600 hover:underline text-[13px] mr-3'
                      >
                        Sửa
                      </button>
                      <button
                        type='button'
                        disabled={deletingId === promotion.id}
                        onClick={() => handleDelete(promotion)}
                        className='text-red-500 hover:underline text-[13px] disabled:opacity-50'
                      >
                        {deletingId === promotion.id ? 'Đang xóa...' : 'Xóa'}
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
                {formMode === 'create' ? 'Thêm mã giảm giá mới' : 'Sửa mã giảm giá'}
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
                  Mã giảm giá <span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  placeholder='VD: SUMMER2026'
                  className='w-full h-11 rounded-md border border-slate-300 px-3.5 text-sm outline-none focus:border-[#173f67] uppercase'
                />
              </div>

              <div className='grid grid-cols-2 gap-4 mb-4'>
                <div>
                  <label className='block text-sm font-medium text-slate-600 mb-1.5'>Loại giảm giá</label>
                  <select
                    value={form.discount_type}
                    onChange={(e) =>
                      setForm({ ...form, discount_type: e.target.value as DiscountType })
                    }
                    className='w-full h-11 rounded-md border border-slate-300 px-3.5 text-sm outline-none focus:border-[#173f67]'
                  >
                    <option value='PERCENTAGE'>Phần trăm (%)</option>
                    <option value='FIXED'>Số tiền cố định</option>
                  </select>
                </div>

                <div>
                  <label className='block text-sm font-medium text-slate-600 mb-1.5'>
                    Giá trị giảm <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='number'
                    min={0}
                    max={form.discount_type === 'PERCENTAGE' ? 100 : undefined}
                    step='0.01'
                    value={form.discount_value}
                    onChange={(e) => setForm({ ...form, discount_value: e.target.value })}
                    className='w-full h-11 rounded-md border border-slate-300 px-3.5 text-sm outline-none focus:border-[#173f67]'
                  />
                </div>
              </div>

              <div className='mb-4'>
                <label className='block text-sm font-medium text-slate-600 mb-1.5'>
                  Giảm tối đa (để trống nếu không giới hạn)
                </label>
                <input
                  type='number'
                  min={0}
                  step='0.01'
                  value={form.max_discount}
                  onChange={(e) => setForm({ ...form, max_discount: e.target.value })}
                  className='w-full h-11 rounded-md border border-slate-300 px-3.5 text-sm outline-none focus:border-[#173f67]'
                />
              </div>

              <div className='grid grid-cols-2 gap-4 mb-4'>
                <div>
                  <label className='block text-sm font-medium text-slate-600 mb-1.5'>
                    Ngày bắt đầu <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='date'
                    value={form.start_date}
                    onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                    className='w-full h-11 rounded-md border border-slate-300 px-3.5 text-sm outline-none focus:border-[#173f67]'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-slate-600 mb-1.5'>
                    Ngày kết thúc <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='date'
                    value={form.end_date}
                    onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                    className='w-full h-11 rounded-md border border-slate-300 px-3.5 text-sm outline-none focus:border-[#173f67]'
                  />
                </div>
              </div>

              <div className='mb-6'>
                <label className='flex items-center gap-2 cursor-pointer'>
                  <input
                    type='checkbox'
                    checked={form.is_active}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                    className='w-4 h-4 accent-[#173f67]'
                  />
                  <span className='text-sm font-medium text-slate-600'>Kích hoạt mã ngay</span>
                </label>
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
                  {submitting ? 'Đang lưu...' : formMode === 'create' ? 'Tạo mã' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminPromotions