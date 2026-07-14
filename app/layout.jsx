import { Inter, JetBrains_Mono } from 'next/font/google'
import { GoogleAnalytics } from '@next/third-parties/google'
import { SITE_URL } from '@/lib/site'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-jetbrains',
  display: 'swap',
})

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Mayur Bhalgama - Software Engineer',
  description:
    'Software Engineer Portfolio of Mayur Bhalgama — React, Next.js and front-end architecture.',
  applicationName: 'Personal Portfolio',
  authors: [{ name: 'Mayur Bhalgama' }],
  robots: { index: true, follow: true },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Personal Portfolio',
  },
}

export const viewport = {
  themeColor: '#000000',
}

// Blocking script that applies the persisted theme class before paint to avoid FOUC.
const themeInitScript = `(function(){try{var t=localStorage.getItem('portfolio-theme');if(!t){t=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.className=t;}catch(e){document.documentElement.className='dark';}})();`

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable}`}>
        {children}
      </body>
      {process.env.NEXT_PUBLIC_GA_ID ? (
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
      ) : null}
    </html>
  )
}
