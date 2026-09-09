import http from '../utils/axios.http'

// Một dòng trong vw_BookingOverview (1 dòng = 1 booking_room,
// nên 1 booking có thể có nhiều dòng nếu đặt nhiều loại phòng)
export interface BookingOverviewRow {
  booking_id: number
  booking_code: string
  booking_status: string
  total_amount: number
  commission_amount: number
  final_amount: number
  booking_created_at: string
  booking_updated_at: string

  customer_id: number
  customer_name: string
  customer_phone: string
  customer_email: string

  hotel_id: number
  hotel_name: string
  hotel_city: string
  hotel_address: string

  room_type_id: number
  room_type_name: string
  room_capacity: number

  room_quantity: number
  total_room_price: number
  expected_check_in: string
  expected_check_out: string
}

export interface BookingRoomDetail {
  id: number
  room_type_id: number
  room_type_name: string
  quantity: number
  total_room_price: number
  expected_check_in: string
  expected_check_out: string
}

export interface BookingDetail {
  id: number
  booking_code: string
  status: string
  total_amount: number
  commission_amount: number
  final_amount: number
  created_at: string
  updated_at: string

  hotel_id: number
  hotel_name: string

  customer_id: number
  customer_name: string
  customer_email: string
  customer_phone: string

  rooms: BookingRoomDetail[]
}

// Dòng trả về từ GET /bookings/hotel/:hotelId
// (khác BookingOverviewRow: đây là 1 dòng = 1 booking, không group theo room_type,
// dùng cho trang Hotel xem danh sách khách đang đặt phòng của chính mình)
export interface BookingByHotelRow {
  id: number
  booking_code: string
  status: string
  total_amount: number
  commission_amount: number
  final_amount: number
  created_at: string

  customer_id: number
  customer_name: string
  customer_email: string
  customer_phone: string
}


const bookingApi = {
  // Danh sách tổng quan (từ VIEW) — dùng cho bảng admin
  getOverview() {
    return http.get<{ success: true; data: BookingOverviewRow[] }>('/bookings/overview')
  },

  // Danh sách booking theo hotel — dùng cho trang Hotel (chỉ thấy của khách sạn mình)
  getByHotelId(hotelId: number) {
    return http.get<{ success: true; data: BookingByHotelRow[] }>(`/bookings/hotel/${hotelId}`)
  },

  // Chi tiết 1 booking (đã group sẵn rooms)
  getById(id: number) {
    return http.get<{ success: true; data: BookingDetail }>(`/bookings/${id}`)
  },

  // Đổi trạng thái nhanh
  updateStatus(id: number, status: string) {
    return http.patch<{ success: true; data: unknown }>(`/bookings/${id}/status`, { status })
  },

  // Xóa booking
  delete(id: number) {
    return http.delete<{ success: true }>(`/bookings/${id}`)
  }
}

export default bookingApi