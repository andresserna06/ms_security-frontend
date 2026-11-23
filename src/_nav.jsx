import React from 'react'
import CIcon from '@coreui/icons-react'
import { CNavItem, CNavTitle } from '@coreui/react'
import {
  cilSpeedometer,
  cilUser,
  cilPeople,
  cilLockLocked,
  cilStar,
  cilNotes,
  cilFindInPage,
  cilClipboard,
} from '@coreui/icons'
import authService from './services/authService'
import { canAccessRoute } from './utils/routeAccess'

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
    permission: { method: 'GET', url: '/api/role-permissions' },
  },
  {
    component: CNavItem,
    name: 'Permisos',
    to: '/permissions',
    icon: <CIcon icon={cilLockLocked} customClassName="nav-icon" />,
    permission: { method: 'GET', url: '/api/permissions' },
  },
  {
    component: CNavTitle,
    name: 'Gestión Deportiva',
  },
  {
    component: CNavItem,
    name: 'Jugadores',
    to: '/players',
    icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
    permission: { method: 'GET', url: '/players' },
  },
  {
    component: CNavItem,
    name: 'Habilidades de Jugadores',
    to: '/player-skills',
    icon: <CIcon icon={cilStar} customClassName="nav-icon" />,
    permission: { method: 'GET', url: '/player-skills' },
  },
  {
    component: CNavItem,
    name: 'Contratos',
    to: '/contracts',
    icon: <CIcon icon={cilNotes} customClassName="nav-icon" />,
    permission: { method: 'GET', url: '/contracts' },
  },
  {
    component: CNavItem,
    name: 'Inscripciones',
    to: '/registrations',
    icon: <CIcon icon={cilClipboard} customClassName="nav-icon" />,
    permission: { method: 'GET', url: '/tournaments' },
  },
  {
    component: CNavItem,
    name: 'Perfil Deportivo',
    to: '/player-profile',
    icon: <CIcon icon={cilFindInPage} customClassName="nav-icon" />,
  },
]

// Menú ya filtrado según los permisos del usuario (sin la propiedad "permission").
// Llámalo cuando se dibuje el menú, no al cargar el archivo, para que use el token actual.
export const getNav = () => {
  const visible = _nav.filter((item) => canAccessRoute(item, authService))

  // Si un título quedó sin ningún ítem debajo, también se quita.
  return visible
    .filter((item, index) => {
      if (item.component !== CNavTitle) return true
      const next = visible[index + 1]
      return Boolean(next) && next.component !== CNavTitle
    })
    .map(({ permission, ...item }) => item)
}

export default _nav
