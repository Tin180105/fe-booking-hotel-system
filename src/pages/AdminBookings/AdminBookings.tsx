import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { MdClose, MdVisibility } from 'react-icons/md'

import bookingApi, {
  type BookingOverviewRow,
  type BookingDetail
} from '../../apis/booking.api'

const ALLOWED_STATUS = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']


const statusLabel: Record<string, { text: string; className: string }> = {
  PENDING: { text: 'Chờ xác nhận', className: 'bg-amber-50 text-amber-600' },
  CONFIRMED: { text: 'Đã xác nhận', className: 'bg-blue-50 text-blue-600' },
  CANCELLED: { text: 'Đã hủy', className: 'bg-red-50 text-red-600' },
  COMPLETED: { text: 'Hoàn tất', className: 'bg-emerald-50 text-emerald-600' }
}

const statusTabs = [
  { label: 'Tất cả', value: '' },
  { label: 'Chờ xác nhận', value: 'PENDING' },
  { label: 'Đã xác nhận', value: 'CONFIRMED' },
  { label: 'Hoàn tất', value: 'COMPLETED' },
  { label: 'Đã hủy', value: 'CANCELLED' }
]

// Một booking đã được gộp từ nhiều dòng room trong view lại thành 1 dòng để hiển thị
interface GroupedBooking {
  booking_id: number
  booking_code: string
  booking_status: string
  total_amount: number
  final_amount: number
  booking_created_at: string

  customer_name: string
  customer_email: string
  customer_phone: string

  hotel_name: string
  hotel_city: string

  rooms: { room_type_name: string; room_quantity: number }[]
  check_in: string
  check_out: string
}

const formatMoney = (value: number) =>
  Number(value || 0).toLocaleString('vi-VN') + 'đ'

const formatDate = (value: string) =>
  value ? new Date(value).toLocaleDateString('vi-VN') : '—'

const groupByBooking = (rows: BookingOverviewRow[]): GroupedBooking[] => {
  const map = new Map<number, GroupedBooking>()

  for (const row of rows) {
    const existing = map.get(row.booking_id)

    if (!existing) {
      map.set(row.booking_id, {
        booking_id: row.booking_id,
        booking_code: row.booking_code,
        booking_status: row.booking_status,
        total_amount: row.total_amount,
        final_amount: row.final_amount,
        booking_created_at: row.booking_created_at,
        customer_name: row.customer_name,
        customer_email: row.customer_email,
        customer_phone: row.customer_phone,
        hotel_name: row.hotel_name,
        hotel_city: row.hotel_city,
        rooms: [{ room_type_name: row.room_type_name, room_quantity: row.room_quantity }],
        check_in: row.expected_check_in,
        check_out: row.expected_check_out
      })
    } else {
      existing.rooms.push({
        room_type_name: row.room_type_name,
        room_quantity: row.room_quantity
      })

      if (new Date(row.expected_check_in) < new Date(existing.check_in)) {
        existing.check_in = row.expected_check_in
      }

      if (new Date(row.expected_check_out) > new Date(existing.check_out)) {
        existing.check_out = row.expected_check_out
      }
    }
  }

  return Array.from(map.values())
}

