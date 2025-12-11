import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import type { Doctor } from '../types'
import { getDoctors } from '../api/medreserveApi'

/**
 * AppContext - React Context for global application state
 * Manages doctors list and provides functions to fetch data
 */

// Define the context type
interface AppContextType {
  doctors: Doctor[]
  loadingDoctors: boolean
  errorDoctors: string | null
  fetchDoctors: () => Promise<void>
}

// Create the context with undefined default
const AppContext = createContext<AppContextType | undefined>(undefined)

/**
 * AppContextProvider - Provider component for AppContext
 * Loads doctors on mount and provides state management
 */
export function AppContextProvider({ children }: { children: ReactNode }) {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loadingDoctors, setLoadingDoctors] = useState<boolean>(false)
  const [errorDoctors, setErrorDoctors] = useState<string | null>(null)

  /**
   * Fetch doctors from the API
   */
  const fetchDoctors = async () => {
    setLoadingDoctors(true)
    setErrorDoctors(null)
    try {
      const data = await getDoctors()
      setDoctors(data)
    } catch (error) {
      setErrorDoctors(error instanceof Error ? error.message : 'Failed to load doctors')
      console.error('Error fetching doctors:', error)
    } finally {
      setLoadingDoctors(false)
    }
  }

  // Load doctors on component mount
  useEffect(() => {
    fetchDoctors()
  }, [])

  const value: AppContextType = {
    doctors,
    loadingDoctors,
    errorDoctors,
    fetchDoctors,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

/**
 * useAppContext - Custom hook to access AppContext
 * Throws an error if used outside of AppContextProvider
 */
export function useAppContext(): AppContextType {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppContextProvider')
  }
  return context
}

