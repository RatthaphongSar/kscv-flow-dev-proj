import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Preloader from './Preloader.jsx'

export default function Protected({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <Preloader />
  if (!user) return <Navigate to="/login" replace />
  return children
}
