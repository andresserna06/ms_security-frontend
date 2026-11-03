import React from 'react'
import { useNavigate } from 'react-router-dom'
import { CButton, CContainer } from '@coreui/react'

const NoAccess = () => {
  const navigate = useNavigate()

  return (
    <CContainer className="px-4 py-5 text-center" lg>
      <h2>Acceso denegado</h2>
      <p className="text-body-secondary">
        Tu usuario no tiene permisos para consultar esta página.
      </p>
      <CButton color="primary" onClick={() => navigate('/dashboard')}>
        Volver al inicio
      </CButton>
    </CContainer>
  )
}

export default NoAccess
