import http from '../utils/axios.http'

interface SavedPromotion {
  promotion_id: number
  saved_at: string
}

interface SavedPromotionsResponse {
  success: boolean
  data: SavedPromotion[]
}

const customerPromotionApi = {
  getMine() {
    return http.get<SavedPromotionsResponse>('/customer-promotions/mine')
  },

  save(promotionId: number) {
    return http.post(`/customer-promotions/${promotionId}`)
  }
}

export default customerPromotionApi