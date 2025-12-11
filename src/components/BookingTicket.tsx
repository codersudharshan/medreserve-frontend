import { motion } from 'framer-motion'
import { Calendar, Clock, CheckCircle2, Download, X } from 'lucide-react'
import type { Booking, AppointmentSlot, Doctor } from '../types'

interface BookingTicketProps {
  booking: Booking
  slot?: AppointmentSlot
  doctor?: Doctor
  onClose: () => void
}

/**
 * Generate a simple SVG QR code (fake, for visual purposes)
 */
function generateQRCode(_data: string): string {
  // This is a placeholder - in production, use a real QR code library
  return `data:image/svg+xml,${encodeURIComponent(`
    <svg width="120" height="120" xmlns="http://www.w3.org/2000/svg">
      <rect width="120" height="120" fill="white"/>
      <rect x="10" y="10" width="20" height="20" fill="black"/>
      <rect x="40" y="10" width="10" height="10" fill="black"/>
      <rect x="60" y="10" width="20" height="20" fill="black"/>
      <rect x="90" y="10" width="20" height="20" fill="black"/>
      <rect x="10" y="40" width="10" height="10" fill="black"/>
      <rect x="30" y="40" width="20" height="20" fill="black"/>
      <rect x="60" y="40" width="10" height="10" fill="black"/>
      <rect x="80" y="40" width="10" height="10" fill="black"/>
      <rect x="100" y="40" width="10" height="10" fill="black"/>
      <rect x="10" y="60" width="20" height="20" fill="black"/>
      <rect x="40" y="60" width="10" height="10" fill="black"/>
      <rect x="60" y="60" width="20" height="20" fill="black"/>
      <rect x="90" y="60" width="20" height="20" fill="black"/>
      <rect x="10" y="90" width="20" height="20" fill="black"/>
      <rect x="40" y="90" width="10" height="10" fill="black"/>
      <rect x="60" y="90" width="20" height="20" fill="black"/>
      <rect x="90" y="90" width="20" height="20" fill="black"/>
    </svg>
  `)}`
}

/**
 * Generate .ics file for calendar
 */
function generateICS(booking: Booking, slot?: AppointmentSlot, doctor?: Doctor): string {
  const start = slot ? new Date(slot.start_time) : new Date()
  const end = slot ? new Date(start.getTime() + slot.duration_minutes * 60000) : new Date(start.getTime() + 30 * 60000)
  
  const formatDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  }

  const summary = `Appointment with ${doctor?.name || 'Doctor'}`
  const description = `Booking ID: ${booking.id}\nPatient: ${booking.patient_name}`
  
  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//MedReserve//Appointment//EN
BEGIN:VEVENT
UID:${booking.id}@medreserve.com
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(start)}
DTEND:${formatDate(end)}
SUMMARY:${summary}
DESCRIPTION:${description}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`
}

/**
 * Download .ics file
 */
function downloadICS(booking: Booking, slot?: AppointmentSlot, doctor?: Doctor) {
  const icsContent = generateICS(booking, slot, doctor)
  const blob = new Blob([icsContent], { type: 'text/calendar' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `appointment-${booking.id}.ics`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * BookingTicket - Beautiful ticket-style booking confirmation
 */
export default function BookingTicket({ booking, slot, doctor, onClose }: BookingTicketProps) {
  const formatTime = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  const formatDate = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const doctorAvatarUrl = doctor 
    ? `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(doctor.name)}`
    : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full relative overflow-hidden"
      >
        {/* Close button - dark mode classes removed */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-full hover:bg-slate-100"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Ticket design with perforated edge effect */}
        <div className="relative">
          {/* Top decorative border */}
          <div className="h-2 bg-gradient-to-r from-brand-500 via-brand-600 to-brand-500"></div>
          
          {/* Main content */}
          <div className="p-6">
            {/* Success icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="flex justify-center mb-4"
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg">
                <CheckCircle2 className="w-12 h-12 text-white" />
              </div>
            </motion.div>

            {/* Title - dark mode classes removed */}
            <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">
              Booking Confirmed!
            </h2>
            <p className="text-center text-slate-600 mb-6 text-sm">
              Your appointment has been successfully booked
            </p>

            {/* Ticket card - dark mode classes removed */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-slate-50 to-white rounded-2xl border-2 border-dashed border-slate-300 p-6 mb-4 relative"
            >
              {/* Perforated edge indicators - dark mode classes removed */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-slate-200"></div>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-4 h-4 rounded-full bg-slate-200"></div>

              {/* Doctor info - dark mode classes removed */}
              {doctor && (
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-200">
                  {doctorAvatarUrl && (
                    <img
                      src={doctorAvatarUrl}
                      alt={doctor.name}
                      className="w-12 h-12 rounded-full border-2 border-white shadow-md"
                    />
                  )}
                  <div>
                    <p className="font-semibold text-slate-800">{doctor.name}</p>
                    {doctor.specialization && (
                      <p className="text-sm text-slate-600">{doctor.specialization}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Appointment details - dark mode classes removed */}
              {slot && (
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-brand-600" />
                    <span className="text-sm text-slate-600">{formatDate(slot.start_time)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-brand-600" />
                    <span className="text-sm font-semibold text-slate-800">{formatTime(slot.start_time)}</span>
                    <span className="text-sm text-slate-600">({slot.duration_minutes} min)</span>
                  </div>
                </div>
              )}

              {/* Booking ID - dark mode classes removed */}
              <div className="bg-white rounded-lg p-3 border border-slate-200">
                <p className="text-xs text-slate-500 mb-1">Booking ID</p>
                <p className="text-lg font-bold text-slate-800">#{booking.id}</p>
              </div>

              {/* QR Code - dark mode classes removed */}
              <div className="mt-4 flex justify-center">
                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <img
                    src={generateQRCode(`booking-${booking.id}`)}
                    alt="QR Code"
                    className="w-24 h-24"
                  />
                </div>
              </div>
            </motion.div>

            {/* Action buttons */}
            <div className="space-y-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => downloadICS(booking, slot, doctor)}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white shadow-lg px-4 py-3 text-sm font-semibold transition-all"
              >
                <Download className="w-4 h-4" />
                Add to Calendar
              </motion.button>
              {/* Done button - dark mode classes removed */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="w-full rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-3 text-sm font-medium transition-all"
              >
                Done
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

