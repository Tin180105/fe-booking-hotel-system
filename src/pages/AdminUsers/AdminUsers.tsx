import { useEffect, useState } from 'react'
import axios from 'axios'
import { MdClose } from 'react-icons/md'

import authApi from '../../apis/auth.api'
import type { AdminUser, RoleOption } from '../../types/user.type'
import type { HotelOverview } from '../../types/hotel.type'
import hotelApi from '../../apis/hotel.api'

const roleFilters = [
  { label: 'Tất cả', value: '' },
  { label: 'Admin', value: 'admin' },
  { label: 'Hotel', value: 'hotel' },
]
const emptyCreateForm = {
  full_name: '',
  email: '',
  password: '',
  phone: '',
  role_code: '',
  hotel_id: ''
}
const roleBadge: Record<string, string> = {
  admin: 'bg-purple-50 text-purple-600',
  hotel: 'bg-blue-50 text-blue-600',
  customer: 'bg-emerald-50 text-emerald-600'
}

interface UserFormState {
  full_name: string
  email: string
  phone: string
  role_code: string
  hotel_id: string
}

const AdminUsers = () => {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [roleFilter, setRoleFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [roles, setRoles] = useState<RoleOption[]>([])
  const [hotels, setHotels] = useState<HotelOverview[]>([])

  // ===== EDIT MODAL STATE =====
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
  const [form, setForm] = useState<UserFormState>({ full_name: '', email: '', phone: '', role_code: '', hotel_id: '' })
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [createForm, setCreateForm] = useState(emptyCreateForm)
  const [createError, setCreateError] = useState('')
  const [creating, setCreating] = useState(false)
  const openCreateForm = () => {
  setCreateForm(emptyCreateForm)
  setCreateError('')
  setIsCreateOpen(true)
}

const closeCreateForm = () => {
  setIsCreateOpen(false)
  setCreateError('')
}

const handleCreateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault()

  if (!createForm.full_name.trim() || !createForm.email.trim() || !createForm.password.trim() || !createForm.role_code) {
    setCreateError('Vui lòng nhập đầy đủ Họ tên, Email, Mật khẩu và Vai trò')
    return
  }

  if (createForm.password.length < 6) {
    setCreateError('Mật khẩu phải có ít nhất 6 ký tự')
    return
  }

  if (createForm.role_code === 'hotel' && !createForm.hotel_id) {
    setCreateError('Vui lòng chọn khách sạn cho tài khoản hotel')
    return
  }

  try {
    setCreating(true)
    setCreateError('')

    await authApi.createUser({
      full_name: createForm.full_name.trim(),
      email: createForm.email.trim(),
      password: createForm.password,
      phone: createForm.phone.trim() || undefined,
      role_code: createForm.role_code,
      hotel_id: createForm.role_code === 'hotel' ? Number(createForm.hotel_id) : null
    })

    setIsCreateOpen(false)
    await fetchUsers()
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      setCreateError(err.response?.data?.message || 'Tạo tài khoản thất bại')
    } else {
      setCreateError('Đã xảy ra lỗi không xác định')
    }
  } finally {
    setCreating(false)
  }
}
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
}, [roleFilter])

