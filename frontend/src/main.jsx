import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { SignalRProvider } from './context/SignalRContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <SignalRProvider>
          <App />
        </SignalRProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)