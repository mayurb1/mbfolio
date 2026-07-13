import Hero from '@/web/sections/Hero'
import About from '@/web/sections/About'
import Skills from '@/web/sections/Skills'
import Experience from '@/web/sections/Experience'
import Projects from '@/web/sections/Projects'
import Contact from '@/web/sections/Contact'

export const metadata = {
  title: 'Mayur Bhalgama - Software Engineer Portfolio',
  description:
    'Software Engineer Portfolio of Mayur Bhalgama — React, Next.js and front-end architecture.',
  keywords: [
    'Mayur Bhalgama',
    'Software Engineer',
    'React',
    'Next.js',
    'Frontend Developer',
    'Portfolio',
  ],
  alternates: { canonical: 'https://mbfolio.netlify.app' },
  openGraph: {
    title: 'Mayur Bhalgama - Software Engineer',
    description: 'Software Engineer Portfolio of Mayur Bhalgama.',
    url: 'https://mbfolio.netlify.app',
    siteName: 'Mayur Bhalgama Portfolio',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/images/og-image.webp',
        width: 1200,
        height: 630,
        alt: 'Mayur Bhalgama - Software Engineer Portfolio',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@mayurbhalgama',
    creator: '@mayurbhalgama',
    title: 'Mayur Bhalgama - Software Engineer',
    description: 'Software Engineer Portfolio of Mayur Bhalgama.',
    images: ['/images/og-image.webp'],
  },
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <About />
      <Skills />
      <Experience />
      <Projects />
      <Contact />
    </>
  )
}
