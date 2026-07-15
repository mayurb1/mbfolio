import WebProvider from '@/store/WebProvider'
import { ProfileProvider } from '@/contexts/ProfileContext'
import Header from '@/web/layout/Header'
import Footer from '@/web/layout/Footer'

// Per-portfolio shell: seeds the Redux store with this user's SSR master data
// and exposes { userId, username } via ProfileContext so the client sections
// scope their list fetches to the right owner. Rendered by the profile page
// (and the blog, using the primary user) rather than the shared (web) layout,
// because a layout cannot read the child [username] route param.
export default function PortfolioShell({ initialData, profile, children }) {
  return (
    <WebProvider initialData={initialData}>
      <ProfileProvider value={profile}>
        <Header />
        <main id="main-content" role="main">
          {children}
        </main>
        <Footer />
      </ProfileProvider>
    </WebProvider>
  )
}
