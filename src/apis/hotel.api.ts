import http from '../utils/axios.http'
import type {
  HotelOverviewResponse,
  HotelDetailResponse,
  HotelMutationResponse,
  DeleteHotelResponse,
  CreateHotelRequest,
  UpdateHotelRequest,
  HotelHomeResponse
} from '../types/hotel.type'

export const URL_HOTELS = '/hotels'
export const URL_HOTEL_OVERVIEW = '/hotels/overview'

const hotelApi = {
  getOverview() {
    return http.get<HotelOverviewResponse>(URL_HOTEL_OVERVIEW)
  },

  getHotelsForHome() {
    return http.get<HotelHomeResponse>(`${URL_HOTELS}/best-combos`)
  },

  getById(id: number) {
    return http.get<HotelDetailResponse>(`${URL_HOTELS}/${id}`)
  },

  create(body: CreateHotelRequest) {
    return http.post<HotelMutationResponse>(URL_HOTELS, body)
  },

  update(id: number, body: UpdateHotelRequest) {
    return http.put<HotelMutationResponse>(`${URL_HOTELS}/${id}`, body)
  },

  updateStatus(id: number, status: string) {
    return http.patch<HotelMutationResponse>(`${URL_HOTELS}/${id}/status`, { status })
  },

  delete(id: number) {
    return http.delete<DeleteHotelResponse>(`${URL_HOTELS}/${id}`)
  }
}

export default hotelApi