import React from 'react'
import CIcon from '@coreui/icons-react'
import { CNavItem, CNavTitle } from '@coreui/react'
import { cilSpeedometer, cilUser, cilPeople, cilLockLocked } from '@coreui/icons'
import authService from './services/authService'

const _nav = [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: 'Administración y Seguridad',
  },
  {
    component: CNavItem,
    name: 'Usuarios',
    to: '/users',
    icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
    permission: { method: 'GET', url: '/api/users' },
  },
  {
    component: CNavItem,
    name: 'Roles',
    to: '/roles',
    icon: <CIcon icon={cilPeople} customClassName="nav-icon" />,
    permission: { method: 'GET', url: '/api/roles' },
  },
  {
    component: CNavItem,
    name: 'Asignar Permisos',
    to: '/role-permissions',
    icon: <CIcon icon={cilLockLocked} customClassName="nav-icon" />,
    adminOnly: true,
  },
  {
    component: CNavItem,
    name: 'Permisos',
    to: '/permissions',
    icon: <CIcon icon={cilLockLocked} customClassName="nav-icon" />,
    permission: { method: 'GET', url: '/api/permissions' },
    adminOnly: true,
  },
]

// Menú ya filtrado según los permisos del usuario (sin la propiedad "permission").
// Llámalo cuando se dibuje el menú, no al cargar el archivo, para que use el token actual.
export const getNav = () => {
  const visible = _nav.filter(
    (item) =>
      (!item.permission || authService.hasPermission(item.permission.method, item.permission.url)) &&
      (!item.adminOnly || authService.isAdmin()),
  )

  // Si un título quedó sin ningún ítem debajo, también se quita.
  return visible
    .filter((item, index) => {
      if (item.component !== CNavTitle) return true
      const next = visible[index + 1]
      return Boolean(next) && next.component !== CNavTitle
    })
    .map(({ permission, adminOnly, ...item }) => item)
}

export default _nav