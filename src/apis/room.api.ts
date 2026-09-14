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

export interface CreateRoomTypePayload {
  hotel_id: number
  name: string
  capacity: number
  total_rooms: number
  base_price: number
  description?: string
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
  },

  getById(id: number) {
    return http.get<ApiResponse<RoomType>>(`/roomTypes/${id}`)
  },

  create(body: CreateRoomTypePayload) {
    return http.post<ApiResponse<RoomType>>('/roomTypes', body)
  },
  update(id: number, body: Omit<CreateRoomTypePayload, 'hotel_id'>) {
    return http.put<ApiResponse<RoomType>>(`/roomTypes/${id}`, body)
  },
  delete(id: number) {
    return http.delete<{ success: boolean }>(`/roomTypes/${id}`)
  },
  getAvailability(id: number, checkIn: string, checkOut: string) {
    return http.get<{ success: boolean; data: { total_rooms: number; booked: number; available: number } }>(
        `/roomTypes/${id}/availability`,
        { params: { checkIn, checkOut } }
    )
  },
  
}




export default roomApi