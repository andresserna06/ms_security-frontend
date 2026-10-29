import React from 'react'
import CIcon from '@coreui/icons-react'
import { CNavItem, CNavTitle } from '@coreui/react'
import { cilSpeedometer, cilUser, cilPeople, cilLockLocked } from '@coreui/icons'

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
  },
  {
    component: CNavItem,
    name: 'Roles',
    to: '/roles',
    icon: <CIcon icon={cilPeople} customClassName="nav-icon" />,
  },
    {
    component: CNavItem,
    name: 'Asignar Permisos',
    to: '/role-permissions',
    icon: <CIcon icon={cilLockLocked} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Permisos',
    to: '/permissions',
    icon: <CIcon icon={cilLockLocked} customClassName="nav-icon" />,
  },
]

export default _nav
