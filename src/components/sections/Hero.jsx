import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowDown,
  Download,
  Mail,
  Github,
  Linkedin,
  ExternalLink,
} from 'lucide-react'
import { useInView } from 'react-intersection-observer'

const Hero = () => {
  const canvasRef = useRef(null)
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  })

  // Animated background with particles
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const particles = []
    const isMobile = window.innerWidth < 768
    const particleCount = isMobile ? 50 : 100

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Particle class
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.size = Math.random() * (isMobile ? 1.5 : 2) + 1
        this.speedX = Math.random() * (isMobile ? 2 : 3) - (isMobile ? 1 : 1.5)
        this.speedY = Math.random() * (isMobile ? 2 : 3) - (isMobile ? 1 : 1.5)
        this.opacity = Math.random() * 0.5 + 0.2
      }

      update() {
        this.x += this.speedX
        this.y += this.speedY

        if (this.x > canvas.width) this.x = 0
        if (this.x < 0) this.x = canvas.width
        if (this.y > canvas.height) this.y = 0
        if (this.y < 0) this.y = canvas.height
      }

      draw() {
        ctx.save()
        ctx.globalAlpha = this.opacity
        ctx.fillStyle = getComputedStyle(
          document.documentElement
        ).getPropertyValue('--color-primary')
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }
    }

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle())
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach(particle => {
        particle.update()
        particle.draw()
      })

      // Draw connections between nearby particles (reduced for mobile)
      const connectionDistance = isMobile ? 80 : 100
      particles.forEach((particle, index) => {
        particles.slice(index + 1).forEach(otherParticle => {
          const dx = particle.x - otherParticle.x
          const dy = particle.y - otherParticle.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < connectionDistance) {
            ctx.save()
            ctx.globalAlpha =
              (1 - distance / connectionDistance) * (isMobile ? 0.15 : 0.2)
            ctx.strokeStyle = getComputedStyle(
              document.documentElement
            ).getPropertyValue('--color-primary')
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(particle.x, particle.y)
            ctx.lineTo(otherParticle.x, otherParticle.y)
            ctx.stroke()
            ctx.restore()
          }
        })
      })

      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [])

  const scrollToSection = sectionId => {
    const element = document.getElementById(sectionId)
    if (element) {
      const offsetTop = element.offsetTop - 80
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth',
      })
    }
  }

  const handleDownloadResume = () => {
    // Analytics tracking
    if (window.gtag) {
      window.gtag('event', 'file_download', {
        file_name: 'resume.pdf',
        event_category: 'engagement',
      })
    }

    // Create download link
    const link = document.createElement('a')
    link.href = '/resume.pdf'
    link.download = 'John_Doe_Resume.pdf'
    link.click()
  }

  const socialLinks = [
    {
      name: 'GitHub',
      url: 'https://github.com/mayurbhalgama',
      icon: Github,
      color: 'hover:text-gray-900 dark:hover:text-white',
    },
    {
      name: 'LinkedIn',
      url: 'https://linkedin.com/in/mayurbhalgama',
      icon: Linkedin,
      color: 'hover:text-blue-600',
    },
    {
      name: 'Email',
      url: 'mailto:mayur@example.com',
      icon: Mail,
      color: 'hover:text-red-500',
    },
  ]

  return (
    <section
      id="hero"
      className="relative min-h-screen overflow-hidden bg-gradient-to-br from-background via-surface to-background pt-16 lg:pt-20"
      ref={ref}
    >
      {/* Animated background canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 opacity-20 sm:opacity-30"
        style={{ pointerEvents: 'none' }}
      />

      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-4rem)] lg:min-h-[calc(100vh-5rem)]">
        <div className="container mx-auto px-4 lg:px-8 py-16 sm:py-20 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            {/* Main heading */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-6"
            >
              <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold mb-4">
                <span className="block text-text">Hi, I&apos;m</span>
                <span className="block text-gradient bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Mayur Bhalgama
                </span>
              </h1>
            </motion.div>

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-text-secondary mb-8 max-w-3xl mx-auto leading-relaxed"
            >
              A passionate{' '}
              <motion.span
                className="text-primary font-semibold"
                animate={{
                  color: [
                    'var(--color-primary)',
                    'var(--color-secondary)',
                    'var(--color-primary)',
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                Software Engineer
              </motion.span>{' '}
              who creates innovative digital experiences with clean code and
              beautiful design.
            </motion.p>

            {/* Specialties */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-12"
            >
              {['React', 'Node.js', 'TypeScript', 'Full-Stack', 'UI/UX'].map(
                (skill, index) => (
                  <motion.span
                    key={skill}
                    className="px-3 py-2 sm:px-4 bg-surface border border-border rounded-full text-text-secondary text-xs sm:text-sm font-medium"
                    whileHover={{
                      scale: 1.05,
                      backgroundColor: 'var(--color-primary)',
                      color: 'var(--color-background)',
                    }}
                    transition={{ duration: 0.2 }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={inView ? { opacity: 1, scale: 1 } : {}}
                    style={{ transitionDelay: `${0.8 + index * 0.1}s` }}
                  >
                    {skill}
                  </motion.span>
                )
              )}
            </motion.div>

            {/* Call to action buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-12"
            >
              <motion.button
                onClick={() => scrollToSection('projects')}
                className="group bg-primary text-background px-6 py-3 sm:px-8 sm:py-4 rounded-lg font-semibold text-base sm:text-lg hover:bg-secondary transition-colors duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl w-full sm:w-auto justify-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>View My Work</span>
                <ExternalLink
                  size={18}
                  className="sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform duration-200"
                />
              </motion.button>

              <motion.button
                onClick={handleDownloadResume}
                className="group border-2 border-primary text-primary px-6 py-3 sm:px-8 sm:py-4 rounded-lg font-semibold text-base sm:text-lg hover:bg-primary hover:text-background transition-colors duration-200 flex items-center space-x-2 w-full sm:w-auto justify-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Download
                  size={18}
                  className="sm:w-5 sm:h-5 group-hover:translate-y-1 transition-transform duration-200"
                />
                <span>Download Resume</span>
              </motion.button>
            </motion.div>

            {/* Social links */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 1.0 }}
              className="flex justify-center space-x-4 sm:space-x-6 mb-12 sm:mb-16"
            >
              {socialLinks.map((social, index) => {
                const Icon = social.icon
                return (
                  <motion.a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-text-secondary text-xl sm:text-2xl transition-colors duration-200 ${social.color}`}
                    whileHover={{ scale: 1.2, y: -2 }}
                    whileTap={{ scale: 0.9 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 1.2 + index * 0.1, duration: 0.5 }}
                    aria-label={`Visit my ${social.name} profile`}
                  >
                    <Icon size={24} className="sm:w-7 sm:h-7" />
                  </motion.a>
                )
              })}
            </motion.div>

            {/* Scroll indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.8, delay: 1.4 }}
              className="flex flex-col items-center"
            >
              <p className="text-text-secondary text-xs sm:text-sm mb-4">
                Scroll to explore
              </p>
              <motion.button
                onClick={() => scrollToSection('about')}
                className="text-text-secondary hover:text-primary transition-colors duration-200"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                aria-label="Scroll to about section"
              >
                <ArrowDown size={20} className="sm:w-6 sm:h-6" />
              </motion.button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Floating geometric shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-24 h-24 sm:w-32 sm:h-32 border border-primary/20 rounded-full"
          animate={{
            rotate: 360,
            scale: [1, 1.1, 1],
          }}
          transition={{
            rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
            scale: { duration: 4, repeat: Infinity },
          }}
        />
        <motion.div
          className="absolute top-3/4 right-1/4 w-16 h-16 sm:w-24 sm:h-24 border border-secondary/20"
          animate={{
            rotate: -360,
            y: [0, -20, 0],
          }}
          transition={{
            rotate: { duration: 15, repeat: Infinity, ease: 'linear' },
            y: { duration: 3, repeat: Infinity },
          }}
        />
        <motion.div
          className="absolute top-1/2 right-1/6 w-12 h-12 sm:w-16 sm:h-16 bg-accent/10 rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 2.5, repeat: Infinity }}
        />
      </div>
    </section>
  )
}

export default Hero
