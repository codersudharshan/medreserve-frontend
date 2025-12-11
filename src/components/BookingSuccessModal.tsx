import { CheckCircle2, Calendar, Clock, X } from 'lucide-react'
import type { Booking, AppointmentSlot } from '../types'

interface BookingSuccessModalProps {
  booking: Booking
  slot?: AppointmentSlot
  onClose: () => void
}

/**
 * BookingSuccessModal - Animated success modal after booking confirmation
 */
export default function BookingSuccessModal({
  booking,
  slot,
  onClose,
}: BookingSuccessModalProps) {
  const formatTime = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fadeIn transform scale-100">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Success icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
        </div>

        {/* Success message */}
        <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">
          Booking Confirmed!
        </h2>
        <p className="text-center text-slate-600 mb-6">
          Your appointment has been successfully booked
        </p>

        {/* Booking details */}
        <div className="bg-gradient-to-r from-brand-50 to-slate-50 rounded-xl p-4 mb-4 space-y-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-brand-600" />
            <span className="text-sm font-medium text-slate-700">Booking ID:</span>
            <span className="text-sm text-slate-900 font-semibold">#{booking.id}</span>
          </div>
          {slot && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-600" />
              <span className="text-sm font-medium text-slate-700">Time:</span>
              <span className="text-sm text-slate-900 font-semibold">
                {formatTime(slot.start_time)}
              </span>
            </div>
          )}
          {booking.patient_name && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-700">Patient:</span>
              <span className="text-sm text-slate-900 font-semibold">
                {booking.patient_name}
              </span>
            </div>
          )}
        </div>

        {/* Action button */}
        <button
          onClick={onClose}
          className="w-full rounded-lg bg-brand-500 hover:bg-brand-600 text-white shadow-md px-4 py-2.5 text-sm font-medium transition-all hover:shadow-lg active:scale-95"
        >
          Done
        </button>
      </div>
    </div>
  )
}

