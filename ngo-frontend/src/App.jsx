import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

import HomePage from './pages/HomePage'
import ProgramsPage from './pages/ProgramsPage'
import ProgramDetailPage from './pages/ProgramDetailPage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import VolunteerDashboard from './pages/volunteer/VolunteerDashboard'
import NGODashboard from './pages/ngo/NGODashboard'
import NGOProgramsPage from './pages/ngo/NGOProgramsPage'
import CreateProgramPage from './pages/ngo/CreateProgramPage'
import NGOAnalyticsPage from './pages/ngo/NGOAnalyticsPage'
import NGOProfilePage from './pages/ngo/NGOProfilePage'
import { MyParticipationsPage, MyCertificatesPage } from './pages/volunteer/VolunteerPages'
import VolunteerProfilePage from './pages/volunteer/VolunteerProfilePage'
import ActivityPage from './pages/ActivityPage'
import JoinRequestsPage from './pages/ngo/JoinRequestsPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="grain-overlay" />
        <Routes>
          {/* Public */}
          <Route path="/" element={<HomePage />} />
          <Route path="/programs" element={<ProgramsPage />} />
          <Route path="/programs/:id" element={<ProgramDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Volunteer */}
          <Route path="/volunteer/dashboard" element={
            <ProtectedRoute roles={['volunteer']}><VolunteerDashboard /></ProtectedRoute>
          } />
          <Route path="/volunteer/participations" element={
            <ProtectedRoute roles={['volunteer']}><MyParticipationsPage /></ProtectedRoute>
          } />
          <Route path="/volunteer/certificates" element={
            <ProtectedRoute roles={['volunteer']}><MyCertificatesPage /></ProtectedRoute>
          } />
          <Route path="/volunteer/activity" element={
            <ProtectedRoute roles={['volunteer']}><ActivityPage /></ProtectedRoute>
          } />
          <Route path="/volunteer/profile" element={
            <ProtectedRoute roles={['volunteer']}><VolunteerProfilePage /></ProtectedRoute>
          } />

          {/* NGO */}
          <Route path="/ngo/requests" element={
            <ProtectedRoute roles={['ngo']}><JoinRequestsPage /></ProtectedRoute>
          } />
          <Route path="/ngo/dashboard" element={
            <ProtectedRoute roles={['ngo']}><NGODashboard /></ProtectedRoute>
          } />
          <Route path="/ngo/programs" element={
            <ProtectedRoute roles={['ngo']}><NGOProgramsPage /></ProtectedRoute>
          } />
          <Route path="/ngo/create-program" element={
            <ProtectedRoute roles={['ngo']}><CreateProgramPage /></ProtectedRoute>
          } />
          <Route path="/ngo/analytics" element={
            <ProtectedRoute roles={['ngo']}><NGOAnalyticsPage /></ProtectedRoute>
          } />
          <Route path="/ngo/activity" element={
            <ProtectedRoute roles={['ngo']}><ActivityPage /></ProtectedRoute>
          } />
          <Route path="/ngo/profile" element={
            <ProtectedRoute roles={['ngo']}><NGOProfilePage /></ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
