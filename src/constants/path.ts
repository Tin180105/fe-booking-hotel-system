const path = {
  // =========================
  // PUBLIC
  // =========================
  home: '/',
  login: '/login',
  register: '/register',

  // =========================
  // CUSTOMER
  // =========================
  profile: '/profile',
  changePassword: '/profile/change-password',

  hotels: '/hotels',
  hotelDetail: '/hotels/:id',

  rooms: '/rooms',
  roomDetail: '/rooms/:id',

  bookings: '/bookings',
  bookingDetail: '/bookings/:id',
  promotions: '/promotions',
  payment: '/payment',

  // =========================
  // ADMIN MANAGEMENT
  // =========================
  adminDashboard: '/admin/dashboard',

  adminUsers: '/admin/users',
  adminHotels: '/admin/hotels',
  adminBookings: '/admin/bookings',
  adminCustomers: '/admin/customers',
  // =========================
  // HOTEL MANAGEMENT
  // =========================
  hotelDashboard: '/hotel/dashboard',

  hotelManagement: '/hotel/management',
  hotelRooms: '/hotel/rooms',
  hotelBookings: '/hotel/bookings',
  hotelAmenities: '/hotel/amenities',
  search: '/search',

  // =========================
  // NOT FOUND
  // =========================
  notFound: '*'
}

export default path