import type { User } from '../types/auth.type'

const ACCESS_TOKEN = 'access_token'
const USER_PROFILE = 'user_profile'

export const getAccessTokenFromLS = () => {
  return localStorage.getItem(ACCESS_TOKEN) || ''
}

export const setAccessTokenToLS = (
  accessToken: string
) => {
  localStorage.setItem(
    ACCESS_TOKEN,
    accessToken
  )
}

export const getProfileFromLS = () => {
  const result =
    localStorage.getItem(USER_PROFILE)

  return result
    ? JSON.parse(result)
    : null
}

export const setProfileToLS = (
  profile: User
) => {
  localStorage.setItem(
    USER_PROFILE,
    JSON.stringify(profile)
  )
}

export const clearLS = () => {
  localStorage.removeItem(ACCESS_TOKEN)
  localStorage.removeItem(USER_PROFILE)
}