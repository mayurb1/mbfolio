import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Menu,
  X,
  Home,
  User,
  Code,
  Briefcase,
  FolderOpen,
  Mail,
} from 'lucide-react'
import { createPortal } from 'react-dom'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('hero')
  const [isScrolled, setIsScrolled] = useState(false)
  const scrollYRef = useRef(0)

  const navItems = [
    { id: 'hero', label: 'Home', icon: Home },
    { id: 'about', label: 'About', icon: User },
    { id: 'skills', label: 'Skills', icon: Code },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'projects', label: 'Projects', icon: FolderOpen },
    { id: 'contact', label: 'Contact', icon: Mail },
  ]

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)

      const sections = navItems.map(item => item.id)
      for (const sectionId of sections) {
        const element = document.getElementById(sectionId)
        if (element) {
          const rect = element.getBoundingClientRect()
          if (rect.top <= 100 && rect.bottom >= 100) {
            setActiveSection(sectionId)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Lock page scroll when drawer is open (no position/top hack)
  useEffect(() => {
    if (!isMenuOpen) return

    const html = document.documentElement
    const prevHtmlOverflow = html.style.overflow
    const prevBodyOverflow = document.body.style.overflow

    html.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'

    return () => {
      html.style.overflow = prevHtmlOverflow || ''
      document.body.style.overflow = prevBodyOverflow || ''
    }
  }, [isMenuOpen])

  const scrollToSection = sectionId => {
    const element = document.getElementById(sectionId)
    if (!element) {
      setIsMenuOpen(false)
      return
    }
    const offsetTop = element.offsetTop - 80
    setIsMenuOpen(false)
    requestAnimationFrame(() => {
      window.scrollTo({ top: offsetTop, behavior: 'smooth' })
    })
  }

  const handleKeyDown = (e, sectionId) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      scrollToSection(sectionId)
    }
  }

  const openDrawer = () => {
    scrollYRef.current = window.scrollY
    setIsMenuOpen(true)
  }

  const closeDrawer = () => setIsMenuOpen(false)

  // Drawer component with smooth animations
  const Drawer = () => (
    <motion.div
      key="drawer-root"
      className="fixed inset-0 z-50 lg:hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/70 z-10"
        onClick={closeDrawer}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        aria-hidden="true"
      />

      {/* Panel */}
      <motion.div
        className="absolute right-0 top-0 h-[100dvh] max-h-[100dvh] w-[90%] max-w-[360px] bg-surface border-l border-border shadow-2xl overflow-y-auto flex flex-col z-20"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        role="dialog"
        aria-modal="true"
        aria-label="Section navigation"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 backdrop-blur-sm bg-surface/95 border-b border-border">
          <div className="flex items-center justify-between p-4">
            <button
              onClick={() => scrollToSection('hero')}
              className="text-xl font-bold text-gradient focus:outline-none rounded-lg p-1"
              aria-label="Go to top of page"
            >
              &lt;MB /&gt;
            </button>
            <button
              onClick={closeDrawer}
              className="p-2 rounded-lg hover:bg-background text-text"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Nav links */}
        <div className="p-2">
          <ul className="space-y-1">
            {navItems.map(item => {
              const Icon = item.icon
              const selected = activeSection === item.id
              return (
                <li key={item.id}>
                  <button
                    onClick={() => scrollToSection(item.id)}
                    onKeyDown={e => handleKeyDown(e, item.id)}
                    className={`group w-full flex items-center gap-3 px-4 py-3.5 rounded-lg text-left text-sm transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary/40 ${
                      selected
                        ? 'bg-primary/10 text-primary'
                        : 'text-text-secondary hover:text-text hover:bg-background'
                    }`}
                    aria-label={`Navigate to ${item.label} section`}
                  >
                    <span
                      className={`w-1 h-6 rounded-full ${selected ? 'bg-primary' : 'bg-border group-hover:bg-primary/60'}`}
                    />
                    <Icon size={18} />
                    <span className="font-medium">{item.label}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      </motion.div>
    </motion.div>
  )

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-background/95 backdrop-blur-md border-b border-border shadow-lg'
          : 'bg-transparent'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <nav
        className="container mx-auto px-4 lg:px-8"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <motion.div
            className="flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <button
              onClick={() => scrollToSection('hero')}
              className="text-xl lg:text-2xl font-bold text-gradient focus:outline-none rounded-lg p-1"
              aria-label="Go to top of page"
            >
              &lt;MB /&gt;
            </button>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map(item => {
              const Icon = item.icon
              return (
                <motion.button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  onKeyDown={e => handleKeyDown(e, item.id)}
                  className={`relative px-4 py-2 rounded-lg font-medium transition-colors duration-200 focus:outline-none ${
                    activeSection === item.id
                      ? 'text-primary bg-primary/10'
                      : 'text-text-secondary hover:text-text hover:bg-surface'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={`Navigate to ${item.label} section`}
                >
                  <div className="flex items-center space-x-2">
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </div>
                  {activeSection === item.id && (
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                      layoutId="activeIndicator"
                      initial={false}
                    />
                  )}
                </motion.button>
              )
            })}
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            className="lg:hidden p-2 rounded-lg text-text hover:bg-surface focus:outline-none"
            onClick={() => (isMenuOpen ? setIsMenuOpen(false) : openDrawer())}
            whileTap={{ scale: 0.95 }}
            aria-expanded={isMenuOpen}
            aria-label="Toggle navigation menu"
            aria-controls="mobile-drawer"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </motion.button>
        </div>

        {/* Mobile trigger */}
        <div className="lg:hidden pb-2">
          <button
            onClick={openDrawer}
            className="px-3 py-1.5 rounded-full border border-border bg-background text-text-secondary hover:text-text text-sm"
            aria-label="Open sections menu"
          >
            Sections
          </button>
        </div>

        {/* Mobile Drawer Navigation (via portal + AnimatePresence) */}
        {createPortal(
          <AnimatePresence>
            {isMenuOpen && <Drawer key="drawer" />}
          </AnimatePresence>,
          document.body
        )}
      </nav>
    </motion.header>
  )
}

export default Header
