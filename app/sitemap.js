import { SITE_URL } from '@/lib/site'
import { connectDB } from '@/lib/db'
import Users from '@/models/users'

// Generates /sitemap.xml from SITE_URL so entries stay correct on any domain.
// In the multi-user model the canonical pages are each user's /profile/{username}.
export default async function sitemap() {
  const entries = [{ path: '/', changeFrequency: 'daily', priority: 1.0 }]

  try {
    await connectDB()
    const users = await Users.find({}).select('username updatedAt').lean()
    for (const u of users) {
      if (!u.username) continue
      entries.push({
        path: `/profile/${u.username}`,
        changeFrequency: 'weekly',
        priority: 0.9,
        lastModified: u.updatedAt,
      })
    }
  } catch {
    // On DB failure, fall back to just the root entry.
  }

  return entries.map(({ path, changeFrequency, priority, lastModified }) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency,
    priority,
    ...(lastModified ? { lastModified } : {}),
  }))
}
