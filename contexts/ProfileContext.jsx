'use client'

import { createContext, useContext } from 'react'

// Carries the currently-viewed portfolio owner ({ userId, username }) down to
// the client section components so their public API reads (/skills, /projects,
// /experience, /education) can be scoped to that user via ?userId=.
const ProfileContext = createContext({ userId: null, username: null })

export function ProfileProvider({ value, children }) {
  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  )
}

// Returns { userId, username } for the profile being viewed. On the legacy root
// route (no /profile/[username]) both may be null and sections should render
// from the SSR-preloaded master data without issuing scoped list fetches.
export function useProfile() {
  return useContext(ProfileContext)
}

export default ProfileContext
