import { motion } from 'framer-motion'
import { Stethoscope, Heart, Brain, Eye, Baby, Activity } from 'lucide-react'
import type { Doctor } from '../types'

/**
 * DoctorList - Component to display a vertical list of doctors
 * Allows users to select a doctor to view their available slots
 * 
 * @param doctors - Array of doctor objects to display
 * @param selectedDoctorId - ID of the currently selected doctor (optional)
 * @param onSelectDoctor - Callback function when a doctor is selected
 * @param searchQuery - Current search query for filtering
 */
interface DoctorListProps {
  doctors: Doctor[]
  selectedDoctorId?: number
  onSelectDoctor: (doctorId: number) => void
  searchQuery?: string
}

/**
 * Get specialization icon based on specialization name
 */
function getSpecializationIcon(specialization?: string) {
  if (!specialization) return Stethoscope
  const spec = specialization.toLowerCase()
  if (spec.includes('cardio') || spec.includes('heart')) return Heart
  if (spec.includes('neuro') || spec.includes('brain')) return Brain
  if (spec.includes('eye') || spec.includes('vision')) return Eye
  if (spec.includes('pediatric') || spec.includes('child')) return Baby
  if (spec.includes('sport') || spec.includes('ortho')) return Activity
  return Stethoscope
}

/**
 * Get specialization badge color based on specialization
 */
// Specialization badge colors - dark mode classes removed
function getSpecializationColor(specialization?: string): string {
  if (!specialization) return 'bg-blue-100 text-blue-700'
  const spec = specialization.toLowerCase()
  if (spec.includes('cardio') || spec.includes('heart')) return 'bg-red-100 text-red-700'
  if (spec.includes('neuro') || spec.includes('brain')) return 'bg-purple-100 text-purple-700'
  if (spec.includes('eye') || spec.includes('vision')) return 'bg-cyan-100 text-cyan-700'
  if (spec.includes('pediatric') || spec.includes('child')) return 'bg-pink-100 text-pink-700'
  if (spec.includes('sport') || spec.includes('ortho')) return 'bg-green-100 text-green-700'
  return 'bg-blue-100 text-blue-700'
}

export default function DoctorList({
  doctors,
  selectedDoctorId,
  onSelectDoctor,
  searchQuery = '',
}: DoctorListProps) {
  return (
    <div className="space-y-4">
      {/* Section heading - dark mode classes removed */}
      <h2 className="text-2xl font-bold text-slate-900 mb-4">Select a Doctor</h2>
      
      {doctors.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12 bg-white rounded-2xl shadow-sm border border-slate-200"
        >
          <Stethoscope className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">
            {searchQuery ? 'No doctors found matching your search' : 'No doctors available'}
          </p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {doctors.map((doctor, index) => {
            const isSelected = selectedDoctorId === doctor.id
            const SpecIcon = getSpecializationIcon(doctor.specialization)
            const avatarUrl = `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(doctor.name)}`
            
            return (
              <motion.div
                key={doctor.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelectDoctor(doctor.id)}
                className={`
                  bg-white rounded-2xl border p-5 shadow-sm 
                  cursor-pointer transition-all
                  ${isSelected 
                    ? 'border-2 border-brand-500 bg-gradient-to-br from-brand-50 to-white shadow-lg ring-2 ring-brand-100' 
                    : 'border-slate-200 hover:border-brand-300 hover:shadow-md'
                  }
                `}
              >
                <div className="flex items-start gap-4">
                  {/* Doctor Avatar with Dicebear - dark mode classes removed */}
                  <div className={`
                    flex-shrink-0 w-16 h-16 rounded-full overflow-hidden
                    border-2 ${isSelected ? 'border-brand-500 ring-2 ring-brand-100 ring-offset-2' : 'border-slate-200'}
                    transition-all shadow-md
                  `}>
                    <img
                      src={avatarUrl}
                      alt={doctor.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    {/* Doctor name - dark mode classes removed */}
                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                      {doctor.name}
                    </h3>
                    {doctor.specialization && (
                      <span className={`inline-flex items-center gap-1.5 ${getSpecializationColor(doctor.specialization)} px-3 py-1 rounded-full text-xs font-medium`}>
                        <SpecIcon className="w-3.5 h-3.5" />
                        {doctor.specialization}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}



