import http from '../utils/axios.http'

export interface SearchHotelParams {
  destination: string
  checkIn: string
  checkOut: string
  rooms: number
  adults: number
  children: number
}

export interface HotelSearchResult {
  hotel_id: number
  hotel_name: string
  city: string
  address: string
  description: string
  star_rating: number
  min_price: number
  image_url: string | null
}

interface SearchHotelResponse {
  success: boolean
  data?: HotelSearchResult[]
  hotels?: HotelSearchResult[]
  message?: string
}

const searchApi = {
  searchHotels: (params: SearchHotelParams) => {
    return http.get<SearchHotelResponse>(
      '/search/hotels',
      {
        params
      }
    )
  }
}

export default searchApi