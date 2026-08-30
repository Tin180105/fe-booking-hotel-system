export interface HotelOverview {
  hotelId: number
  hotelName: string
  city: string
  address: string
  phone: string | null
  starRating: number
  status: string
  commissionRate: number
  totalRoomTypes: number
  totalAmenities: number
}

export interface HotelOverviewResponse {
  hotels: HotelOverview[]
}

export interface Hotel {
  id: number
  name: string
  city: string
  address: string
  phone: string | null
  description: string | null
  commissionRate: number
  starRating: number
  status: string
  createdAt: string
}

export interface CreateHotelRequest {
  name: string
  city: string
  address: string
  phone?: string
  description?: string
  commissionRate?: number
  starRating?: number
}

export interface UpdateHotelRequest {
  name?: string
  city?: string
  address?: string
  phone?: string
  description?: string
  commissionRate?: number
  starRating?: number
}

export interface HotelDetailResponse {
  hotel: Hotel
}

export interface HotelMutationResponse {
  message: string
  hotel: Hotel
}

export interface DeleteHotelResponse {
  message: string
}