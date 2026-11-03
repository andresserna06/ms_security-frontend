import React from 'react'

// Dashboard
const Dashboard = React.lazy(() => import('./views/dashboard/DashboardPage'))

// Administración y Seguridad
const UsersPage = React.lazy(() => import('./views/users/UsersPage'))
const Roles = React.lazy(() => import('./views/roles/Roles'))
const RolePermissions = React.lazy(() => import('./views/role-permissions/RolePermissions'))
const Permissions = React.lazy(() => import('./views/permissions/Permissions'))

export const routes = [
  { path: '/', exact: true, name: 'Inicio' },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  {
    path: '/users',
    name: 'Usuarios',
    element: UsersPage,
    permission: { method: 'GET', url: '/api/users' },
  },
  {
    path: '/roles',
    name: 'Roles',
    element: Roles,
    permission: { method: 'GET', url: '/api/roles' },
  },
  {
    path: '/role-permissions',
    name: 'Asignar Permisos',
    element: RolePermissions,
    permission: { method: 'GET', url: '/api/role-permissions' },
  },
  {
    path: '/permissions',
    name: 'Permisos',
    element: Permissions,
    permission: { method: 'GET', url: '/api/permissions' },
  },
]

export default routes
