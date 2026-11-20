import { apiClient } from '@/lib/api-client'

export async function requestOtp(email) {
  return apiClient.post('/auth/otp/request', { email, purpose: 'login' })
}

export async function verifyOtp(email, code) {
  return apiClient.post('/auth/otp/verify', { email, code, purpose: 'login' })
}

export async function getMe() {
  return apiClient.get('/auth/me')
}

export async function logout(refreshToken) {
  return apiClient.post('/auth/logout', refreshToken ? { refreshToken } : {})
}
