/**
 * API Warm-up Utility
 *
 * Proactively wakes up free-tier servers (like Render) that sleep when inactive.
 * Call this early in your app initialization to reduce perceived loading times.
 */

import api from '../services/api'

/**
 * Pings the server to wake it up
 * @param {string} endpoint - The endpoint to ping (default: '/master')
 * @returns {Promise<boolean>} - Returns true if ping was successful
 */
export const warmupServer = async (endpoint = '/master') => {
  try {
    console.log('[Warmup] Pinging server to wake it up...')

    // Use a simple GET request with a shorter timeout
    // We don't care about the response, just want to wake the server
    await api.get(endpoint, {
      timeout: 5000, // Short timeout for the warmup ping
      headers: {
        'X-Warmup-Request': 'true' // Optional: helps identify warmup requests in logs
      }
    })

    console.log('[Warmup] Server is awake!')
    return true
  } catch (error) {
    // Warmup failed, but that's okay - the actual requests will retry
    console.log('[Warmup] Server warmup timed out (this is normal for cold starts)')
    return false
  }
}

/**
 * Initiates server warmup in the background without blocking
 * Best used on app initialization
 */
export const initiateWarmup = () => {
  // Run warmup in background without awaiting
  warmupServer().catch(() => {
    // Silently fail - the real requests will handle retries
  })
}

export default {
  warmupServer,
  initiateWarmup
}