const AdminBookings = () => {
  const [rows, setRows] = useState<BookingOverviewRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [statusFilter, setStatusFilter] = useState('')
  const [keyword, setKeyword] = useState('')

  const [statusUpdatingId, setStatusUpdatingId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  // ===== DETAIL MODAL =====
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [detail, setDetail] = useState<BookingDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  // lỗi non-reatable
  const [firstReadStatus, setFirstReadStatus] = useState<string | null>(null)
  const [firstReadTime, setFirstReadTime] = useState<string | null>(null)
  const [secondReadStatus, setSecondReadStatus] = useState<string | null>(null)
  const [secondReadTime, setSecondReadTime] = useState<string | null>(null)

  const fetchBookings = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await bookingApi.getOverview()
      setRows(response.data?.data || [])
    } catch (err: unknown) {
      console.error('[AdminBookings] failed', err)

      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Không thể tải danh sách đặt phòng')
      } else {
        setError('Đã xảy ra lỗi không xác định')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [])

  const grouped = useMemo(() => groupByBooking(rows), [rows])

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase()

    return grouped.filter((b) => {
      if (statusFilter && b.booking_status !== statusFilter) return false

      if (kw) {
        const haystack = `${b.booking_code} ${b.customer_name} ${b.customer_email} ${b.hotel_name}`.toLowerCase()
        if (!haystack.includes(kw)) return false
      }

      return true
    })
  }, [grouped, statusFilter, keyword])

  // ===== CHANGE STATUS =====
  const handleChangeStatus = async (bookingId: number, status: string) => {
    try {
      setStatusUpdatingId(bookingId)
      setError('')

      await bookingApi.updateStatus(bookingId, status)

      setRows((prev) =>
        prev.map((r) => (r.booking_id === bookingId ? { ...r, booking_status: status } : r))
      )
    } catch (err: unknown) {
      console.error('[AdminBookings] update status failed', err)

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
  const handleDelete = async (bookingId: number, code: string) => {
    const confirmed = window.confirm(`Xóa booking "${code}"? Hành động này không thể hoàn tác.`)

    if (!confirmed) return

    try {
      setDeletingId(bookingId)
      setError('')

      await bookingApi.delete(bookingId)

      setRows((prev) => prev.filter((r) => r.booking_id !== bookingId))
    } catch (err: unknown) {
      console.error('[AdminBookings] delete failed', err)

      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Không thể xóa booking (có thể đang có dữ liệu liên quan)')
      } else {
        setError('Đã xảy ra lỗi không xác định')
      }
    } finally {
      setDeletingId(null)
    }
  }

  // ===== VIEW DETAIL =====
  // const openDetail = async (bookingId: number) => {
  //   setIsDetailOpen(true)
  //   setDetail(null)
  //   setDetailLoading(true)

  //   try {
  //     const response = await bookingApi.getById(bookingId)
  //     setDetail(response.data?.data || null)
  //   } catch (err) {
  //     console.error('[AdminBookings] get detail failed', err)
  //   } finally {
  //     setDetailLoading(false)
  //   }
  // } --> lỗi non-reatable
  const openDetail = async (bookingId: number) => {
    setIsDetailOpen(true)
    setDetail(null)
    setDetailLoading(true)
    setFirstReadStatus(null)
    setFirstReadTime(null)
    setSecondReadStatus(null)
    setSecondReadTime(null)

    try {
      const response = await bookingApi.getById(bookingId)
      const data = response.data?.data || null
      setDetail(data)

      if (data) {
        setFirstReadStatus(data.status)
        setFirstReadTime(new Date().toLocaleTimeString('vi-VN'))
      }
    } catch (err) {
      console.error('[AdminBookings] get detail failed', err)
    } finally {
      setDetailLoading(false)
    }
  }
  const rereadDetail = async () => {
    if (!detail) return

    try {
      const response = await bookingApi.getById(detail.id)
      const data = response.data?.data || null

      if (data) {
        setDetail(data)
        setSecondReadStatus(data.status)
        setSecondReadTime(new Date().toLocaleTimeString('vi-VN'))
      }
    } catch (err) {
      console.error('[AdminBookings] reread detail failed', err)
    }
  }

  return (
    <div className='p-8'>
      <div className='mb-6'>
        <p className='mb-1 text-sm font-semibold uppercase tracking-[0.2em] text-blue-600'>Admin</p>
        <h1 className='text-3xl font-bold text-slate-800'>Quản lý đặt phòng</h1>
      </div>

      {/* FILTER TABS + SEARCH */}
      <div className='mb-5 flex flex-wrap items-center justify-between gap-3'>
        <div className='flex items-center gap-2'>
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              type='button'
              onClick={() => setStatusFilter(tab.value)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                statusFilter === tab.value
                  ? 'bg-[#173f67] text-white'
                  : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <input
          type='text'
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder='Tìm theo mã booking, khách hàng, khách sạn...'
          className='h-10 w-[300px] rounded-md border border-slate-300 px-3.5 text-sm outline-none focus:border-[#173f67]'
        />
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
                <th className='px-6 py-3 font-medium'>Mã đặt phòng</th>
                <th className='px-6 py-3 font-medium'>Khách hàng</th>
                <th className='px-6 py-3 font-medium'>Khách sạn</th>
                <th className='px-6 py-3 font-medium'>Phòng</th>
                <th className='px-6 py-3 font-medium'>Nhận / Trả phòng</th>
                <th className='px-6 py-3 font-medium'>Thành tiền</th>
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

              {!loading && filtered.length === 0 && !error && (
                <tr>
                  <td colSpan={9} className='px-6 py-6 text-center text-slate-400'>
                    Không có booking nào
                  </td>
                </tr>
              )}

              {!loading &&
                filtered.map((b) => (
                  <tr key={b.booking_id} className='hover:bg-slate-50 align-top'>
                    <td className='px-6 py-3 font-medium text-slate-800'>{b.booking_code}</td>

                    <td className='px-6 py-3 text-slate-600'>
                      <div className='font-medium text-slate-800'>{b.customer_name}</div>
                      <div className='text-xs text-slate-400'>{b.customer_email}</div>
                    </td>

                    <td className='px-6 py-3 text-slate-600'>
                      <div>{b.hotel_name}</div>
                      <div className='text-xs text-slate-400'>{b.hotel_city}</div>
                    </td>

                    <td className='px-6 py-3 text-slate-600'>
                      {b.rooms.map((r, idx) => (
                        <div key={idx}>
                          {r.room_type_name} × {r.room_quantity}
                        </div>
                      ))}
                    </td>

                    <td className='px-6 py-3 text-slate-600'>
                      {formatDate(b.check_in)} → {formatDate(b.check_out)}
                    </td>

                    <td className='px-6 py-3 text-slate-800 font-medium'>
                      {formatMoney(b.final_amount)}
                    </td>

                    <td className='px-6 py-3'>
                      <select
                        value={b.booking_status}
                        disabled={statusUpdatingId === b.booking_id}
                        onChange={(e) => handleChangeStatus(b.booking_id, e.target.value)}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium border-none outline-none cursor-pointer ${
                          statusLabel[b.booking_status]?.className || 'bg-slate-100 text-slate-500'
                        } disabled:opacity-50`}
                      >
                        {ALLOWED_STATUS.map((s) => (
                          <option key={s} value={s}>
                            {statusLabel[s]?.text || s}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className='px-6 py-3 text-slate-500'>{formatDate(b.booking_created_at)}</td>

                    <td className='px-6 py-3'>
                      <button
                        type='button'
                        onClick={() => openDetail(b.booking_id)}
                        className='text-emerald-600 hover:underline text-[13px] flex items-center gap-1 mb-1.5'
                      >
                        <MdVisibility size={16} /> Chi tiết
                      </button>

                      <button
                        type='button'
                        disabled={deletingId === b.booking_id}
                        onClick={() => handleDelete(b.booking_id, b.booking_code)}
                        className='text-red-500 hover:underline text-[13px] disabled:opacity-50'
                      >
                        {deletingId === b.booking_id ? 'Đang xóa...' : 'Xóa'}
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== DETAIL MODAL ===== */}
      {isDetailOpen && (
        <div className='fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-xl w-full max-w-[560px] max-h-[85vh] overflow-y-auto'>
            <div className='flex items-center justify-between px-6 py-4 border-b border-slate-200'>
              <h2 className='text-lg font-semibold text-slate-800'>
                Chi tiết booking {detail ? `#${detail.booking_code}` : ''}
              </h2>
              <button
                type='button'
                onClick={() => setIsDetailOpen(false)}
                className='text-slate-400 hover:text-slate-700'
              >
                <MdClose size={22} />
              </button>
            </div>

            <div className='px-6 py-5'>
              {detailLoading && <p className='text-slate-400 text-sm'>Đang tải...</p>}

              {!detailLoading && !detail && (
                <p className='text-slate-400 text-sm'>Không tìm thấy dữ liệu booking</p>
              )}

              {!detailLoading && detail && (
                <div className='space-y-5'>
                  <div className='rounded-lg border border-dashed border-orange-300 bg-orange-50 p-4 text-sm'>
                    <p className='font-semibold text-orange-700 mb-2'>🧪 Demo Non-repeatable Read</p>

                    {firstReadStatus && (
                      <p>
                        📖 Lần đọc 1 <span className='text-slate-400'>({firstReadTime})</span>: <strong>{firstReadStatus}</strong>
                      </p>
                    )}

                    {secondReadStatus && (
                      <p>
                        📖 Lần đọc 2 <span className='text-slate-400'>({secondReadTime})</span>: <strong>{secondReadStatus}</strong>
                      </p>
                    )}

                    {secondReadStatus && firstReadStatus && secondReadStatus !== firstReadStatus && (
                      <p className='mt-2 font-semibold text-red-600'>
                        ⚠️ NON-REPEATABLE READ: cùng 1 booking, cùng phiên xem, nhưng 2 lần đọc cho kết quả khác nhau!
                      </p>
                    )}

                    <button
                      type='button'
                      onClick={rereadDetail}
                      className='mt-3 px-4 py-2 rounded-md bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600'
                    >
                      Đọc lại (giả lập lần đọc thứ 2)
                    </button>
                  </div>
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <p className='text-xs uppercase text-slate-400 mb-1'>Khách hàng</p>
                      <p className='font-medium text-slate-800'>{detail.customer_name}</p>
                      <p className='text-sm text-slate-500'>{detail.customer_email}</p>
                      <p className='text-sm text-slate-500'>{detail.customer_phone}</p>
                    </div>

                    <div>
                      <p className='text-xs uppercase text-slate-400 mb-1'>Khách sạn</p>
                      <p className='font-medium text-slate-800'>{detail.hotel_name}</p>
                    </div>
                  </div>

                  <div>
                    <p className='text-xs uppercase text-slate-400 mb-2'>Danh sách phòng</p>

                    <div className='space-y-2'>
                      {detail.rooms.map((r) => (
                        <div key={r.id} className='rounded-md border border-slate-200 px-4 py-3'>
                          <p className='font-medium text-slate-800'>
                            {r.room_type_name} × {r.quantity}
                          </p>
                          <p className='text-sm text-slate-500'>
                            {formatDate(r.expected_check_in)} → {formatDate(r.expected_check_out)}
                          </p>
                          <p className='text-sm text-slate-500'>
                            Thành tiền: {formatMoney(r.total_room_price)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className='grid grid-cols-2 gap-4 border-t border-slate-100 pt-4'>
                    <div>
                      <p className='text-xs uppercase text-slate-400 mb-1'>Trạng thái</p>
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          statusLabel[detail.status]?.className || 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {statusLabel[detail.status]?.text || detail.status}
                      </span>
                    </div>

                    <div>
                      <p className='text-xs uppercase text-slate-400 mb-1'>Tổng tiền</p>
                      <p className='font-semibold text-slate-800'>{formatMoney(detail.total_amount)}</p>
                    </div>

                    <div>
                      <p className='text-xs uppercase text-slate-400 mb-1'>Hoa hồng</p>
                      <p className='text-slate-700'>{formatMoney(detail.commission_amount)}</p>
                    </div>

                    <div>
                      <p className='text-xs uppercase text-slate-400 mb-1'>Khách trả</p>
                      <p className='font-semibold text-slate-800'>{formatMoney(detail.final_amount)}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminBookings