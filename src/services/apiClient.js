const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8181/api'

const parseResponse = async (response) => {
  if (response.status === 204) {
    return null
  }

  const contentType = response.headers.get('content-type') || ''
  const isJson = contentType.includes('application/json')
  const data = isJson ? await response.json() : await response.text()

  if (!response.ok) {
    // Si el backend responde 401 en una ruta protegida (fuera de /auth/*),
    // limpiamos la sesión local y redirigimos a la vista de login
    const isAuthEndpoint = response.url && response.url.includes('/api/auth/')
    if (response.status === 401 && !isAuthEndpoint) {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('token')
      localStorage.removeItem('tokenType')
      localStorage.removeItem('tokenExpiresAt')
      localStorage.removeItem('userEmail')
      if (!window.location.hash.includes('/login')) {
        window.location.hash = '#/login'
      }
    }

    let errorMessage = 'Error al procesar la solicitud en el servidor'
    let fieldErrors = null

    if (data && typeof data === 'object') {
      if (data.message) {
        errorMessage = data.message
      } else {
        fieldErrors = data
        errorMessage = Object.values(data).join('. ')
      }
    } else if (typeof data === 'string' && data.trim()) {
      errorMessage = data
    }

    const error = new Error(errorMessage)
    error.status = response.status
    error.errorCase = data?.errorCase || null
    error.fieldErrors = fieldErrors
    throw error
  }

  return data
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export const apiClient = {
  get: async (endpoint) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        ...getAuthHeaders(),
      },
    })
    return parseResponse(response)
  },

  post: async (endpoint, body) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(body),
    })
    return parseResponse(response)
  },

  put: async (endpoint, body) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(body),
    })
    return parseResponse(response)
  },

  patch: async (endpoint, body = null) => {
    const options = {
      method: 'PATCH',
      headers: {
        Accept: 'application/json',
        ...getAuthHeaders(),
      },
    }
    if (body !== null) {
      options.headers['Content-Type'] = 'application/json'
      options.body = JSON.stringify(body)
    }
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options)
    return parseResponse(response)
  },

  delete: async (endpoint) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        ...getAuthHeaders(),
      },
    })
    return parseResponse(response)
  },
}

export default apiClient
