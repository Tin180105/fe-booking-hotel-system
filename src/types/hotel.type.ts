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

export interface HotelHome {
  id: number
  name: string
  city: string
  address: string
  description: string | null
  starRating: number
  status: string
  imageUrl: string | null
}

export interface HotelHomeResponse {
  hotels: HotelHome[]
}