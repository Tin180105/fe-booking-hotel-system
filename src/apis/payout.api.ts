import http from '../utils/axios.http'

export interface Payout {
  id: number
  hotel_id: number
  hotel_name: string
  payout_code: string
  total_booking_amount: number
  total_commission: number
  payout_amount: number
  status: string
  payout_date: string | null
  created_at: string
}

export interface CreatePayoutRequest {
  hotel_id: number
  payout_code: string
}

export interface UpdatePayoutRequest {
  status?: string
  payout_date?: string | null
}

interface ApiResponse<T> {
  success: boolean
  message?: string
  data: T
}

const URL_PAYOUTS = '/payouts'

const payoutApi = {
  // ADMIN: xem tất cả
  getAll() {
    return http.get<ApiResponse<Payout[]>>(URL_PAYOUTS)
  },

  // ADMIN hoặc HOTEL: xem theo hotel
  getByHotelId(hotelId: number) {
    return http.get<ApiResponse<Payout[]>>(`${URL_PAYOUTS}/hotel/${hotelId}`)
  },

  // ADMIN: chi tiết
  getById(id: number) {
    return http.get<ApiResponse<Payout>>(`${URL_PAYOUTS}/${id}`)
  },

  // ADMIN: tạo payout
  create(body: CreatePayoutRequest) {
    return http.post<ApiResponse<Payout>>(URL_PAYOUTS, body)
  },

  // ADMIN: cập nhật trạng thái / ngày chi trả
  update(id: number, body: UpdatePayoutRequest) {
    return http.put<ApiResponse<Payout>>(`${URL_PAYOUTS}/${id}`, body)
  },

  // ADMIN: xoá
  delete(id: number) {
    return http.delete<ApiResponse<null>>(`${URL_PAYOUTS}/${id}`)
  }
}

export default payoutApi