import { apiClient } from '@/lib/api-client'

export async function listChallenges(params) {
  return apiClient.get('/challenges', { params })
}

export async function getChallenge(id) {
  return apiClient.get(`/challenges/${id}`)
}
