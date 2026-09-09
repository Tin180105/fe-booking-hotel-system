import http from '../utils/axios.http'
import type { HotelOverviewResponse } from '../types/hotel.type'

export const URL_HOTELS = '/hotels'
export const URL_HOTEL_OVERVIEW = '/hotels/overview'

export const URL_HOTEL_HOME = '/hotels/best-combos'

const hotelApi = {
  getOverview() {
    return http.get<HotelOverviewResponse>(URL_HOTEL_OVERVIEW)
  }
}

export default hotelApi