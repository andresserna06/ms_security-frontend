import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  CAlert,
  CButton,
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CFormLabel,
  CInputGroup,
  CInputGroupText,
  CRow,
  CSpinner,
  CTooltip,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { eye } from 'src/assets/icons/eye'
import { authService } from 'src/services/authService'
import jpaSports from '../../../assets/images/JPASports.jpg'

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])\S{8,72}$/

const Register = () => {
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccessMessage('')

    const cleanName = name.trim()
    const cleanEmail = email.trim()

    if (!cleanName || !cleanEmail || !password) {
      setError('Todos los campos son obligatorios.')
      return
    }

    if (cleanName.length < 2 || cleanName.length > 100) {
      setError('El nombre debe tener entre 2 y 100 caracteres.')
      return
    }

    if (!PASSWORD_REGEX.test(password)) {
      setError(
        'La contraseña debe tener entre 8 y 72 caracteres, al menos una mayúscula, una minúscula, un número y un carácter especial (@$!%*?&), sin espacios.',
      )
      return
    }

    try {
      setLoading(true)
      await authService.register(cleanName, cleanEmail, password)
      setSuccessMessage('Cuenta creada exitosamente. Redirigiendo al inicio de sesión...')
      setTimeout(() => {
        navigate('/login')
      }, 1500)
    } catch (err) {
      setError(err?.message || 'No fue posible registrar la cuenta. Verifica los datos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white position-relative overflow-hidden min-vh-100 d-flex flex-row align-items-center py-4">
      <div
        aria-hidden="true"
        className="d-none d-md-block position-absolute top-0 bottom-0 start-0"
        style={{
          width: '74%',
          pointerEvents: 'none',
          background:
            'linear-gradient(to right, #70B038 0%, #cbe5b3 30%, #eff8e8 60%, #ffffff 100%)',
          zIndex: 0,
        }}
      />
      <CContainer className="position-relative" style={{ zIndex: 1 }}>
        <CRow className="justify-content-center">
          <CCol md={8} lg={6} xl={5}>
            <div className="d-flex flex-column gap-4">
              <div className="text-center">
                <img src={jpaSports} alt="JPA Sports" width="96" height="96" className="rounded-circle" />
              </div>

              <CCard className="p-4 shadow-sm border-0">
                <CCardBody className="d-flex flex-column gap-3">
                  <h2 className="h5 text-center mb-0 fw-bold">Crear cuenta nueva</h2>
                  <p className="text-body-secondary text-center small mb-2">
                    Regístrate con tus datos y una contraseña segura para acceder a la plataforma
                  </p>

                  {error && (
                    <CAlert color="danger" dismissible onClose={() => setError('')}>
                      {error}
                    </CAlert>
                  )}

                  {successMessage && <CAlert color="success">{successMessage}</CAlert>}

                  <CForm className="row gy-3 text-start" onSubmit={handleSubmit}>
                    <CCol xs={12}>
                      <CFormLabel htmlFor="name">Nombre completo</CFormLabel>
                      <CFormInput
                        id="name"
                        placeholder="Tu nombre"
                        autoComplete="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        disabled={loading}
                      />
                    </CCol>

                    <CCol xs={12}>
                      <CFormLabel htmlFor="email">Correo electrónico</CFormLabel>
                      <CFormInput
                        id="email"
                        type="email"
                        placeholder="tu@correo.com"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading}
                      />
                    </CCol>

                    <CCol xs={12}>
                      <CFormLabel htmlFor="password">Contraseña</CFormLabel>
                      <CInputGroup>
                        <CFormInput
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Tu contraseña"
                          autoComplete="new-password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          disabled={loading}
                        />
                        <CInputGroupText>
                          <CTooltip
                            content={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                          >
                            <CButton
                              type="button"
                              color="link"
                              className="p-0 link-secondary"
                              aria-label="Toggle password"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              <CIcon icon={eye} size="sm" />
                            </CButton>
                          </CTooltip>
                        </CInputGroupText>
                      </CInputGroup>
                      <div className="text-body-secondary small mt-1">
                        Mínimo 8 caracteres, incluyendo mayúscula, minúscula, número y carácter
                        especial (<code>@$!%*?&amp;</code>).
                      </div>
                    </CCol>

                    <CCol xs={12} className="pt-2">
                      <CButton
                        type="submit"
                        className="w-100 text-white fw-semibold py-2"
                        style={{ backgroundColor: '#70B038', borderColor: '#70B038' }}
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <CSpinner size="sm" className="me-2" />
                            Registrando cuenta...
                          </>
                        ) : (
                          'Crear cuenta'
                        )}
                      </CButton>
                    </CCol>
                  </CForm>
                </CCardBody>
              </CCard>

              <div className="text-center text-body-secondary">
                ¿Ya tienes una cuenta?{' '}
                <Link to="/authentication/login" style={{ color: '#70B038' }}>
                  Inicia sesión
                </Link>
              </div>
            </div>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Register
