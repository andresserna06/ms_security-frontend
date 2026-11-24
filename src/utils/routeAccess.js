const isSportsPermission = (permission) =>
  typeof permission?.url === 'string' &&
  permission.url.startsWith('/') &&
  !permission.url.startsWith('/api')

export function canAccessRoute(route, authService) {
  if (!route?.permission) {
    return true
  }

  if (authService.isAdmin() && !isSportsPermission(route.permission)) {
    return true
  }

  return authService.hasPermission(route.permission.method, route.permission.url)
}
