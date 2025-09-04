import { useSelector, useDispatch } from 'react-redux'
import { useEffect } from 'react'
import { 
  fetchMasterData, 
  selectUser, 
  selectStats, 
  selectHighlights, 
  selectMasterLoading, 
  selectMasterError,
  selectMasterData 
} from '../store/masterSlice'

/**
 * Custom hook for accessing master data throughout the website
 * Automatically fetches data if not available and provides easy access to all master data
 */
export const useMasterData = () => {
  const dispatch = useDispatch()
  
  // Selectors
  const masterData = useSelector(selectMasterData)
  const user = useSelector(selectUser)
  const stats = useSelector(selectStats)
  const highlights = useSelector(selectHighlights)
  const loading = useSelector(selectMasterLoading)
  const error = useSelector(selectMasterError)

  // Auto-fetch on mount if data is not available
  useEffect(() => {
    if (!user.name && !loading && !error) {
      dispatch(fetchMasterData())
    }
  }, [dispatch, user.name, loading, error])

  // Helper functions for common use cases
  const getContactInfo = () => ({
    email: user.email,
    phone: user.phone,
    linkedinUrl: user.linkedinUrl,
    githubUrl: user.githubUrl
  })

  const getLocationInfo = () => ({
    city: user.location?.city,
    state: user.location?.state,
    country: user.location?.country,
    fullAddress: user.location?.address,
    coordinates: user.location?.coordinates
  })

  const getLocationDisplay = () => {
    const loc = user.location
    if (loc?.city && loc?.country) {
      return `${loc.city}, ${loc.country}`
    }
    return 'Ahmedabad, India' // fallback
  }

  const getExperienceText = () => {
    return stats.experience?.text || '3+ years'
  }

  const getCompletedProjectsCount = () => {
    return stats.projects?.completed || 0
  }

  return {
    // Raw data
    masterData,
    user,
    stats,
    highlights,
    
    // States
    loading,
    error,
    
    // Helper functions
    getContactInfo,
    getLocationInfo,
    getLocationDisplay,
    getExperienceText,
    getCompletedProjectsCount,
    
    // Actions
    refetch: () => dispatch(fetchMasterData())
  }
}

export default useMasterData