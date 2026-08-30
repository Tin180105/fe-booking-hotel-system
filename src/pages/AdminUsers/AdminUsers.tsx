import { useEffect, useState } from 'react'
import axios from 'axios'
import { MdClose } from 'react-icons/md'

import authApi from '../../apis/auth.api'
import type { AdminUser } from '../../types/user.type'

const roleFilters = [
  { label: 'Tất cả', value: '' },
  { label: 'Admin', value: 'admin' },
  { label: 'Hotel', value: 'hotel' },
  { label: 'Customer', value: 'customer' }
]

const roleBadge: Record<string, string> = {
  admin: 'bg-purple-50 text-purple-600',
  hotel: 'bg-blue-50 text-blue-600',
  customer: 'bg-emerald-50 text-emerald-600'
}

interface UserFormState {
  full_name: string
  email: string
  phone: string
}

const AdminUsers = () => {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [roleFilter, setRoleFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState<number | null>(null)

  // ===== EDIT MODAL STATE =====
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
  const [form, setForm] = useState<UserFormState>({ full_name: '', email: '', phone: '' })
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await authApi.getUsers(roleFilter || undefined)
      setUsers(response.data?.data || [])
    } catch (err: unknown) {
      console.error('[AdminUsers] failed', err)

      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Không thể tải danh sách người dùng')
      } else {
        setError('Đã xảy ra lỗi không xác định')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter])

  // ===== OPEN EDIT =====
  const openEditForm = (user: AdminUser) => {
    setEditingUser(user)
    setForm({
      full_name: user.full_name,
      email: user.email,
      phone: user.phone || ''
    })
    setFormError('')
    setIsFormOpen(true)
  }

  const closeForm = () => {
    setIsFormOpen(false)
    setEditingUser(null)
    setFormError('')
  }

  // ===== SUBMIT EDIT =====
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!editingUser) return

    if (!form.full_name.trim() || !form.email.trim()) {
      setFormError('Vui lòng nhập đầy đủ Họ tên và Email')
      return
    }

    try {
      setSubmitting(true)
      setFormError('')

      await authApi.updateUser(editingUser.id, {
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null
      })

      setIsFormOpen(false)
      setEditingUser(null)
      await fetchUsers()
    } catch (err: unknown) {
      console.error('[AdminUsers] update failed', err)

      if (axios.isAxiosError(err)) {
        setFormError(err.response?.data?.message || 'Cập nhật thất bại')
      } else {
        setFormError('Đã xảy ra lỗi không xác định')
      }
    } finally {
      setSubmitting(false)
    }
  }

  // ===== DELETE =====
  const handleDelete = async (user: AdminUser) => {
    const confirmed = window.confirm(`Xóa tài khoản "${user.full_name}" (${user.email})?`)

    if (!confirmed) return

    try {
      setDeletingId(user.id)
      setError('')

      await authApi.deleteUser(user.id)

      setUsers((prev) => prev.filter((u) => u.id !== user.id))
    } catch (err: unknown) {
      console.error('[AdminUsers] delete failed', err)

      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Không thể xóa người dùng (có thể đang có dữ liệu liên quan)')
      } else {
        setError('Đã xảy ra lỗi không xác định')
      }
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className='p-8'>
      <div className='mb-6'>
        <p className='mb-1 text-sm font-semibold uppercase tracking-[0.2em] text-blue-600'>Admin</p>
        <h1 className='text-3xl font-bold text-slate-800'>Quản lý người dùng</h1>
      </div>

      {/* FILTER TABS */}
      <div className='flex items-center gap-2 mb-5'>
        {roleFilters.map((item) => (
          <button
            key={item.value}
            type='button'
            onClick={() => setRoleFilter(item.value)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
              roleFilter === item.value
                ? 'bg-[#173f67] text-white'
                : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
            }`}
          >
            {item.label}
          </button>
        ))}
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
                <th className='px-6 py-3 font-medium'>Vai trò</th>
                <th className='px-6 py-3 font-medium'>Khách sạn</th>
                <th className='px-6 py-3 font-medium'>Trạng thái</th>
                <th className='px-6 py-3 font-medium'>Ngày tạo</th>
                <th className='px-6 py-3 font-medium'>Thao tác</th>
              </tr>
            </thead>

            <tbody className='divide-y divide-slate-100'>
              {loading && (
                <tr>
                  <td colSpan={9} className='px-6 py-6 text-center text-slate-400'>
                    Đang tải dữ liệu...
                  </td>
                </tr>
              )}

              {!loading && users.length === 0 && !error && (
                <tr>
                  <td colSpan={9} className='px-6 py-6 text-center text-slate-400'>
                    Không có người dùng nào
                  </td>
                </tr>
              )}

              {!loading &&
                users.map((user) => {
                  const roleKey = String(user.role_code || '').toLowerCase()

                  return (
                    <tr key={user.id} className='hover:bg-slate-50'>
                      <td className='px-6 py-3 text-slate-500'>#{user.id}</td>
                      <td className='px-6 py-3 font-medium text-slate-800'>{user.full_name}</td>
                      <td className='px-6 py-3 text-slate-600'>{user.email}</td>
                      <td className='px-6 py-3 text-slate-600'>{user.phone || '—'}</td>
                      <td className='px-6 py-3'>
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            roleBadge[roleKey] || 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {user.role_name}
                        </span>
                      </td>
                      <td className='px-6 py-3 text-slate-600'>{user.hotel_name || '—'}</td>
                      <td className='px-6 py-3 text-slate-600'>{user.status}</td>
                      <td className='px-6 py-3 text-slate-500'>
                        {new Date(user.created_at).toLocaleDateString('vi-VN')}
                      </td>
                      <td className='px-6 py-3'>
                        <button
                          type='button'
                          onClick={() => openEditForm(user)}
                          className='text-blue-600 hover:underline text-[13px] mr-3'
                        >
                          Sửa
                        </button>
                        <button
                          type='button'
                          disabled={deletingId === user.id}
                          onClick={() => handleDelete(user)}
                          className='text-red-500 hover:underline text-[13px] disabled:opacity-50'
                        >
                          {deletingId === user.id ? 'Đang xóa...' : 'Xóa'}
                        </button>
                      </td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== EDIT MODAL ===== */}
      {isFormOpen && editingUser && (
        <div className='fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-xl w-full max-w-[460px]'>
            <div className='flex items-center justify-between px-6 py-4 border-b border-slate-200'>
              <h2 className='text-lg font-semibold text-slate-800'>Sửa thông tin người dùng</h2>
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
                  Họ tên <span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  className='w-full h-11 rounded-md border border-slate-300 px-3.5 text-sm outline-none focus:border-[#173f67]'
                />
              </div>

              <div className='mb-4'>
                <label className='block text-sm font-medium text-slate-600 mb-1.5'>
                  Email <span className='text-red-500'>*</span>
                </label>
                <input
                  type='email'
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className='w-full h-11 rounded-md border border-slate-300 px-3.5 text-sm outline-none focus:border-[#173f67]'
                />
              </div>

              <div className='mb-6'>
                <label className='block text-sm font-medium text-slate-600 mb-1.5'>Số điện thoại</label>
                <input
                  type='text'
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
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
                  {submitting ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminUsers