import axios from 'axios'
import { getAccessTokenFromLS, clearLS } from './auth'

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
})

// Tự động gắn Access Token vào mọi request
http.interceptors.request.use((config) => {
  const accessToken = getAccessTokenFromLS()

  if (accessToken) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${accessToken}`
  }

  return config
})

// (Khuyến nghị) Xử lý khi access token hết hạn -> 401
http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token hết hạn / không hợp lệ
      clearLS()
      // Có thể điều hướng về /login tại đây nếu cần
      // window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default http