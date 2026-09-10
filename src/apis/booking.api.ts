import http from '../utils/axios.http'

export interface CreateBookingRequest {
  hotel_id: number
  customer_id: number
  room_type_id: number
  quantity: number
  check_in: string
  check_out: string
  promotion_id?: number | null
}

export interface CreateBookingResponse {
  success: boolean
  message: string
  data: {
    booking_id: number
    booking_code: string
    final_amount: number
    status: string
  }
}

const bookingApi = {
  create(body: CreateBookingRequest) {
    return http.post<CreateBookingResponse>('/bookings', body)
  }
}

export default bookingApi