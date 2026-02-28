import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import AdminLayout from '@/components/AdminLayout'

import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import Enquiries from '@/pages/Enquiries'
import { PackageList, PackageForm } from '@/pages/Packages'
import Gallery from '@/pages/Gallery'
import Testimonials from '@/pages/Testimonials'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          <Route element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/enquiries" element={<Enquiries />} />
            <Route path="/packages" element={<PackageList />} />
            <Route path="/packages/new" element={<PackageForm />} />
            <Route path="/packages/edit/:id" element={<PackageForm />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/testimonials" element={<Testimonials />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
