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