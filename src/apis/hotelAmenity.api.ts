import http from '../utils/axios.http'

export interface HotelAmenity {
  hotel_id: number
  amenity_id: number
}

const hotelAmenityApi = {
  getByHotelId(hotelId: number) {
    return http.get<{ success: boolean; data: HotelAmenity[] }>(`/hotelAmenities/hotel/${hotelId}`)
  },
  add(hotel_id: number, amenity_id: number) {
    return http.post('/hotelAmenities', { hotel_id, amenity_id })
  },
  remove(hotel_id: number, amenity_id: number) {
    return http.delete('/hotelAmenities', { data: { hotel_id, amenity_id } })
  }
}

export default hotelAmenityApi