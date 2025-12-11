import { useState, useMemo } from 'react'
import type { FormEvent } from 'react'
import { motion } from 'framer-motion'
import { UserPlus, CalendarPlus, User, Users, Calendar, TrendingUp, Activity } from 'lucide-react'
import { useAppContext } from '../context/AppContext'
import { createAdminDoctor, createAdminSlot } from '../api/medreserveApi'
import { useToast } from '../context/ToastContext'

/**
 * AdminDashboard - Admin-only view to create doctors & slots and view statistics
 * Route: /admin
 * 
 * Features:
 * - Create new doctors (name, specialization)
 * - Create new appointment slots for doctors
 * - Display list of existing doctors
 * - Form validation and success messages
 */
export default function AdminDashboard() {
  const { doctors, loadingDoctors, fetchDoctors } = useAppContext()
  const { showToast } = useToast()

  // Calculate analytics
  const analytics = useMemo(() => {
    const totalDoctors = doctors.length
    const totalSpecializations = new Set(doctors.map((d) => d.specialization).filter(Boolean)).size
    return {
      totalDoctors,
      totalSpecializations,
      recentDoctors: doctors.filter((d) => {
        if (!d.created_at) return false
        const created = new Date(d.created_at)
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        return created > weekAgo
      }).length,
    }
  }, [doctors])

  // Create Doctor form state
  const [doctorName, setDoctorName] = useState<string>('')
  const [doctorSpecialization, setDoctorSpecialization] = useState<string>('')
  const [isCreatingDoctor, setIsCreatingDoctor] = useState<boolean>(false)
  const [doctorError, setDoctorError] = useState<string | null>(null)
  const [doctorSuccess, setDoctorSuccess] = useState<string | null>(null)

  // Create Slot form state
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('')
  const [startTime, setStartTime] = useState<string>('')
  const [durationMinutes, setDurationMinutes] = useState<string>('')
  const [isCreatingSlot, setIsCreatingSlot] = useState<boolean>(false)
  const [slotError, setSlotError] = useState<string | null>(null)
  const [slotSuccess, setSlotSuccess] = useState<string | null>(null)

  /**
   * Handle Create Doctor form submission
   */
  const handleCreateDoctor = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setDoctorError(null)
    setDoctorSuccess(null)

    // Validate name is required
    if (!doctorName.trim()) {
      setDoctorError('Name is required')
      return
    }

    setIsCreatingDoctor(true)

    try {
      // Call admin API endpoint to create doctor
      await createAdminDoctor({
        name: doctorName.trim(),
        specialization: doctorSpecialization.trim() || undefined,
      })

      // Success - clear form and refresh doctors list
      setDoctorName('')
      setDoctorSpecialization('')
      setDoctorSuccess('Doctor created successfully!')
      showToast('Doctor created successfully!', 'success')
      
      // Refresh doctors list in context
      await fetchDoctors()
    } catch (error) {
      // Display API error message
      setDoctorError(
        error instanceof Error ? error.message : 'Failed to create doctor'
      )
      showToast(
        error instanceof Error ? error.message : 'Failed to create doctor',
        'error'
      )
    } finally {
      setIsCreatingDoctor(false)
    }
  }

  /**
   * Handle Create Slot form submission
   */
  const handleCreateSlot = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSlotError(null)
    setSlotSuccess(null)

    // Validate required fields
    if (!selectedDoctorId) {
      setSlotError('Please select a doctor')
      return
    }

    if (!startTime) {
      setSlotError('Start time is required')
      return
    }

    const duration = parseInt(durationMinutes)
    if (!durationMinutes || isNaN(duration) || duration <= 0) {
      setSlotError('Duration must be a positive number')
      return
    }

    setIsCreatingSlot(true)

    try {
      // Convert datetime-local to ISO string
      const isoStartTime = new Date(startTime).toISOString()

      // Call admin API endpoint with doctor_id in payload
      await createAdminSlot({
        doctor_id: parseInt(selectedDoctorId),
        start_time: isoStartTime,
        duration_minutes: duration,
      })

      // Success - clear form
      setStartTime('')
      setDurationMinutes('')
      setSlotSuccess('Slot created successfully!')
      showToast('Slot created successfully!', 'success')
    } catch (error) {
      // Display API error message
      setSlotError(
        error instanceof Error ? error.message : 'Failed to create slot'
      )
      showToast(
        error instanceof Error ? error.message : 'Failed to create slot',
        'error'
      )
    } finally {
      setIsCreatingSlot(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-6xl mx-auto"
    >
      <div className="mb-8">
        {/* Main heading - dark mode classes removed */}
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Admin Dashboard</h1>
        {/* Subtext - dark mode classes removed */}
        <p className="text-slate-500">Create doctors and appointment slots</p>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          whileHover={{ scale: 1.02, y: -4 }}
          className="bg-gradient-to-br from-[#e0eeff] to-[#c7dcff] rounded-xl shadow-md p-6 border border-white/20 hover:shadow-lg transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            {/* Icons - dark mode classes removed */}
            <Users className="w-8 h-8 text-brand-700" />
            <TrendingUp className="w-5 h-5 text-brand-600" />
          </div>
          {/* Stats number - dark mode classes removed */}
          <p className="text-3xl font-bold mb-1 text-slate-900">{analytics.totalDoctors}</p>
          {/* Stats label - dark mode classes removed */}
          <p className="text-slate-600 text-sm font-medium">Total Doctors</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02, y: -4 }}
          className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-md p-6 text-white border border-white/20 hover:shadow-lg transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            {/* Icons on colored cards - white is fine, but removed opacity for better visibility */}
            <Activity className="w-8 h-8" />
            <TrendingUp className="w-5 h-5" />
          </div>
          {/* Stats number - white text on colored background is accessible */}
          <p className="text-3xl font-bold mb-1">{analytics.totalSpecializations}</p>
          {/* Stats label - using white with slight opacity for hierarchy */}
          <p className="text-white text-sm">Specializations</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02, y: -4 }}
          className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-md p-6 text-white border border-white/20 hover:shadow-lg transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            {/* Icons on colored cards - white is fine, but removed opacity for better visibility */}
            <Calendar className="w-8 h-8" />
            <TrendingUp className="w-5 h-5" />
          </div>
          {/* Stats number - white text on colored background is accessible */}
          <p className="text-3xl font-bold mb-1">{analytics.recentDoctors}</p>
          {/* Stats label - using white for better contrast */}
          <p className="text-white text-sm">New This Week</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Create Doctor Form - dark mode classes removed */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
          <div className="flex items-center gap-2 mb-4">
            <UserPlus className="w-5 h-5 text-brand-500" aria-hidden="true" />
            <h2 className="text-xl font-bold text-slate-800">Create Doctor</h2>
          </div>
          
          <form onSubmit={handleCreateDoctor}>
            {/* Name input */}
            <div className="mb-4">
              {/* Form inputs - dark mode classes removed */}
              <label htmlFor="doctor-name" className="block text-sm font-medium text-slate-700 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="doctor-name"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                required
                disabled={isCreatingDoctor}
                className="w-full rounded-lg border border-slate-200 bg-white text-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-100 focus:border-brand-500 disabled:bg-slate-100 disabled:cursor-not-allowed transition-colors"
                placeholder="Enter doctor name"
              />
            </div>

            {/* Specialization input - dark mode classes removed */}
            <div className="mb-4">
              <label htmlFor="doctor-specialization" className="block text-sm font-medium text-slate-700 mb-1">
                Specialization <span className="text-slate-400 text-xs">(optional)</span>
              </label>
              <input
                type="text"
                id="doctor-specialization"
                value={doctorSpecialization}
                onChange={(e) => setDoctorSpecialization(e.target.value)}
                disabled={isCreatingDoctor}
                className="w-full rounded-lg border border-slate-200 bg-white text-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-100 focus:border-brand-500 disabled:bg-slate-100 disabled:cursor-not-allowed transition-colors"
                placeholder="Enter specialization"
              />
            </div>

            {/* Submit button */}
            <motion.button
              type="submit"
              disabled={isCreatingDoctor}
              whileHover={{ scale: isCreatingDoctor ? 1 : 1.02 }}
              whileTap={{ scale: isCreatingDoctor ? 1 : 0.98 }}
              className="w-full rounded-lg bg-brand-500 hover:bg-brand-600 text-white shadow-md px-4 py-2.5 text-sm font-medium disabled:bg-slate-400 disabled:cursor-not-allowed transition-all hover:shadow-lg"
            >
              {isCreatingDoctor ? 'Creating...' : 'Create Doctor'}
            </motion.button>

            {/* Error message */}
            {doctorError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 bg-red-50 border border-red-200 text-red-800 text-sm rounded-lg px-3 py-2"
              >
                {doctorError}
              </motion.div>
            )}

            {/* Success message - dark mode classes removed */}
            {doctorSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 bg-green-50 border border-green-200 text-green-800 text-sm rounded-lg px-3 py-2"
              >
                {doctorSuccess}
              </motion.div>
            )}
          </form>
        </div>

        {/* Create Slot Form - dark mode classes removed */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
          <div className="flex items-center gap-2 mb-4">
            <CalendarPlus className="w-5 h-5 text-brand-500" aria-hidden="true" />
            <h2 className="text-xl font-bold text-slate-800">Create Slot</h2>
          </div>
          
          <form onSubmit={handleCreateSlot}>
            {/* Doctor dropdown */}
            <div className="mb-4">
              {/* Form inputs - dark mode classes removed */}
              <label htmlFor="slot-doctor" className="block text-sm font-medium text-slate-700 mb-1">
                Doctor <span className="text-red-500">*</span>
              </label>
              <select
                id="slot-doctor"
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
                required
                disabled={isCreatingSlot || loadingDoctors || doctors.length === 0}
                className="w-full rounded-lg border border-slate-200 bg-white text-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-100 focus:border-brand-500 disabled:bg-slate-100 disabled:cursor-not-allowed transition-colors appearance-none cursor-pointer"
              >
                <option value="">Select a doctor</option>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name} {doctor.specialization ? `- ${doctor.specialization}` : ''}
                  </option>
                ))}
              </select>
              {doctors.length === 0 && !loadingDoctors && (
                <p className="text-xs text-slate-500 mt-1">No doctors available. Create a doctor first.</p>
              )}
            </div>

            {/* Start time input - dark mode classes removed */}
            <div className="mb-4">
              <label htmlFor="slot-start-time" className="block text-sm font-medium text-slate-700 mb-1">
                Start Time <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                id="slot-start-time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                disabled={isCreatingSlot}
                className="w-full rounded-lg border border-slate-200 bg-white text-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-100 focus:border-brand-500 disabled:bg-slate-100 disabled:cursor-not-allowed transition-colors"
              />
            </div>

            {/* Duration input - dark mode classes removed */}
            <div className="mb-4">
              <label htmlFor="slot-duration" className="block text-sm font-medium text-slate-700 mb-1">
                Duration (minutes) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="slot-duration"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                required
                min="1"
                disabled={isCreatingSlot}
                className="w-full rounded-lg border border-slate-200 bg-white text-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-100 focus:border-brand-500 disabled:bg-slate-100 disabled:cursor-not-allowed transition-colors"
                placeholder="e.g., 30"
              />
            </div>

            {/* Submit button */}
            <motion.button
              type="submit"
              disabled={isCreatingSlot || doctors.length === 0}
              whileHover={{ scale: isCreatingSlot || doctors.length === 0 ? 1 : 1.02 }}
              whileTap={{ scale: isCreatingSlot || doctors.length === 0 ? 1 : 0.98 }}
              className="w-full rounded-lg bg-brand-500 hover:bg-brand-600 text-white shadow-md px-4 py-2.5 text-sm font-medium disabled:bg-slate-400 disabled:cursor-not-allowed transition-all hover:shadow-lg"
            >
              {isCreatingSlot ? 'Creating...' : 'Create Slot'}
            </motion.button>

            {/* Error message - dark mode classes removed */}
            {slotError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 bg-red-50 border border-red-200 text-red-800 text-sm rounded-lg px-3 py-2"
              >
                {slotError}
              </motion.div>
            )}

            {/* Success message - dark mode classes removed */}
            {slotSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 bg-green-50 border border-green-200 text-green-800 text-sm rounded-lg px-3 py-2"
              >
                {slotSuccess}
              </motion.div>
            )}
          </form>
        </div>
      </div>

      {/* Doctors List - dark mode classes removed */}
      <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-brand-500" aria-hidden="true" />
          <h2 className="text-xl font-bold text-slate-800">Existing Doctors</h2>
        </div>
        
        {loadingDoctors ? (
          <p className="text-slate-500 text-center py-8">Loading doctors...</p>
        ) : doctors.length === 0 ? (
          <p className="text-slate-500 text-center py-8">No doctors yet. Create one above.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {doctors.map((doctor) => (
              <motion.div
                key={doctor.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02, y: -2 }}
                className="bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-brand-600" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-1">
                      {doctor.name}
                    </h3>
                    {doctor.specialization && (
                      <span className="inline-block bg-brand-100 text-brand-600 px-2 py-0.5 rounded-md text-xs font-medium">
                        {doctor.specialization}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}
