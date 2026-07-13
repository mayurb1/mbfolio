import api from './api'

/**
 * Retry helper with exponential backoff
 * Useful for handling cold starts on free-tier servers
 */
const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 1000) => {
  let lastError

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error

      // Don't retry on 4xx errors (except 408 Request Timeout and 429 Too Many Requests)
      const status = error.response?.status
      if (status && status >= 400 && status < 500 && status !== 408 && status !== 429) {
        throw error
      }

      // If this is the last attempt, throw the error
      if (attempt === maxRetries - 1) {
        throw error
      }

      // Calculate delay with exponential backoff
      const delay = baseDelay * Math.pow(2, attempt)
      console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms...`)

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw lastError
}

export const masterService = {
  // Get master data for entire website
  getMasterData: async (options = {}) => {
    const { skipRetry = false } = options

    try {
      const fetchData = async () => {
        const response = await api.get('/master')
        return response.data
      }

      // Use retry logic by default, but allow skipping for manual retries
      if (skipRetry) {
        return await fetchData()
      }

      return await retryWithBackoff(fetchData, 3, 2000) // 3 attempts with 2s, 4s, 8s delays
    } catch (error) {
      console.error('Error fetching master data:', error)
      throw error
    }
  }
}

export default masterService