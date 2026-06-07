import { Routes, Route } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { FeedPage } from './pages/FeedPage'
import { EditorPage } from './pages/EditorPage'
import { PostPage } from './pages/PostPage'
import { DashboardPage } from './pages/DashboardPage'
import { ResetPasswordPage } from './pages/ResetPasswordPage'
import { UpdatePasswordPage } from './pages/UpdatePasswordPage'
import { ProfilePage } from './pages/ProfilePage'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/update-password" element={<UpdatePasswordPage />} />
      <Route path="/feed" element={<ProtectedRoute><FeedPage /></ProtectedRoute>} />
      <Route path="/write" element={<ProtectedRoute><EditorPage /></ProtectedRoute>} />
      <Route path="/post/:slug" element={<ProtectedRoute><PostPage /></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/profile/:username" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/" element={<ProtectedRoute><FeedPage /></ProtectedRoute>} />
    </Routes>
  )
}