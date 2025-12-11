    import { useState, useMemo, useEffect } from 'react'
    import { useNavigate } from 'react-router-dom'
    import { motion } from 'framer-motion'
    import { Search, Stethoscope, Calendar, Clock, ArrowRight, Filter } from 'lucide-react'
    import { useAppContext } from '../context/AppContext'
    import { getDoctorSlots } from '../api/medreserveApi'
    import type { AppointmentSlot } from '../types'
    import DoctorList from '../components/DoctorList'
    import SlotList from '../components/SlotList'
    import { DoctorListSkeleton, SlotListSkeleton } from '../components/LoadingSkeleton'
    import { checkHeroContrast } from '../utils/contrastCheck'

    /**
     * UserHome - Patient view for browsing doctors and available appointment slots
     * Route: /
     * 
     * Features:
     * - Displays list of doctors
     * - Allows selection of a doctor to view their available slots
     * - Shows available slots in a grid layout
     * - Handles booking navigation
     */
    export default function UserHome() {
    const { doctors, loadingDoctors, errorDoctors } = useAppContext()
    const [selectedDoctorId, setSelectedDoctorId] = useState<number | undefined>()
    const [slots, setSlots] = useState<AppointmentSlot[]>([])
    const [loadingSlots, setLoadingSlots] = useState<boolean>(false)
    const [searchQuery, setSearchQuery] = useState<string>('')
    const [selectedSpecialization, setSelectedSpecialization] = useState<string>('')
    const navigate = useNavigate()

    // Get unique specializations for filter dropdown
    const specializations = useMemo(() => {
      const specs = doctors
        .map((d) => d.specialization)
        .filter((s): s is string => Boolean(s))
      return Array.from(new Set(specs)).sort()
    }, [doctors])

    // Filter doctors based on search query and specialization
    const filteredDoctors = useMemo(() => {
      let filtered = doctors

      // Filter by search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        filtered = filtered.filter(
          (doctor) =>
            doctor.name.toLowerCase().includes(query) ||
            doctor.specialization?.toLowerCase().includes(query)
        )
      }

      // Filter by specialization
      if (selectedSpecialization) {
        filtered = filtered.filter(
          (doctor) => doctor.specialization === selectedSpecialization
        )
      }

      return filtered
    }, [doctors, searchQuery, selectedSpecialization])

    /**
     * Handle doctor selection and fetch their available slots
     * Calls getDoctorSlots API and updates state accordingly
     */
    const handleSelectDoctor = async (doctorId: number) => {
        setSelectedDoctorId(doctorId)
        setLoadingSlots(true)
        setSlots([]) // Clear previous slots
        
        try {
        const availableSlots = await getDoctorSlots(doctorId)
        setSlots(availableSlots)
        } catch (error) {
        console.error('Error fetching slots:', error)
        setSlots([])
        } finally {
        setLoadingSlots(false)
        }
    }

    /**
     * Handle booking a slot - navigate to booking page with slot ID and slot data
     */
    const handleBookSlot = (slot: AppointmentSlot) => {
        navigate(`/booking/${slot.id}`, { state: { slot } })
    }

    /**
     * Handle "Book Now" CTA click - scrolls smoothly to the booking area
     */
    const handleBookNowClick = () => {
        const bookingArea = document.getElementById('booking-area')
        if (bookingArea) {
            bookingArea.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
    }

    // Check hero contrast on mount - dark mode removed, only check once
    useEffect(() => {
        checkHeroContrast()
    }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Hero Section with accessible overlay for contrast */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="hero-card rounded-2xl shadow-lg p-8 md:p-10 mb-8 border border-slate-100 relative"
      >
        {/* Content wrapper with z-index above overlay */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          {/* Left side: Icon, Title, Subtitle, Feature Pills */}
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-6">
              {/* Icon container - dark mode classes removed */}
              <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-md flex-shrink-0 border border-slate-200">
                <Stethoscope className="w-7 h-7 text-brand-600" aria-hidden="true" />
              </div>
              <div>
                {/* Main heading - dark mode classes removed, using light theme colors */}
                <h1 className="text-3xl md:text-4xl font-extrabold mb-2 text-slate-900">
                  Book Your Appointment
                </h1>
                {/* Subtext - dark mode classes removed */}
                <p className="text-slate-600 text-base">
                  Find the right doctor and schedule your visit
                </p>
              </div>
            </div>
            
            {/* Feature Pills */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Feature pills - dark mode classes removed */}
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                className="flex items-center gap-3 bg-white rounded-xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-brand-600" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Easy Booking</p>
                  <p className="text-xs text-slate-600">Quick & Simple</p>
                </div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                className="flex items-center gap-3 bg-white rounded-xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-brand-600" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Flexible Times</p>
                  <p className="text-xs text-slate-600">Choose Your Slot</p>
                </div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                className="flex items-center gap-3 bg-white rounded-xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center flex-shrink-0">
                  <Stethoscope className="w-5 h-5 text-brand-600" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Expert Doctors</p>
                  <p className="text-xs text-slate-600">Trusted Care</p>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Right side: CTA Button (Desktop only) */}
          <div className="hidden md:flex items-center">
            <button
              onClick={handleBookNowClick}
              aria-label="Book now - scroll to booking area"
              className="bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-xl shadow-md focus:ring-2 focus:ring-brand-100 focus:outline-none transition-all hover:shadow-lg active:scale-95 flex items-center gap-2 font-semibold"
            >
              Book Now
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Search and Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6 space-y-3"
      >
        <div className="relative">
          {/* Search bar - dark mode classes removed */}
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search doctors by name or specialization..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-100 focus:border-brand-500 transition-colors"
          />
        </div>
        {specializations.length > 0 && (
          <div className="relative">
            {/* Filter dropdown - dark mode classes removed */}
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <select
              value={selectedSpecialization}
              onChange={(e) => setSelectedSpecialization(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-100 focus:border-brand-500 transition-colors appearance-none cursor-pointer"
            >
              <option value="">All Specializations</option>
              {specializations.map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>
          </div>
        )}
      </motion.div>

      {/* Error state for doctors */}
      {errorDoctors && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
        >
          <p className="text-red-800">Error: {errorDoctors}</p>
        </motion.div>
      )}

      {/* Main content grid layout */}
      {!errorDoctors && (
        <div id="booking-area" className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column: Doctor List (1 column) */}
          <div className="md:col-span-1">
            {loadingDoctors ? (
              <DoctorListSkeleton />
            ) : (
              <DoctorList
                doctors={filteredDoctors}
                selectedDoctorId={selectedDoctorId}
                onSelectDoctor={handleSelectDoctor}
                searchQuery={searchQuery}
              />
            )}
          </div>

          {/* Right column: Slot List (2 columns) */}
          <div className="md:col-span-2">
            {!selectedDoctorId ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 bg-white rounded-2xl shadow-sm border border-slate-200"
              >
                <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">
                  Select a doctor to view available appointment slots
                </p>
              </motion.div>
            ) : loadingSlots ? (
              <SlotListSkeleton />
            ) : (
              <SlotList slots={slots} onBook={handleBookSlot} />
            )}
          </div>
        </div>
      )}
    </motion.div>
  )
    }

