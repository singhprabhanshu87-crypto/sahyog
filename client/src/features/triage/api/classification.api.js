import { apiClient } from '@/lib/api-client'

export async function getReviewQueue(params) {
  return apiClient.get('/classification/review-queue', { params })
}

export async function overrideClassification(id, payload) {
  return apiClient.post(`/classification/${id}/override`, payload)
}
