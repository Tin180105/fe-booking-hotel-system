import http from '../utils/axios.http'

export interface Amenity {
  id: number
  name: string
  icon_code: string | null
}

const amenityApi = {
  getAll() {
    return http.get<{ success: boolean; data: Amenity[] }>('/amenities')
  },
  create(body: { name: string; icon_code?: string }) {
    return http.post<{ success: boolean; data: Amenity }>('/amenities', body)
  },
  update(id: number, body: { name: string; icon_code?: string }) {
    return http.put<{ success: boolean; data: Amenity }>(`/amenities/${id}`, body)
  },
  delete(id: number) {
    return http.delete<{ success: boolean }>(`/amenities/${id}`)
  }
}

export default amenityApi