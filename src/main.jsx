import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './lib/auth'
import Landing from './pages/Landing'
import Builder from './pages/Builder'
import Setup from './pages/Setup'
import Login from './pages/Login'
import './index.css'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  return children
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/setup" element={<Setup />} />
          <Route path="/builder" element={
            <ProtectedRoute>
              <Builder />
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
