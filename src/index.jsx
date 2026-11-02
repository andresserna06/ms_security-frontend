import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { GoogleOAuthProvider } from '@react-oauth/google'
import 'core-js'

import App from './App'
import store from './store'

import 'bootstrap/dist/css/bootstrap.min.css'
import './scss/style.scss'

import { serviceContainer } from './services/serviceContainer'

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider clientId={googleClientId}>
    <Provider store={store}>
      <App
        authService={serviceContainer.authService}
        googleOAuthProvider={serviceContainer.googleOAuthProvider}
        roleService={serviceContainer.roleService}
        permissionService={serviceContainer.permissionService}
        userService={serviceContainer.userService}
        profileService={serviceContainer.profileService}
      />
    </Provider>
  </GoogleOAuthProvider>,
)
