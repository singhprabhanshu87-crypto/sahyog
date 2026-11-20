import { useAuthStore } from '@/store/auth.store'

const API_BASE = import.meta.env.VITE_API_URL ?? '/api'

const NON_REFRESHABLE_PATHS = ['/auth/refresh', '/auth/otp/request', '/auth/otp/verify']

class ApiError extends Error {
  constructor(message, status, data) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

let refreshPromise = null

async function parseBody(response) {
  const contentType = response.headers.get('content-type')
  return contentType?.includes('application/json')
    ? response.json()
    : response.text()
}

function getAuthToken() {
  return useAuthStore.getState().accessToken ?? null
}

async function refreshAccessToken() {
  const { refreshToken } = useAuthStore.getState()
  if (!refreshToken) {
    throw new ApiError('No active session', 401)
  }

  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const url = new URL(`${API_BASE}/auth/refresh`, window.location.origin).toString()
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        })
        const data = await parseBody(response)

        if (!response.ok) {
          throw new ApiError(data?.message ?? 'Session expired', response.status, data)
        }

        useAuthStore.setState((prev) => ({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken ?? prev.refreshToken,
          user: data.user ?? prev.user,
        }))

        return data.accessToken
      } finally {
        refreshPromise = null
      }
    })()
  }

  return refreshPromise
}

function handleSessionExpired() {
  useAuthStore.getState().logout()
  if (!window.location.pathname.startsWith('/login')) {
    window.location.assign('/login')
  }
}

async function request(path, options = {}) {
  const { method = 'GET', body, headers = {}, params } = options

  const url = new URL(`${API_BASE}${path}`, window.location.origin)
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value))
      }
    })
  }

  const send = async () => {
    const requestHeaders = {
      'Content-Type': 'application/json',
      ...headers,
    }

    const token = getAuthToken()
    if (token) {
      requestHeaders.Authorization = `Bearer ${token}`
    }

    return fetch(url.toString(), {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  let response = await send()

  const canRefresh =
    response.status === 401 &&
    !NON_REFRESHABLE_PATHS.some((p) => path.startsWith(p))

  if (canRefresh) {
    try {
      await refreshAccessToken()
      response = await send()
    } catch (err) {
      handleSessionExpired()
      throw err instanceof ApiError ? err : new ApiError('Session expired', 401)
    }
  }

  const data = await parseBody(response)

  if (!response.ok) {
    throw new ApiError(
      data?.message ?? `Request failed with status ${response.status}`,
      response.status,
      data,
    )
  }

  return data
}

export const apiClient = {
  get: (path, options) => request(path, { ...options, method: 'GET' }),
  post: (path, body, options) => request(path, { ...options, method: 'POST', body }),
  put: (path, body, options) => request(path, { ...options, method: 'PUT', body }),
  patch: (path, body, options) => request(path, { ...options, method: 'PATCH', body }),
  delete: (path, options) => request(path, { ...options, method: 'DELETE' }),
}

export { ApiError }
