import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Palette, Check } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'

const ThemeToggle = () => {
  const { currentTheme, themes, changeTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const handleThemeChange = (themeName) => {
    changeTheme(themeName)
    setIsOpen(false)
  }

  const handleKeyDown = (e, themeName) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleThemeChange(themeName)
    }
  }

  return (
    <div className="relative">
      {/* Toggle Button */}
      <motion.button
        onClick={toggleMenu}
        className="w-12 h-12 bg-surface border border-border rounded-full flex items-center justify-center text-text hover:bg-primary hover:text-background transition-colors duration-200 shadow-lg"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label="Theme selector"
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <Palette size={20} />
        </motion.div>
      </motion.button>

      {/* Theme Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute bottom-full right-0 mb-2 bg-background border border-border rounded-lg shadow-xl overflow-hidden min-w-48"
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ duration: 0.2 }}
            role="menu"
            aria-label="Theme selection menu"
          >
            {/* Menu Header */}
            <div className="px-4 py-3 border-b border-border">
              <h3 className="text-sm font-semibold text-text">Choose Theme</h3>
              <p className="text-xs text-text-secondary mt-1">
                Select your preferred color scheme
              </p>
            </div>

            {/* Theme Options */}
            <div className="py-2">
              {Object.entries(themes).map(([themeName, theme]) => (
                <motion.button
                  key={themeName}
                  onClick={() => handleThemeChange(themeName)}
                  onKeyDown={(e) => handleKeyDown(e, themeName)}
                  className={`w-full px-4 py-3 flex items-center space-x-3 hover:bg-surface transition-colors duration-150 ${
                    currentTheme === themeName ? 'bg-primary/10' : ''
                  }`}
                  whileHover={{ x: 4 }}
                  role="menuitem"
                  aria-label={`Switch to ${theme.name} theme: ${theme.description}`}
                >
                  {/* Theme Icon */}
                  <div className="flex-shrink-0 w-8 h-8 rounded-full border-2 border-border flex items-center justify-center text-lg">
                    {theme.icon}
                  </div>

                  {/* Theme Info */}
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium text-text flex items-center space-x-2">
                      <span>{theme.name}</span>
                      {currentTheme === themeName && (
                        <Check size={14} className="text-primary" />
                      )}
                    </div>
                    <div className="text-xs text-text-secondary">
                      {theme.description}
                    </div>
                  </div>

                  {/* Theme Preview */}
                  <div className="flex-shrink-0 flex space-x-1">
                    <div 
                      className="w-3 h-3 rounded-full border border-border"
                      style={{ 
                        backgroundColor: themeName === 'light' ? '#2563eb' : 
                                        themeName === 'dark' ? '#3b82f6' :
                                        themeName === 'cosmic' ? '#9333ea' :
                                        themeName === 'neon' ? '#00ff88' :
                                        '#059669'
                      }}
                    />
                    <div 
                      className="w-3 h-3 rounded-full border border-border"
                      style={{ 
                        backgroundColor: themeName === 'light' ? '#ffffff' : 
                                        themeName === 'dark' ? '#0f172a' :
                                        themeName === 'cosmic' ? '#0c0a1e' :
                                        themeName === 'neon' ? '#000011' :
                                        '#f0fdf4'
                      }}
                    />
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Menu Footer */}
            <div className="px-4 py-3 border-t border-border bg-surface/50">
              <p className="text-xs text-text-secondary text-center">
                Theme preference is saved automatically
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-[-1]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// Compact theme toggle for use in headers or toolbars
export const CompactThemeToggle = () => {
  const { currentTheme, toggleTheme, getNextTheme } = useTheme()
  const nextTheme = getNextTheme()

  return (
    <motion.button
      onClick={toggleTheme}
      className="p-2 rounded-lg text-text-secondary hover:text-text hover:bg-surface transition-colors duration-200"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={`Switch to ${nextTheme.name} theme`}
      title={`Current: ${currentTheme.charAt(0).toUpperCase() + currentTheme.slice(1)}. Click for ${nextTheme.name}`}
    >
      <div className="text-lg">
        {nextTheme.icon}
      </div>
    </motion.button>
  )
}

export default ThemeToggle