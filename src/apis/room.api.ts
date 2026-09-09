import http from '../utils/axios.http'

export interface RoomType {
  id: number
  hotel_id: number
  hotel_name: string
  name: string
  capacity: number
  total_rooms: number
  base_price: number
  description: string | null
  thumbnail_url: string | null
}

interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

const roomApi = {
  getAll() {
    return http.get<ApiResponse<RoomType[]>>('/roomTypes')
  },

  getByHotelId(hotelId: number) {
    return http.get<ApiResponse<RoomType[]>>(
      `/roomTypes/hotel/${hotelId}`
    )
  }
}

export default roomApi