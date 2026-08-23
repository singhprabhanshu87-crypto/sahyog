import { apiClient } from '@/lib/api-client'

export async function getDashboard() {
  return apiClient.get('/analytics/dashboard')
}

export async function getDistricts() {
  return apiClient.get('/analytics/districts')
}
