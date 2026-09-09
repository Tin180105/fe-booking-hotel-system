import http from '../utils/axios.http'

export interface Amenity {
  id: number
  name: string
  icon_code: string | null
}

const amenityApi = {
  getAll() {
    return http.get<{ success: boolean; data: Amenity[] }>('/amenities')
  }
}

export default amenityApi