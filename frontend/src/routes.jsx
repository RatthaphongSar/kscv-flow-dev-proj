import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Announcements from './pages/Announcements.jsx'
import Assignment from './pages/Assignment.jsx'
import GradesTranscript from './pages/GradesTranscript.jsx'
import Exam from './pages/Exam.jsx'
import Schedule from './pages/Schedule.jsx'
import Resources from './pages/Resources.jsx'
import AdvisorContact from './pages/AdvisorContact.jsx'
import RegisterServices from './pages/RegisterServices.jsx'
import ClubsActivities from './pages/ClubsActivities.jsx'
import Settings from './pages/Settings.jsx'
import Organization from './pages/Organization.jsx'
import ChatPage from './pages/Chat.jsx'            // ✅ ใช้ ChatPage ให้ตรงกับไฟล์
import Class from './pages/Class.jsx'
import Meeting from './pages/Meeting.jsx'
import Checkline from './pages/Checkline.jsx'
import Profile from './pages/Profile.jsx'
import Login from './pages/Login.jsx'
import Leaves from './pages/Leaves.jsx'
import Protected from './components/Protected.jsx'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/announcements" element={<Announcements />} />
      <Route path="/assignment" element={<Assignment />} />
      <Route path="/grades" element={<GradesTranscript />} />
      <Route path="/exam" element={<Exam />} />
      <Route path="/schedule" element={<Schedule />} />
      <Route path="/resources" element={<Resources />} />
      <Route path="/advisor" element={<AdvisorContact />} />
      <Route path="/register" element={<RegisterServices />} />
      <Route path="/clubs" element={<ClubsActivities />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/organization" element={<Organization />} />
      {/* ✅ เหลือ route เดียว และห่อด้วย Protected */}
      <Route path="/chat" element={<Protected><ChatPage /></Protected>} />
      <Route path="/class" element={<Class />} />
      <Route path="/meeting" element={<Meeting />} />
      <Route path="/checkline" element={<Checkline />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/leaves" element={<Leaves />} />
    </Routes>
  )
}
