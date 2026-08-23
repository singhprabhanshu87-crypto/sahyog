import { apiClient } from '@/lib/api-client'

export async function createSubmission(payload) {
  return apiClient.post('/submissions', payload)
}

export async function listSubmissions(params) {
  return apiClient.get('/submissions', { params })
}

export async function trackSubmission(trackingId) {
  return apiClient.get(`/submissions/track/${trackingId}`)
}
