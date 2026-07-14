import { SITE_URL } from '@/lib/site'

// Generates /sitemap.xml from SITE_URL so entries stay correct on any domain.
export default function sitemap() {
  const pages = [
    { path: '/', changeFrequency: 'monthly', priority: 1.0 },
    { path: '/about', changeFrequency: 'monthly', priority: 0.9 },
    { path: '/projects', changeFrequency: 'weekly', priority: 0.9 },
    { path: '/experience', changeFrequency: 'monthly', priority: 0.8 },
    { path: '/skills', changeFrequency: 'monthly', priority: 0.8 },
    { path: '/contact', changeFrequency: 'monthly', priority: 0.7 },
    { path: '/blog', changeFrequency: 'weekly', priority: 0.6 },
    { path: '/resume.pdf', changeFrequency: 'monthly', priority: 0.5 },
  ]

  return pages.map(({ path, changeFrequency, priority }) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency,
    priority,
  }))
}
