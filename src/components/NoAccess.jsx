import React, { Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { CContainer, CSpinner } from '@coreui/react'

// routes config
import { routes } from '../routes'
import authService from '../services/authService'
import NoAccess from './NoAccess'

const AppContent = ({ roleService, permissionService, userService, profileService }) => {
  return (
    <CContainer className="px-4" lg>
      <Suspense fallback={<CSpinner color="primary" />}>
        <Routes>
          {routes.map((route, idx) => {
            const RouteElement = route.element
            const allowed =
              !route.permission ||
              authService.hasPermission(route.permission.method, route.permission.url)
            return (
              route.element && (
                <Route
                  key={idx}
                  path={route.path}
                  exact={route.exact}
                  name={route.name}
                  element={
                    allowed ? (
                      <RouteElement
                        roleService={roleService}
                        permissionService={permissionService}
                        userService={userService}
                        profileService={profileService}
                      />
                    ) : (
                      <NoAccess />
                    )
                  }
                />
              )
            )
          })}
          <Route path="/" element={<Navigate to="dashboard" replace />} />
        </Routes>
      </Suspense>
    </CContainer>
  )
}

export default React.memo(AppContent)