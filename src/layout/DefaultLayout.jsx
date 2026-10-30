import React from 'react'
import { AppContent, AppSidebar, AppFooter, AppHeader } from '../components/index'

const DefaultLayout = ({ roleService, permissionService, userService, profileService }) => {
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
