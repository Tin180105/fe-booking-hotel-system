import { useState } from 'react'
import axios from 'axios'
import bookingApi from '../../apis/booking.api'

interface LogEntry {
  time: string
  status: string
}

const DemoDirtyRead = () => {
  const [bookingId, setBookingId] = useState('')
  const [delaySec, setDelaySec] = useState(8)
  const [isWriting, setIsWriting] = useState(false)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [error, setError] = useState('')

  const addLog = (status: string) => {
    setLogs((prev) => [
      { time: new Date().toLocaleTimeString('vi-VN'), status },
      ...prev
    ])
  }

  const startTransactionA = async () => {
    if (!bookingId) {
      setError('Vui lòng nhập Booking ID')
      return
    }

    try {
      setError('')
      setIsWriting(true)
      addLog(`⏳ Transaction A: UPDATE status = CONFIRMED (chưa commit, chờ ${delaySec}s)...`)

      await bookingApi.demoDirtyWrite(Number(bookingId), 'CONFIRMED', delaySec * 1000)

      addLog('↩️ Transaction A: ROLLBACK xong, status quay về giá trị cũ')
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Lỗi khi chạy Transaction A')
      }
    } finally {
      setIsWriting(false)
    }
  }

  const readDirty = async () => {
    if (!bookingId) {
      setError('Vui lòng nhập Booking ID')
      return
    }

    try {
      setError('')
      const res = await bookingApi.demoDirtyRead(Number(bookingId))
      addLog(`👁️ Transaction B đọc được: status = ${res.data.data.status}`)
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Lỗi khi đọc dữ liệu')
      }
    }
  }

  return (
    <div className='max-w-3xl mx-auto p-8'>
      <h1 className='text-2xl font-bold text-[#173f67] mb-2'>Demo lỗi Dirty Read</h1>
      <p className='text-slate-500 mb-6'>
        Bước 1: Nhập Booking ID, bấm "Bắt đầu Transaction A". Trong lúc nút đang chạy (chưa xong),
        liên tục bấm "Transaction B: Đọc ngay" — bạn sẽ thấy status = CONFIRMED dù nó chưa từng được commit.
        Sau khi A rollback xong, bấm đọc lại sẽ thấy status quay về giá trị thật.
      </p>

      {error && (
        <div className='mb-4 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-red-600'>{error}</div>
      )}

      <div className='flex flex-wrap gap-3 items-end mb-6'>
        <div>
          <label className='block text-sm font-medium text-slate-600 mb-1'>Booking ID</label>
          <input
            type='number'
            value={bookingId}
            onChange={(e) => setBookingId(e.target.value)}
            className='h-11 w-40 rounded-md border border-slate-300 px-3 outline-none focus:border-[#173f67]'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-slate-600 mb-1'>Thời gian trễ (giây)</label>
          <input
            type='number'
            min={1}
            value={delaySec}
            onChange={(e) => setDelaySec(Number(e.target.value))}
            className='h-11 w-28 rounded-md border border-slate-300 px-3 outline-none focus:border-[#173f67]'
          />
        </div>

        <button
          type='button'
          onClick={startTransactionA}
          disabled={isWriting}
          className='h-11 px-5 rounded-md bg-red-500 text-white font-semibold hover:bg-red-600 disabled:opacity-60'
        >
          {isWriting ? 'Transaction A đang chạy...' : 'Bắt đầu Transaction A (ghi)'}
        </button>

        <button
          type='button'
          onClick={readDirty}
          className='h-11 px-5 rounded-md bg-[#0280ff] text-white font-semibold hover:bg-[#1612eb]'
        >
          Transaction B: Đọc ngay (Dirty Read)
        </button>
      </div>

      <div className='rounded-xl border border-slate-200 bg-white p-4'>
        <h2 className='font-semibold text-slate-700 mb-3'>Log kết quả</h2>
        <div className='space-y-2 max-h-96 overflow-y-auto'>
          {logs.length === 0 && <p className='text-slate-400 text-sm'>Chưa có log nào</p>}
          {logs.map((log, idx) => (
            <div key={idx} className='text-sm border-b border-slate-100 pb-2'>
              <span className='text-slate-400 mr-2'>[{log.time}]</span>
              <span>{log.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default DemoDirtyRead