// src/types/index.ts

// Doctor returned from backend
export interface Doctor {
    id: number
    name: string
    specialization?: string
    created_at?: string
  }
  
  // Slot returned from backend / used in frontend
  export interface AppointmentSlot {
    id: number
    doctor_id: number
    start_time: string
    duration_minutes: number
    created_at?: string
  }
  
  // Booking returned from /slots/:id/book
  export interface Booking {
    id: number
    slot_id: number
    patient_name: string
    patient_email?: string
    status: 'PENDING' | 'CONFIRMED' | 'FAILED'
    created_at?: string
    updated_at?: string
  }
  