'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import api from '../services/api'

// Default transform pulls the conventional `response.data.data` payload shape
// used across the public API sections.
const defaultTransform = res => res.data.data

/**
 * Shared data-loading lifecycle for the public web sections.
 *
 * Replaces the hand-rolled useState(data/loading/error) + fetch + retry +
 * useEffect pattern duplicated across Experience/Projects/Skills.
 *
 * @param {string|string[]} path
 *   API path (e.g. '/projects'). Pass an array of paths to fire multiple
 *   requests in parallel via Promise.all (used by Experience for
 *   experience + education). The `transform` then receives the array of
 *   axios responses in the same order.
 * @param {object} [options]
 * @param {object|object[]} [options.params]
 *   Axios request params. With an array `path`, pass an array of param
 *   objects to vary them per request, or a single object to share.
 * @param {(response:any)=>any} [options.transform=defaultTransform]
 *   Maps the axios response (or array of responses) to the stored data.
 * @param {any} [options.fallback=null]
 *   Value stored on error and used as the initial value.
 * @param {any} [options.errorMessage]
 *   Value stored in `error` on failure. Defaults to the caught error object.
 * @param {boolean} [options.immediate=true]
 *   Whether to fetch automatically on mount.
 * @returns {{ data:any, loading:boolean, error:any, retry:Function, refetch:Function }}
 */
export function useApiResource(path, options = {}) {
  const {
    params,
    transform = defaultTransform,
    fallback = null,
    errorMessage,
    immediate = true,
  } = options

  const [data, setData] = useState(fallback)
  const [loading, setLoading] = useState(immediate)
  const [error, setError] = useState(null)

  // Hold the latest option values so `refetch` keeps a stable identity and the
  // mount effect runs exactly once (matching the original `useEffect(..., [])`).
  const optionsRef = useRef({})
  optionsRef.current = { path, params, transform, fallback, errorMessage }

  const refetch = useCallback(async () => {
    const {
      path: currentPath,
      params: currentParams,
      transform: currentTransform,
      fallback: currentFallback,
      errorMessage: currentErrorMessage,
    } = optionsRef.current

    try {
      setLoading(true)
      setError(null)

      let result
      if (Array.isArray(currentPath)) {
        const responses = await Promise.all(
          currentPath.map((p, i) =>
            api.get(p, {
              params: Array.isArray(currentParams)
                ? currentParams[i]
                : currentParams,
            })
          )
        )
        result = currentTransform(responses)
      } else {
        const response = await api.get(currentPath, { params: currentParams })
        result = currentTransform(response)
      }

      setData(result)
      return result
    } catch (err) {
      console.error('Error fetching resource:', err)
      setError(currentErrorMessage !== undefined ? currentErrorMessage : err)
      setData(currentFallback)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (immediate) {
      refetch()
    }
    // Run once on mount; option changes are read live via optionsRef.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { data, loading, error, retry: refetch, refetch }
}

export default useApiResource
