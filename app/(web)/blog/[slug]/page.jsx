import { getMasterData } from '@/lib/getMasterData'
import PortfolioShell from '@/web/layout/PortfolioShell'
import BlogPost from '@/web/blog/BlogPost'

export const metadata = {
  title: 'Blog Post - Portfolio',
}

// Blog is not user-scoped; it borrows the primary user's chrome (Header/Footer)
// so the shared shell has master data to render.
export default async function BlogPostPage() {
  let initialData = null
  try {
    initialData = await getMasterData()
  } catch {
    initialData = null
  }

  const profile = initialData
    ? { userId: initialData.user.id, username: initialData.user.username }
    : { userId: null, username: null }

  return (
    <PortfolioShell initialData={initialData} profile={profile}>
      <BlogPost />
    </PortfolioShell>
  )
}
