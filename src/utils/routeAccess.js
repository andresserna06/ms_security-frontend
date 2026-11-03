export function canAccessRoute(route, authService) {
  if (authService.isAdmin() || !route.permission) {
    return true
  }

  return authService.hasPermission(route.permission.method, route.permission.url)
}
