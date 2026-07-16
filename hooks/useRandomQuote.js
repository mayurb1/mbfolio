'use client'

import { useState, useEffect, useCallback } from 'react'

const QUOTE_API_URL =
  'https://motivational-spark-api.vercel.app/api/quotes/random'

// Shown while the request is in flight and if the API is unreachable, so the
// UI always has something meaningful to render.
const FALLBACK_QUOTE = {
  quote: 'Code is like humor. When you have to explain it, it’s bad.',
  author: 'Cory House',
}

/**
 * Fetches a random motivational quote from the external motivational-spark API.
 *
 * The API responds with `{ author, quote }`. This lives outside the app's
 * same-origin `/api` client, so it uses `fetch` directly rather than the shared
 * `useApiResource` hook.
 *
 * @returns {{ quote:string, author:string, loading:boolean, error:any, refetch:Function }}
 */
export function useRandomQuote() {
  const [data, setData] = useState(FALLBACK_QUOTE)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchQuote = useCallback(async signal => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(QUOTE_API_URL, { signal })
      if (!res.ok) {
        throw new Error(`Quote request failed with status ${res.status}`)
      }
      const json = await res.json()
      if (json?.quote && json?.author) {
        setData({ quote: json.quote, author: json.author })
      } else {
        throw new Error('Unexpected quote response shape')
      }
    } catch (err) {
      // Ignore abort errors triggered by unmount/refetch.
      if (err?.name !== 'AbortError') {
        setError(err)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    fetchQuote(controller.signal)
    return () => controller.abort()
  }, [fetchQuote])

  const refetch = useCallback(() => fetchQuote(), [fetchQuote])

  return { ...data, loading, error, refetch }
}

export default useRandomQuote
