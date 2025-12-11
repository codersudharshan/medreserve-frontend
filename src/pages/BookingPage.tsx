import { useState } from 'react'
import type { FormEvent } from 'react'
import { motion } from 'framer-motion'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { Calendar, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
import { bookAppointment } from '../api/medreserveApi'
import type { AppointmentSlot, Booking } from '../types'
import BookingTicket from '../components/BookingTicket'
import { useToast } from '../context/ToastContext'
import { useAppContext } from '../context/AppContext'

/**
 * BookingPage - Booking flow for a specific appointment slot
 * Route: /booking/:slotId
 * 
 * Features:
 * - Reads slotId from URL params
 * - Reads slot data from navigation state (if available)
 * - Form to collect patient name and email
 * - Submits booking request to API
 * - Displays booking confirmation or error status
 */
export default function BookingPage() {
  const { slotId } = useParams<{ slotId: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { doctors } = useAppContext()
  const slot = (location.state as { slot?: AppointmentSlot })?.slot
  const doctor = slot ? doctors.find((d) => d.id === slot.doctor_id) : undefined

  // Form state
  const [name, setName] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [booking, setBooking] = useState<Booking | null>(null)
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false)

  /**
   * Format time for display
   */
  const formatTime = (isoString: string): string => {
    const date = new Date(isoString)
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    // Validate slotId is present
    if (!slotId) {
      setError('Invalid slot ID. Please select a slot from the home page.')
      return
    }

    // Validate name is required
    if (!name.trim()) {
      setError('Name is required')
      return
    }

    // Disable form and show loading state
    setIsSubmitting(true)

    try {
      // Call booking API
      const result = await bookAppointment(Number(slotId), {
        name: name.trim(),
        email: email.trim() || undefined,
      })

      // On success, set booking and clear error
      setBooking(result)
      setError(null)
      setShowSuccessModal(true)
      showToast('Appointment booked successfully!', 'success')
    } catch (err) {
      // On failure, show error message
      const errorMessage = err instanceof Error ? err.message : 'Failed to book appointment'
      setError(errorMessage)
      setBooking(null)
      showToast(errorMessage, 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg p-6 mt-8 border border-slate-200"
    >
      {/* Header with Icon */}
      <div className="flex items-center gap-3 mb-2">
        {/* Header icon - dark mode classes removed */}
        <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center">
          <Calendar className="w-5 h-5 text-brand-600" aria-hidden="true" />
        </div>
        <div>
          {/* Page heading - dark mode classes removed */}
          <h1 className="text-2xl font-bold text-slate-800">Book Appointment</h1>
          <p className="text-slate-500 text-sm">
            {slot
              ? `Complete your booking for the selected time slot`
              : `Booking slot #${slotId}`}
          </p>
        </div>
      </div>

      {/* Show selected slot info if available */}
      {slot && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-brand-50 to-slate-50 border border-slate-200 rounded-xl p-4 mb-6"
        >
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-brand-600" aria-hidden="true" />
            <p className="text-sm font-medium text-slate-800">
              Selected Time Slot
            </p>
          </div>
          <p className="text-xl font-bold text-slate-900 mb-1">
            {formatTime(slot.start_time)}
          </p>
          <p className="text-sm text-slate-600">
            Duration: {slot.duration_minutes} minutes
          </p>
        </motion.div>
      )}

      {/* Booking form - only show if booking not yet confirmed */}
      {!booking && (
        <form onSubmit={handleSubmit}>
          {/* Name input */}
          <div className="mb-4">
            {/* Form labels - dark mode classes removed */}
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isSubmitting}
              className="w-full rounded-lg border border-slate-200 bg-white text-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-100 focus:border-brand-500 disabled:bg-slate-100 disabled:cursor-not-allowed transition-colors"
              placeholder="Enter your full name"
            />
          </div>

          {/* Email input - dark mode classes removed */}
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
              Email <span className="text-slate-400 text-xs">(optional)</span>
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              className="w-full rounded-lg border border-slate-200 bg-white text-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-100 focus:border-brand-500 disabled:bg-slate-100 disabled:cursor-not-allowed transition-colors"
              placeholder="Enter your email address"
            />
          </div>

          {/* Submit button */}
          <motion.button
            type="submit"
            disabled={isSubmitting}
            whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
            whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
            className="w-full mt-4 rounded-lg bg-brand-500 hover:bg-brand-600 text-white shadow-md px-4 py-2.5 text-sm font-medium disabled:bg-slate-400 disabled:cursor-not-allowed transition-all hover:shadow-lg"
          >
            {isSubmitting ? 'Booking...' : 'Confirm Booking'}
          </motion.button>
        </form>
      )}

      {/* Error message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 bg-red-50 border border-red-200 text-red-800 text-sm rounded-lg px-3 py-2"
        >
          {error}
        </motion.div>
      )}

      {/* Booking success ticket */}
      {showSuccessModal && booking && (
        <BookingTicket
          booking={booking}
          slot={slot}
          doctor={doctor}
          onClose={() => {
            setShowSuccessModal(false)
            navigate('/')
          }}
        />
      )}

      {/* Booking status card */}
      {booking && !showSuccessModal && (
        <div
          className={`mt-4 rounded-xl px-4 py-4 text-sm animate-fadeIn ${
            booking.status === 'CONFIRMED'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : booking.status === 'FAILED'
              ? 'bg-red-50 border border-red-200 text-red-800'
              : 'bg-yellow-50 border border-yellow-200 text-yellow-800'
          }`}
        >
          <div className="flex items-center gap-2 mb-3">
            {booking.status === 'CONFIRMED' && (
              <CheckCircle2 className="w-5 h-5 text-green-600" aria-hidden="true" />
            )}
            {booking.status === 'FAILED' && (
              <XCircle className="w-5 h-5 text-red-600" aria-hidden="true" />
            )}
            {booking.status === 'PENDING' && (
              <AlertCircle className="w-5 h-5 text-yellow-600" aria-hidden="true" />
            )}
            <p className="font-semibold text-base">
              {booking.status === 'CONFIRMED'
                ? 'Booking Confirmed'
                : booking.status === 'FAILED'
                ? 'Booking Failed'
                : 'Booking Pending'}
            </p>
          </div>
          <div className="space-y-1">
            <p>
              <span className="font-medium">Booking ID:</span> #{booking.id}
            </p>
            <p>
              <span className="font-medium">Status:</span>{' '}
              <span
                className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                  booking.status === 'CONFIRMED'
                    ? 'bg-green-200 text-green-900'
                    : booking.status === 'FAILED'
                    ? 'bg-red-200 text-red-900'
                    : 'bg-yellow-200 text-yellow-900'
                }`}
              >
                {booking.status}
              </span>
            </p>
            {booking.patient_name && (
              <p>
                <span className="font-medium">Patient:</span> {booking.patient_name}
              </p>
            )}
            {booking.patient_email && (
              <p>
                <span className="font-medium">Email:</span> {booking.patient_email}
              </p>
            )}
          </div>
        </div>
      )}
    </motion.div>
  )
}
