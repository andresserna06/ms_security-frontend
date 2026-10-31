/**
 * DefaultLayout Component
 *
 * Main application layout wrapper that composes the primary UI structure
 * for authenticated/protected routes.
 *
 * Layout structure:
 * - AppSidebar: Collapsible navigation sidebar
 * - AppHeader: Top navigation bar with user menu and theme switcher
 * - AppContent: Main content area with route rendering
 * - AppFooter: Footer with links and copyright
 *
 * This layout is used for all routes defined in routes.js, providing
 * a consistent structure across the application.
 *
 * @component
 * @example
 * // Used in App.js for protected routes
 * <Route path="*" element={<DefaultLayout />} />
 */

import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { AppContent, AppSidebar, AppFooter, AppHeader } from '../components/index'
import { serviceContainer } from '../services/serviceContainer'

/**
 * DefaultLayout functional component
 *
 * Renders the main application layout with:
 * - Fixed sidebar navigation
 * - Sticky header
 * - Flexible content area
 * - Footer at bottom
 *
 * Uses flexbox for proper content stretching and footer positioning.
 *
 * @returns {React.ReactElement} Complete application layout
 */
const DefaultLayout = ({
  authService = serviceContainer.authService,
  roleService = serviceContainer.roleService,
  permissionService = serviceContainer.permissionService,
  userService = serviceContainer.userService,
  profileService = serviceContainer.profileService,
}) => {
  const location = useLocation()

  // TODO: Descomentar cuando los demás módulos (users, roles, permissions) envíen el token en sus servicios
  // if (!authService.isAuthenticated()) {
  //   return <Navigate to="/login" state={{ from: location }} replace />
  // }

  return (
    <div>
      <AppSidebar />
      <div className="wrapper d-flex flex-column min-vh-100">
        <AppHeader />
        <div className="body flex-grow-1">
          <AppContent
            roleService={roleService}
            permissionService={permissionService}
            userService={userService}
            profileService={profileService}
          />
        </div>
        <AppFooter />
      </div>
    </div>
  )
}

export default DefaultLayout
