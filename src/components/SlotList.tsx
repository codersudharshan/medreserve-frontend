import { motion } from 'framer-motion'
import { Clock, CheckCircle2, Calendar } from 'lucide-react'
import type { AppointmentSlot } from '../types'

interface SlotListProps {
  slots: AppointmentSlot[]
  onBook: (slot: AppointmentSlot) => void
}

/**
 * SlotList - shows available appointment slots in a grid
 * Modern card design with icons, hover effects, and animations
 */
export default function SlotList({ slots, onBook }: SlotListProps) {
  if (!slots || slots.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-8"
      >
        {/* Empty state - dark mode classes removed */}
        <p className="text-slate-500 italic text-sm">
          No available slots for this doctor.
        </p>
      </motion.div>
    )
  }

  const formatTime = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div>
      {/* Section heading - dark mode classes removed */}
      <h2 className="text-2xl font-bold text-slate-900 mb-4">Available Slots</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {slots.map((slot, index) => (
          <motion.div
            key={slot.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.03, y: -4 }}
            className="bg-white rounded-2xl border-l-4 border-brand-500 border border-slate-200 p-6 flex flex-col justify-between shadow-md hover:shadow-xl transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                {/* Available badge - dark mode classes removed */}
                <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                  Available
                </span>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-lg"
                >
                  <Clock className="w-6 h-6 text-white" aria-hidden="true" />
                </motion.div>
                <div>
                  {/* Time display - dark mode classes removed */}
                  <p className="text-3xl font-bold text-slate-900">
                    {formatTime(slot.start_time)}
                  </p>
                  {/* Duration - dark mode classes removed */}
                  <p className="text-sm text-slate-500 mt-0.5">
                    {slot.duration_minutes} minutes
                  </p>
                </div>
              </div>
            </div>
            {/* Book button - dark mode classes removed */}
            <motion.button
              onClick={() => onBook(slot)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white shadow-lg px-4 py-3 text-sm font-semibold transition-all hover:shadow-xl overflow-hidden group"
            >
              <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></span>
              <Calendar className="w-4 h-4 relative z-10" />
              <span className="relative z-10">Book Appointment</span>
            </motion.button>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
