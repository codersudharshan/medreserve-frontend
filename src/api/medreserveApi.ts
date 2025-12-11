// src/api/medreserveApi.ts
/**
 * medreserveApi - API helper functions to call the backend
 * This file will contain all API calls for the MedReserve application
 */

import type { Doctor, AppointmentSlot, Booking } from '../types'

// Base API URL - can be configured via environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api"

/**
 * Generic fetch wrapper with error handling
 */
async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('API request failed:', error)
    throw error
  }
}

/**
 * Fetch all available doctors
 */
export async function getDoctors(): Promise<Doctor[]> {
  return fetchApi<Doctor[]>('/doctors')
}

/**
 * Fetch available slots for a specific doctor
 * @param doctorId - The ID of the doctor
 */
export async function getDoctorSlots(doctorId: number): Promise<AppointmentSlot[]> {
  return fetchApi<AppointmentSlot[]>(`/doctors/${doctorId}/slots`)
}

/**
 * Book an appointment for a specific slot
 * @param slotId - The ID of the slot to book
 * @param patientData - Patient information for the booking
 */
export async function bookAppointment(
  slotId: number,
  patientData: { name: string; email?: string }
): Promise<Booking> {
  return fetchApi<Booking>(`/slots/${slotId}/book`, {
    method: 'POST',
    body: JSON.stringify({
      patient_name: patientData.name,
      patient_email: patientData.email,
    }),
  })
}

/**
 * Create a new doctor
 * @param doctorData - Doctor information (name required, specialization optional)
 */
export async function createDoctor(doctorData: {
  name: string
  specialization?: string
}): Promise<Doctor> {
  return fetchApi<Doctor>('/doctors', {
    method: 'POST',
    body: JSON.stringify({
      name: doctorData.name,
      specialization: doctorData.specialization,
    }),
  })
}

/**
 * Create a new appointment slot for a doctor
 * @param doctorId - The ID of the doctor
 * @param slotData - Slot information (start_time, duration_minutes)
 */
export async function createSlot(
  doctorId: number,
  slotData: {
    start_time: string
    duration_minutes: number
  }
): Promise<AppointmentSlot> {
  return fetchApi<AppointmentSlot>(`/doctors/${doctorId}/slots`, {
    method: 'POST',
    body: JSON.stringify({
      start_time: slotData.start_time,
      duration_minutes: slotData.duration_minutes,
    }),
  })
}

/**
 * Admin API functions - use /admin endpoints
 */

/**
 * Create a new doctor via admin endpoint
 * @param payload - Doctor information (name required, specialization optional)
 */
export async function createAdminDoctor(payload: {
  name: string
  specialization?: string
}): Promise<Doctor> {
  return fetchApi<Doctor>('/admin/doctors', {
    method: 'POST',
    body: JSON.stringify({
      name: payload.name,
      specialization: payload.specialization,
    }),
  })
}

/**
 * Get all doctors via admin endpoint
 */
export async function getAdminDoctors(): Promise<Doctor[]> {
  return fetchApi<Doctor[]>('/admin/doctors')
}

/**
 * Create a new appointment slot via admin endpoint
 * @param payload - Slot information (doctor_id, start_time as ISO string, duration_minutes)
 */
export async function createAdminSlot(payload: {
  doctor_id: number
  start_time: string
  duration_minutes: number
}): Promise<AppointmentSlot> {
  return fetchApi<AppointmentSlot>('/admin/slots', {
    method: 'POST',
    body: JSON.stringify({
      doctor_id: payload.doctor_id,
      start_time: payload.start_time,
      duration_minutes: payload.duration_minutes,
    }),
  })
}

/**
 * Get slots for a specific doctor via admin endpoint
 * @param doctorId - The ID of the doctor
 */
export async function getAdminDoctorSlots(doctorId: number): Promise<AppointmentSlot[]> {
  return fetchApi<AppointmentSlot[]>(`/admin/doctors/${doctorId}/slots`)
}

/**
 * Get admin statistics
 */
export async function getAdminStats(): Promise<{
  totalDoctors: number
  totalSlots: number
  totalBookings: number
  [key: string]: unknown
}> {
  return fetchApi('/admin/stats')
}

export { fetchApi, API_BASE_URL }
