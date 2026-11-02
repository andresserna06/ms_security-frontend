import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CAvatar,
  CBadge,
  CDropdown,
  CDropdownDivider,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react'
import {
  cilAccountLogout,
  cilSettings,
  cilUser,
} from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { serviceContainer } from 'src/services/serviceContainer'
import MyProfileModal from 'src/views/profile/MyProfileModal'

const AppHeaderDropdown = ({
  authService = serviceContainer.authService,
  profileService = serviceContainer.profileService,
  userService = serviceContainer.userService,
}) => {
  const navigate = useNavigate()
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser())
  const [showProfileModal, setShowProfileModal] = useState(false)

  useEffect(() => {
    const user = authService.getCurrentUser()
    setCurrentUser(user)

    if (user?.id) {
      profileService
        .getByUserId(user.id)
        .then((profile) => {
          if (profile?.photo) {
            localStorage.setItem('userAvatar', profile.photo)
            setCurrentUser((prev) => (prev ? { ...prev, avatar: profile.photo } : prev))
          }
        })
        .catch((err) => {
          console.warn('Error cargando avatar del perfil:', err)
        })
    }
  }, [authService, profileService])

  const handleLogout = async (e) => {
    e.preventDefault()
    await authService.logout()
    navigate('/login')
  }

  const getBadgeColor = (provider) => {
    const prov = (provider || 'LOCAL').toUpperCase()
    if (prov.includes('AZURE') || prov.includes('MICROSOFT')) return 'primary'
    if (prov.includes('GOOGLE')) return 'danger'
    return 'success'
  }

  const getProviderLabel = (provider) => {
    const prov = (provider || 'LOCAL').toUpperCase()
    if (prov.includes('AZURE') || prov.includes('MICROSOFT')) return 'Azure'
    if (prov.includes('GOOGLE')) return 'Google'
    if (prov.includes('GITHUB')) return 'GitHub'
    return 'Local'
  }

  return (
    <>
      <CDropdown variant="nav-item">
        <CDropdownToggle
          placement="bottom-end"
          className="py-0 pe-0 d-flex align-items-center gap-2 cursor-pointer border-0 bg-transparent"
          caret={false}
        >
          <div className="d-none d-md-flex flex-column text-end" style={{ lineHeight: 1.2 }}>
            <span className="fw-semibold text-body small">
              {currentUser?.name || 'Usuario'}
            </span>
            <span className="text-body-secondary" style={{ fontSize: '0.75rem' }}>
              {currentUser?.email || ''}
            </span>
          </div>
          <CAvatar
            src={currentUser?.avatar}
            size="md"
            status="success"
            className="border shadow-sm"
          />
        </CDropdownToggle>
        <CDropdownMenu className="pt-0 shadow" placement="bottom-end" style={{ minWidth: '240px' }}>
          <CDropdownHeader className="bg-body-secondary fw-semibold py-2">
            <div className="d-flex align-items-center justify-content-between mb-1">
              <span className="small text-uppercase text-body-secondary">Sesión Activa</span>
              <CBadge color={getBadgeColor(currentUser?.authProvider)}>
                {getProviderLabel(currentUser?.authProvider)}
              </CBadge>
            </div>
            <div className="text-body fw-bold text-truncate" style={{ maxWidth: '220px' }}>
              {currentUser?.name || 'Usuario'}
            </div>
            <div className="text-body-secondary small text-truncate" style={{ maxWidth: '220px' }}>
              {currentUser?.email || ''}
            </div>
          </CDropdownHeader>

          <CDropdownItem
            as="button"
            type="button"
            onClick={() => setShowProfileModal(true)}
            className="d-flex align-items-center py-2"
          >
            <CIcon icon={cilUser} className="me-2 text-primary" />
            <span>Mi Perfil</span>
          </CDropdownItem>

          <CDropdownDivider />

          <CDropdownItem
            as="button"
            type="button"
            onClick={handleLogout}
            className="d-flex align-items-center py-2 text-danger"
          >
            <CIcon icon={cilAccountLogout} className="me-2" />
            <span>Cerrar Sesión</span>
          </CDropdownItem>
        </CDropdownMenu>
      </CDropdown>

      <MyProfileModal
        visible={showProfileModal}
        currentUser={currentUser}
        profileService={profileService}
        userService={userService}
        onClose={() => setShowProfileModal(false)}
        onProfileUpdated={(newName) => {
          setCurrentUser(authService.getCurrentUser())
        }}
      />
    </>
  )
}

export default AppHeaderDropdown
