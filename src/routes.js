import React from 'react'

// Dashboard
const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))

// Administración y Seguridad
const UsersPage = React.lazy(() => import('./views/users/UsersPage'))
const Roles = React.lazy(() => import('./views/roles/Roles'))

export const routes = [
  { path: '/', exact: true, name: 'Inicio' },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/users', name: 'Usuarios', element: UsersPage },
  { path: '/roles', name: 'Roles', element: Roles },
]

export default routes
