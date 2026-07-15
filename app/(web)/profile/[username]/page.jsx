import { notFound } from 'next/navigation'
import { getMasterData } from '@/lib/getMasterData'
import { connectDB } from '@/lib/db'
import Users from '@/models/users'
import PortfolioShell from '@/web/layout/PortfolioShell'
import Hero from '@/web/sections/Hero'
import About from '@/web/sections/About'
import Skills from '@/web/sections/Skills'
import Experience from '@/web/sections/Experience'
import Projects from '@/web/sections/Projects'
import Contact from '@/web/sections/Contact'
import { SITE_URL } from '@/lib/site'

// Per-user public portfolio, statically generated and revalidated every 5
// minutes (ISR) so each profile lands in the initial HTML for SEO.
export const revalidate = 300

// Pre-render existing users at build time; unknown/new usernames render on
// demand and are cached (dynamicParams defaults to true).
export async function generateStaticParams() {
  try {
    await connectDB()
    const users = await Users.find({}).select('username').lean()
    return users.filter((u) => u.username).map((u) => ({ username: u.username }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }) {
  const { username } = await params
  const data = await getMasterData({ username })
  if (!data) return { title: 'Profile not found' }

  const u = data.user
  const title = u.headline ? `${u.name} - ${u.headline}` : `${u.name} - Portfolio`
  const description = u.bio || `Portfolio of ${u.name}.`
  const url = `${SITE_URL}/profile/${username}`
  const images = u.profileImage
    ? [{ url: u.profileImage, alt: `${u.name} portfolio` }]
    : [{ url: '/images/og-image.webp', width: 1200, height: 630, alt: `${u.name} portfolio` }]

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: `${u.name} Portfolio`,
      locale: 'en_US',
      type: 'website',
      images,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: images.map((i) => i.url),
    },
  }
}

export default async function ProfilePage({ params }) {
  const { username } = await params

  let initialData = null
  try {
    initialData = await getMasterData({ username })
  } catch {
    initialData = null
  }
  if (!initialData) notFound()

  const profile = {
    userId: initialData.user.id,
    username: initialData.user.username,
  }

  return (
    <PortfolioShell initialData={initialData} profile={profile}>
      <Hero />
      <About />
      <Skills />
      <Experience />
      <Projects />
      <Contact />
    </PortfolioShell>
  )
}
