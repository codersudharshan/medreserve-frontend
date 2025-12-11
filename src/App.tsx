import { Routes, Route, Link } from 'react-router-dom'
import { Stethoscope, Home, Settings } from 'lucide-react'
import UserHome from './pages/UserHome'
import BookingPage from './pages/BookingPage'
import AdminDashboard from './pages/AdminDashboard'

/**
 * Main App component with layout structure
 * - Full-page background with medical gradient (light theme only)
 * - Modern navbar with glass effect and icons
 * - Main content area with centered max-width container
 * - Routes for rendering page components
 */
function App() {
  return (
    <div className="min-h-screen bg-med-bg">
      {/* Top Navigation Bar with Glass Effect - dark mode classes removed */}
      <nav className="bg-white/60 backdrop-blur-sm shadow-sm border-b border-slate-200/50 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* App Branding with Icon - dark mode classes removed */}
            <Link 
              to="/" 
              className="flex items-center gap-2 text-2xl font-bold text-slate-800 hover:text-brand-600 transition-colors"
            >
              <Stethoscope className="w-6 h-6 text-brand-500" aria-hidden="true" />
              <span>MedReserve</span>
            </Link>
            
            {/* Navigation Links - dark mode toggle removed, dark mode classes removed */}
            <div className="flex items-center gap-2">
              <Link
                to="/"
                className="flex items-center gap-1.5 text-slate-600 hover:text-brand-600 font-medium transition-colors px-3 py-1.5 rounded-lg hover:bg-white/50"
              >
                <Home className="w-4 h-4" aria-hidden="true" />
                <span className="hidden sm:inline">Home</span>
              </Link>
              <Link
                to="/admin"
                className="flex items-center gap-1.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 text-sm font-medium shadow-md transition-all hover:shadow-lg"
              >
                <Settings className="w-4 h-4" aria-hidden="true" />
                <span className="hidden sm:inline">Admin</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area with Routes */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={<UserHome />} />
          <Route path="/booking/:slotId" element={<BookingPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