useEffect(() => {
  authApi.getRoles().then((res) => setRoles(res.data.data)).catch(() => {})
  hotelApi.getOverview().then((res) => setHotels(res.data?.hotels || [])).catch(() => {})
}, [])

  // ===== OPEN EDIT =====
  const openEditForm = (user: AdminUser) => {
  setEditingUser(user)
  setForm({
    full_name: user.full_name,
    email: user.email,
    phone: user.phone || '',
    role_code: String(user.role_code || '').toLowerCase(),
    hotel_id: user.hotel_id ? String(user.hotel_id) : ''
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

  if (!form.full_name.trim() || !form.email.trim() || !form.role_code) {
    setFormError('Vui lòng nhập đầy đủ Họ tên, Email và Vai trò')
    return
  }

  if (form.role_code === 'hotel' && !form.hotel_id) {
    setFormError('Vui lòng chọn khách sạn cho tài khoản hotel')
    return
  }

  try {
    setSubmitting(true)
    setFormError('')

    await authApi.updateUser(editingUser.id, {
      full_name: form.full_name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || null,
      role_code: form.role_code,
      hotel_id: form.role_code === 'hotel' ? Number(form.hotel_id) : null
    })

    setIsFormOpen(false)
    setEditingUser(null)
    await fetchUsers()
  } catch (err: unknown) {
    // giữ nguyên xử lý lỗi như cũ
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
      <div className='mb-6 flex items-center justify-between'>
  <div>
    <p className='mb-1 text-sm font-semibold uppercase tracking-[0.2em] text-blue-600'>Admin</p>
    <h1 className='text-3xl font-bold text-slate-800'>Quản lý người dùng</h1>
  </div>

  <button
    type='button'
    onClick={openCreateForm}
    className='px-5 py-2.5 rounded-md bg-[#0280ff] text-white font-semibold hover:bg-[#1612eb] transition'
  >
    + Tạo tài khoản
  </button>
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

              <div className='mb-4'>
                <label className='block text-sm font-medium text-slate-600 mb-1.5'>
                  Vai trò <span className='text-red-500'>*</span>
                </label>
                <select
                  value={form.role_code}
                  onChange={(e) => setForm({ ...form, role_code: e.target.value, hotel_id: '' })}
                  className='w-full h-11 rounded-md border border-slate-300 px-3.5 text-sm outline-none focus:border-[#173f67]'
                >
                  <option value=''>-- Chọn vai trò --</option>
                  {roles.map((r) => (
                    <option key={r.code} value={r.code}>{r.name}</option>
                  ))}
                </select>
              </div>

              {form.role_code === 'hotel' && (
                <div className='mb-6'>
                  <label className='block text-sm font-medium text-slate-600 mb-1.5'>
                    Khách sạn <span className='text-red-500'>*</span>
                  </label>
                  <select
                    value={form.hotel_id}
                    onChange={(e) => setForm({ ...form, hotel_id: e.target.value })}
                    className='w-full h-11 rounded-md border border-slate-300 px-3.5 text-sm outline-none focus:border-[#173f67]'
                  >
                    <option value=''>-- Chọn khách sạn --</option>
                    {hotels.map((h) => (
                      <option key={h.hotelId} value={h.hotelId}>{h.hotelName}</option>
                    ))}
                  </select>
                </div>
              )}

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

      {/* ===== CREATE MODAL ===== ✅ đặt ở đây, ngang hàng với EDIT MODAL */}
      {isCreateOpen && (
        <div className='fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-xl w-full max-w-[460px]'>
            <div className='flex items-center justify-between px-6 py-4 border-b border-slate-200'>
              <h2 className='text-lg font-semibold text-slate-800'>Tạo tài khoản mới</h2>
              <button type='button' onClick={closeCreateForm} className='text-slate-400 hover:text-slate-700'>
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
                  Họ tên <span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  value={createForm.full_name}
                  onChange={(e) => setCreateForm({ ...createForm, full_name: e.target.value })}
                  className='w-full h-11 rounded-md border border-slate-300 px-3.5 text-sm outline-none focus:border-[#173f67]'
                />
              </div>

              <div className='mb-4'>
                <label className='block text-sm font-medium text-slate-600 mb-1.5'>
                  Email <span className='text-red-500'>*</span>
                </label>
                <input
                  type='email'
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  className='w-full h-11 rounded-md border border-slate-300 px-3.5 text-sm outline-none focus:border-[#173f67]'
                />
              </div>

              <div className='mb-4'>
                <label className='block text-sm font-medium text-slate-600 mb-1.5'>
                  Mật khẩu <span className='text-red-500'>*</span>
                </label>
                <input
                  type='password'
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  className='w-full h-11 rounded-md border border-slate-300 px-3.5 text-sm outline-none focus:border-[#173f67]'
                />
              </div>

              <div className='mb-4'>
                <label className='block text-sm font-medium text-slate-600 mb-1.5'>Số điện thoại</label>
                <input
                  type='text'
                  value={createForm.phone}
                  onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                  className='w-full h-11 rounded-md border border-slate-300 px-3.5 text-sm outline-none focus:border-[#173f67]'
                />
              </div>

              <div className='mb-4'>
                <label className='block text-sm font-medium text-slate-600 mb-1.5'>
                  Vai trò <span className='text-red-500'>*</span>
                </label>
                <select
                  value={createForm.role_code}
                  onChange={(e) => setCreateForm({ ...createForm, role_code: e.target.value, hotel_id: '' })}
                  className='w-full h-11 rounded-md border border-slate-300 px-3.5 text-sm outline-none focus:border-[#173f67]'
                >
                  <option value=''>-- Chọn vai trò --</option>
                  {roles.map((r) => (
                    <option key={r.code} value={r.code}>{r.name}</option>
                  ))}
                </select>
              </div>

              {createForm.role_code === 'hotel' && (
                <div className='mb-6'>
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
                </div>
              )}

              <div className='flex justify-end gap-3'>
                <button
                  type='button'
                  onClick={closeCreateForm}
                  className='px-5 py-2.5 rounded-md border border-slate-300 text-slate-600 font-medium hover:bg-slate-50'
                >
                  Hủy
                </button>
                <button
                  type='submit'
                  disabled={creating}
                  className='px-5 py-2.5 rounded-md bg-[#0280ff] text-white font-semibold hover:bg-[#1612eb] disabled:opacity-60'
                >
                  {creating ? 'Đang tạo...' : 'Tạo tài khoản'}
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