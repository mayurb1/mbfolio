'use client'

import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { checkAuth } from './store/authSlice'

// Probes the current session once on mount (GET /api/auth/me via the cookie) so
// the admin Redux state knows the logged-in user. Renders nothing.
const AuthBootstrap = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(checkAuth())
  }, [dispatch])

  return null
}

export default AuthBootstrap
