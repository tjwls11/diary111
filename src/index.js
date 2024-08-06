import React from 'react'
import ReactDOM from 'react-dom/client'
import './style/index.css'
import './style/mypage.css'
import './style/login.css'
import './style/calendar.css'
import './style/navbar.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import './style/Footer.css'

import App from './App'
import { LoginProvider } from './context/LoginContext' // 수정된 부분

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    <LoginProvider>
      <App />
    </LoginProvider>
  </React.StrictMode>
)
