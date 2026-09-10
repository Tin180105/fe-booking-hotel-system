import http from '../utils/axios.http'

export interface CreatePaymentRequest {
  booking_id: number
  payment_method: string
  transaction_code?: string | null
  amount: number
}

export interface CreatePaymentResponse {
  success: boolean
  message: string
  data: {
    id: number
    booking_id: number
    payment_status: string
    amount: number
  }
}

const paymentApi = {
  create(body: CreatePaymentRequest) {
    return http.post<CreatePaymentResponse>('/payments', body)
  }
}

export default paymentApi