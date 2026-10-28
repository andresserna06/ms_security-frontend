import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import 'core-js'

import App from './App'
import store from './store'

import 'bootstrap/dist/css/bootstrap.min.css'
import './scss/style.scss'

import { serviceContainer } from './services/serviceContainer'

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <App
      roleService={serviceContainer.roleService}
      permissionService={serviceContainer.permissionService}
    />
  </Provider>,
)
