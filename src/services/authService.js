import { apiClient } from './apiClient'

export const authService = {
  /**
   * HU-SE-07: Registro tradicional de usuario mediante nombre, correo y contraseña
   * @param {string} name
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{id: number, name: string, email: string, active: boolean}>}
   */
  register: async (name, email, password) => {
    return apiClient.post('/auth/register', {
      name: name.trim(),
      email: email.trim(),
      password,
    })
  },

  /**
   * Paso 1: Enviar credenciales e iniciar el desafío 2FA
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{message: string, email: string}>}
   */
  login: async (email, password) => {
    return apiClient.post('/auth/login', {
      email: email.trim(),
      password,
    })
  },

  /**
   * Paso 2: Verificar el código 2FA de 6 dígitos recibido por correo
   * @param {string} email
   * @param {string} code
   * @returns {Promise<{accessToken: string, tokenType: string, expiresAt: string}>}
   */
  verify2Fa: async (email, code) => {
    const response = await apiClient.post('/auth/verify-2fa', {
      email: email.trim(),
      code: code.trim(),
    })

    if (response?.accessToken) {
      authService.setSession(response, email)
    }

    return response
  },

  /**
   * Inicio de sesión con Google OAuth 2.0 (no requiere 2FA)
   * @param {string} idToken - credential (JWT) emitido por Google
   * @param {string} email - correo de la cuenta de Google (opcional, para mostrar en la UI)
   * @returns {Promise<{accessToken: string, tokenType: string, expiresAt: string}>}
   */
  loginGoogle: async (idToken, email = '') => {
    const response = await apiClient.post('/auth/google', { idToken })

    if (response?.accessToken) {
      authService.setSession(response, email)
    }

    return response
  },

  /**
   * Cierre de sesión en el backend y limpieza de almacenamiento local
   */
  logout: async () => {
    try {
      await apiClient.post('/auth/logout')
    } catch (error) {
      // Si el servidor falla o ya expiró, continuamos con la limpieza local
      console.warn('Error al invalidar sesión en el servidor:', error)
    } finally {
      authService.clearSession()
    }
  },

  /**
   * Guarda los datos de sesión en localStorage
   */
  setSession: (authData, email = '') => {
    localStorage.setItem('accessToken', authData.accessToken)
    localStorage.removeItem('token')
    localStorage.setItem('tokenType', authData.tokenType || 'Bearer')
    localStorage.setItem('tokenExpiresAt', authData.expiresAt || '')
    if (email) {
      localStorage.setItem('userEmail', email)
    }
  },

  /**
   * Obtiene el token JWT actual
   */
  getToken: () => {
    return localStorage.getItem('accessToken')
  },

  /**
   * Obtiene el correo del usuario autenticado
   */
  getUserEmail: () => {
    return localStorage.getItem('userEmail') || ''
  },

  /**
   * Verifica si existe un token JWT estructuralmente válido y no expirado en almacenamiento
   */
  isAuthenticated: () => {
    const token = authService.getToken()
    if (!token || typeof token !== 'string') {
      return false
    }

    // Un JWT debe tener exactamente 3 segmentos no vacíos: header.payload.signature
    const parts = token.split('.')
    if (parts.length !== 3 || parts.some((part) => !part || !part.trim())) {
      authService.clearSession()
      return false
    }

    const expiresAt = localStorage.getItem('tokenExpiresAt')
    if (expiresAt) {
      const expirationTime = Date.parse(expiresAt)
      if (!Number.isNaN(expirationTime) && Date.now() >= expirationTime) {
        authService.clearSession()
        return false
      }
    }

    try {
      const headerBase64 = parts[0].replace(/-/g, '+').replace(/_/g, '/')
      const payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
      const header = JSON.parse(atob(headerBase64))
      const payload = JSON.parse(atob(payloadBase64))

      if (!header?.alg || !payload?.exp || Date.now() >= payload.exp * 1000) {
        authService.clearSession()
        return false
      }
    } catch {
      authService.clearSession()
      return false
    }

    return true
  },

  /**
   * Limpia todo rastro de la sesión local
   */
  clearSession: () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('token')
    localStorage.removeItem('tokenType')
    localStorage.removeItem('tokenExpiresAt')
    localStorage.removeItem('userEmail')
  },
}

export default authService
