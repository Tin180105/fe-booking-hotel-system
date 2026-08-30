import http from '../utils/axios.http'

export interface Customer {
  id: number
  full_name: string
  phone: string
  email: string
  created_at: string
}

export interface CustomerBooking {
  hotel_id: number
  hotel_name: string
  city: string
  booking_id: number
  booking_code: string
  status: string
}

const customerApi = {
  getAll() {
    return http.get<{ success: true; data: Customer[] }>('/customers')
  },
  update(id: number, body: { full_name?: string; phone?: string; email?: string }) {
    return http.put<{ success: true; data: Customer }>(`/customers/${id}`, body)
  },
  delete(id: number) {
    return http.delete<{ success: true }>(`/customers/${id}`)
  },
  getBookings(customerId: number) {
    return http.get<{ success: true; data: CustomerBooking[] }>(`/bookings/customer/${customerId}`)
  }
}

export default customerApi