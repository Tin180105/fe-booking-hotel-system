import { useEffect, useState } from 'react'
import axios from 'axios'
import { MdClose, MdVisibility } from 'react-icons/md'

import customerApi, { type Customer, type CustomerBooking } from '../../apis/customer.api'

const AdminCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [form, setForm] = useState({ full_name: '', email: '', phone: '' })
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [bookingCustomer, setBookingCustomer] = useState<Customer | null>(null)
  const [bookings, setBookings] = useState<CustomerBooking[]>([])
  const [bookingLoading, setBookingLoading] = useState(false)

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      setError('')
      const res = await customerApi.getAll()
      setCustomers(res.data?.data || [])
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Không thể tải danh sách khách hàng')
      } else {
        setError('Đã xảy ra lỗi không xác định')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [])

  const openEdit = (c: Customer) => {
    setEditingCustomer(c)
    setForm({ full_name: c.full_name, email: c.email, phone: c.phone })
    setFormError('')
    setIsEditOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingCustomer) return

    if (!form.full_name.trim() || !form.email.trim()) {
      setFormError('Vui lòng nhập đầy đủ Họ tên và Email')
      return
    }

    try {
      setSubmitting(true)
      setFormError('')

      await customerApi.update(editingCustomer.id, {
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim()
      })

      setIsEditOpen(false)
      await fetchCustomers()
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setFormError(err.response?.data?.message || 'Cập nhật thất bại')
      } else {
        setFormError('Đã xảy ra lỗi không xác định')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (c: Customer) => {
    const confirmed = window.confirm(`Xóa khách hàng "${c.full_name}" (${c.email})?`)
    if (!confirmed) return

    try {
      setDeletingId(c.id)
      await customerApi.delete(c.id)
      setCustomers((prev) => prev.filter((x) => x.id !== c.id))
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Không thể xóa (có thể đang có booking liên quan)')
      } else {
        setError('Đã xảy ra lỗi không xác định')
      }
    } finally {
      setDeletingId(null)
    }
  }

  const openBookings = async (c: Customer) => {
    setBookingCustomer(c)
    setIsBookingOpen(true)
    setBookingLoading(true)
    try {
      const res = await customerApi.getBookings(c.id)
      setBookings(res.data?.data || [])
    } catch {
      setBookings([])
    } finally {
      setBookingLoading(false)
    }
  }

  return (
    <div className='p-8'>
      <div className='mb-6'>
        <p className='mb-1 text-sm font-semibold uppercase tracking-[0.2em] text-blue-600'>Admin</p>
        <h1 className='text-3xl font-bold text-slate-800'>Quản lý khách hàng</h1>
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
                <th className='px-6 py-3 font-medium'>Họ tên</th>
                <th className='px-6 py-3 font-medium'>Email</th>
                <th className='px-6 py-3 font-medium'>SĐT</th>
                <th className='px-6 py-3 font-medium'>Ngày tạo</th>
                <th className='px-6 py-3 font-medium'>Thao tác</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-100'>
              {loading && (
                <tr><td colSpan={6} className='px-6 py-6 text-center text-slate-400'>Đang tải dữ liệu...</td></tr>
              )}
              {!loading && customers.length === 0 && !error && (
                <tr><td colSpan={6} className='px-6 py-6 text-center text-slate-400'>Chưa có khách hàng nào</td></tr>
              )}
              {!loading && customers.map((c) => (
                <tr key={c.id} className='hover:bg-slate-50'>
                  <td className='px-6 py-3 text-slate-500'>#{c.id}</td>
                  <td className='px-6 py-3 font-medium text-slate-800'>{c.full_name}</td>
                  <td className='px-6 py-3 text-slate-600'>{c.email}</td>
                  <td className='px-6 py-3 text-slate-600'>{c.phone || '—'}</td>
                  <td className='px-6 py-3 text-slate-500'>{new Date(c.created_at).toLocaleDateString('vi-VN')}</td>
                  <td className='px-6 py-3 flex items-center gap-3'>
                    <button type='button' onClick={() => openBookings(c)} className='text-emerald-600 hover:underline text-[13px] flex items-center gap-1'>
                      <MdVisibility size={16} /> Booking
                    </button>
                    <button type='button' onClick={() => openEdit(c)} className='text-blue-600 hover:underline text-[13px]'>Sửa</button>
                    <button
                      type='button'
                      disabled={deletingId === c.id}
                      onClick={() => handleDelete(c)}
                      className='text-red-500 hover:underline text-[13px] disabled:opacity-50'
                    >
                      {deletingId === c.id ? 'Đang xóa...' : 'Xóa'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT MODAL */}
      {isEditOpen && editingCustomer && (
        <div className='fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-xl w-full max-w-[460px]'>
            <div className='flex items-center justify-between px-6 py-4 border-b border-slate-200'>
              <h2 className='text-lg font-semibold text-slate-800'>Sửa thông tin khách hàng</h2>
              <button type='button' onClick={() => setIsEditOpen(false)} className='text-slate-400 hover:text-slate-700'>
                <MdClose size={22} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className='px-6 py-5'>
              {formError && (
                <div className='mb-4 rounded-md bg-red-50 border border-red-200 px-4 py-2.5 text-red-600 text-sm'>{formError}</div>
              )}
              <div className='mb-4'>
                <label className='block text-sm font-medium text-slate-600 mb-1.5'>Họ tên <span className='text-red-500'>*</span></label>
                <input type='text' value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  className='w-full h-11 rounded-md border border-slate-300 px-3.5 text-sm outline-none focus:border-[#173f67]' />
              </div>
              <div className='mb-4'>
                <label className='block text-sm font-medium text-slate-600 mb-1.5'>Email <span className='text-red-500'>*</span></label>
                <input type='email' value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className='w-full h-11 rounded-md border border-slate-300 px-3.5 text-sm outline-none focus:border-[#173f67]' />
              </div>
              <div className='mb-6'>
                <label className='block text-sm font-medium text-slate-600 mb-1.5'>Số điện thoại</label>
                <input type='text' value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className='w-full h-11 rounded-md border border-slate-300 px-3.5 text-sm outline-none focus:border-[#173f67]' />
              </div>
              <div className='flex justify-end gap-3'>
                <button type='button' onClick={() => setIsEditOpen(false)} className='px-5 py-2.5 rounded-md border border-slate-300 text-slate-600 font-medium hover:bg-slate-50'>Hủy</button>
                <button type='submit' disabled={submitting} className='px-5 py-2.5 rounded-md bg-[#0280ff] text-white font-semibold hover:bg-[#1612eb] disabled:opacity-60'>
                  {submitting ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BOOKING MODAL */}
      {isBookingOpen && bookingCustomer && (
        <div className='fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-xl w-full max-w-[520px] max-h-[80vh] overflow-y-auto'>
            <div className='flex items-center justify-between px-6 py-4 border-b border-slate-200'>
              <h2 className='text-lg font-semibold text-slate-800'>Booking của {bookingCustomer.full_name}</h2>
              <button type='button' onClick={() => setIsBookingOpen(false)} className='text-slate-400 hover:text-slate-700'>
                <MdClose size={22} />
              </button>
            </div>
            <div className='px-6 py-5'>
              {bookingLoading && <p className='text-slate-400 text-sm'>Đang tải...</p>}
              {!bookingLoading && bookings.length === 0 && (
                <p className='text-slate-400 text-sm'>Khách hàng chưa có booking nào</p>
              )}
              {!bookingLoading && bookings.map((b) => (
                <div key={b.booking_id} className='mb-3 rounded-md border border-slate-200 px-4 py-3'>
                  <p className='font-medium text-slate-800'>{b.hotel_name} <span className='text-slate-400 font-normal'>({b.city})</span></p>
                  <p className='text-sm text-slate-500'>Mã đặt phòng: {b.booking_code} — Trạng thái: {b.status}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminCustomers