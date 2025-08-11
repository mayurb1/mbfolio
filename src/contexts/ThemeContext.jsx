import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext()

export const themes = {
  light: {
    name: 'Light',
    class: 'light',
    icon: '☀️',
    description: 'Clean and minimal light theme',
  },
  dark: {
    name: 'Dark',
    class: 'dark',
    icon: '🌙',
    description: 'Easy on the eyes dark theme',
  },
  cosmic: {
    name: 'Cosmic',
    class: 'cosmic',
    icon: '🌌',
    description: 'Deep space inspired theme',
  },
  neon: {
    name: 'Neon',
    class: 'neon',
    icon: '⚡',
    description: 'Electric cyberpunk vibes',
  },
  forest: {
    name: 'Forest',
    class: 'forest',
    icon: '🌲',
    description: 'Natural and calming green theme',
  },
}

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('light')
  const [isLoading, setIsLoading] = useState(true)

  // Load theme from localStorage on mount
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('portfolio-theme')
      if (savedTheme && themes[savedTheme]) {
        setCurrentTheme(savedTheme)
      } else {
        // Check user's system preference
        const prefersDark = window.matchMedia(
          '(prefers-color-scheme: dark)'
        ).matches
        setCurrentTheme(prefersDark ? 'dark' : 'light')
      }
    } catch (error) {
      console.warn('Could not load theme preference:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Apply theme to document when currentTheme changes
  useEffect(() => {
    if (!isLoading) {
      const htmlElement = document.documentElement

      // Remove all theme classes
      Object.values(themes).forEach(theme => {
        htmlElement.classList.remove(theme.class)
      })

      // Add current theme class
      htmlElement.classList.add(themes[currentTheme].class)

      // Save to localStorage
      try {
        localStorage.setItem('portfolio-theme', currentTheme)
      } catch (error) {
        console.warn('Could not save theme preference:', error)
      }

      // Update meta theme-color for PWA
      const metaThemeColor = document.querySelector('meta[name="theme-color"]')
      if (metaThemeColor) {
        const colors = {
          light: '#ffffff',
          dark: '#0f172a',
          cosmic: '#0c0a1e',
          neon: '#000011',
          forest: '#f0fdf4',
        }
        metaThemeColor.setAttribute('content', colors[currentTheme])
      }
    }
  }, [currentTheme, isLoading])

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = e => {
      // Only auto-switch if user hasn't manually selected a theme
      const savedTheme = localStorage.getItem('portfolio-theme')
      if (!savedTheme) {
        setCurrentTheme(e.matches ? 'dark' : 'light')
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const changeTheme = themeName => {
    if (themes[themeName]) {
      setCurrentTheme(themeName)

      // Analytics tracking for theme changes
      if (window.gtag) {
        window.gtag('event', 'theme_change', {
          event_category: 'engagement',
          event_label: themeName,
        })
      }
    }
  }

  const toggleTheme = () => {
    const themeOrder = Object.keys(themes)
    const currentIndex = themeOrder.indexOf(currentTheme)
    const nextIndex = (currentIndex + 1) % themeOrder.length
    changeTheme(themeOrder[nextIndex])
  }

  const getNextTheme = () => {
    const themeOrder = Object.keys(themes)
    const currentIndex = themeOrder.indexOf(currentTheme)
    const nextIndex = (currentIndex + 1) % themeOrder.length
    return themes[themeOrder[nextIndex]]
  }

  const isDarkMode = () => {
    return ['dark', 'cosmic', 'neon'].includes(currentTheme)
  }

  const value = {
    currentTheme,
    themes,
    changeTheme,
    toggleTheme,
    getNextTheme,
    isDarkMode,
    isLoading,
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export default ThemeContext
