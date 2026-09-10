import http from '../utils/axios.http'

export interface Promotion {
  id: number
  code: string
  discount_type: string
  discount_value: number
  max_discount: number | null
  start_date: string
  end_date: string
  is_active: boolean
}

interface PromotionResponse {
  success: boolean
  data: Promotion[]
}

const promotionApi = {
  getAll() {
    return http.get<PromotionResponse>('/promotions')
  }
}

export default promotionApi