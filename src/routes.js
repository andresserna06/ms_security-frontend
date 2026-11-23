import React from 'react'

// Dashboard
const Dashboard = React.lazy(() => import('./views/dashboard/DashboardPage'))

// Administración y Seguridad
const UsersPage = React.lazy(() => import('./views/users/UsersPage'))
const Roles = React.lazy(() => import('./views/roles/Roles'))
const RolePermissions = React.lazy(() => import('./views/role-permissions/RolePermissions'))
const Permissions = React.lazy(() => import('./views/permissions/Permissions'))

// Gestión Deportiva
const PlayersPage = React.lazy(() => import('./views/players/PlayersPage'))
const PlayerSkillsPage = React.lazy(() => import('./views/player-skills/PlayerSkillsPage'))
const ContractsPage = React.lazy(() => import('./views/contracts/ContractsPage'))
const RegistrationsPage = React.lazy(() => import('./views/registrations/RegistrationsPage'))
const PhasesPage = React.lazy(() => import('./views/phases/PhasesPage'))
const MatchesPage = React.lazy(() => import('./views/matches/MatchesPage'))
const PlayerProfilePage = React.lazy(() => import('./views/player-profile/PlayerProfilePage'))

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
  {
    path: '/players',
    name: 'Jugadores',
    element: PlayersPage,
    permission: { method: 'GET', url: '/players' },
  },
  {
    path: '/player-skills',
    name: 'Habilidades de Jugadores',
    element: PlayerSkillsPage,
    permission: { method: 'GET', url: '/player-skills' },
  },
  {
    path: '/contracts',
    name: 'Contratos',
    element: ContractsPage,
    permission: { method: 'GET', url: '/contracts' },
  },
  {
    path: '/registrations',
    name: 'Inscripciones',
    element: RegistrationsPage,
    permission: { method: 'GET', url: '/tournaments' },
  },
  {
    path: '/finals',
    name: 'Fase final',
    element: PhasesPage,
    permission: { method: 'GET', url: '/finals' },
  },
  {
    path: '/matches',
    name: 'Partidos',
    element: MatchesPage,
    permission: { method: 'GET', url: '/matches' },
  },
  {
    path: '/player-profile',
    name: 'Perfil Deportivo',
    element: PlayerProfilePage,
  },
  {
    path: '/player-profile/:id',
    name: 'Perfil Deportivo',
    element: PlayerProfilePage,
  },
]

export default routes
