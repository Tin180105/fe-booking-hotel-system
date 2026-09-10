import http from '../utils/axios.http'

export type DiscountType = 'PERCENTAGE' | 'FIXED'

export interface Promotion {
  id: number
  code: string
  discount_type: DiscountType
  discount_value: number
  max_discount: number | null
  start_date: string
  end_date: string
  is_active: boolean
}

export interface PromotionPayload {
  code: string
  discount_type: DiscountType
  discount_value: number
  max_discount?: number | null
  start_date: string
  end_date: string
  is_active: boolean
}

interface ApiResponse<T> {
  success: boolean
  message?: string
  data: T
}

const URL_PROMOTIONS = '/promotions'

const promotionApi = {
  getAll() {
    return http.get<ApiResponse<Promotion[]>>(URL_PROMOTIONS)
  },

  getById(id: number) {
    return http.get<ApiResponse<Promotion>>(`${URL_PROMOTIONS}/${id}`)
  },

  create(body: PromotionPayload) {
    return http.post<ApiResponse<Promotion>>(URL_PROMOTIONS, body)
  },

  update(id: number, body: PromotionPayload) {
    return http.put<ApiResponse<Promotion>>(`${URL_PROMOTIONS}/${id}`, body)
  },

  delete(id: number) {
    return http.delete<ApiResponse<null>>(`${URL_PROMOTIONS}/${id}`)
  }
}

export default promotionApi