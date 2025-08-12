import { motion } from 'framer-motion'
import { useState, useRef, useEffect } from 'react'
import { Download, MapPin, Calendar, Coffee, Code, Heart } from 'lucide-react'
import { useInView } from 'react-intersection-observer'

const About = () => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  })

  const [showLikeBurst, setShowLikeBurst] = useState(false)
  const [likeParticles, setLikeParticles] = useState([])
  const [showLikeHint, setShowLikeHint] = useState(true)
  const burstTimeoutRef = useRef(null)
  const lastBurstRef = useRef(0)
  const gradientIdRef = useRef(
    `igHeartGrad-${Math.random().toString(36).slice(2)}`
  )

  const GradientHeart = ({ size = 120 }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient
          id={gradientIdRef.current}
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#feda75" />
          <stop offset="30%" stopColor="#fa7e1e" />
          <stop offset="60%" stopColor="#d62976" />
          <stop offset="80%" stopColor="#962fbf" />
          <stop offset="100%" stopColor="#4f5bd5" />
        </linearGradient>
      </defs>
      <path
        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"
        fill={`url(#${gradientIdRef.current})`}
      />
    </svg>
  )

  useEffect(() => {
    const t = setTimeout(() => setShowLikeHint(false), 5000)
    return () => clearTimeout(t)
  }, [])

  const triggerLikeBurst = () => {
    // create small confetti hearts with random directions
    const num = 8
    const particles = Array.from({ length: num }).map(() => {
      const angle = Math.random() * Math.PI * 2
      const distance = 60 + Math.random() * 60
      const x = Math.cos(angle) * distance
      const y = Math.sin(angle) * distance
      const rot = (Math.random() - 0.5) * 60
      const delay = Math.random() * 0.1
      return { x, y, rot, delay }
    })
    setLikeParticles(particles)

    setShowLikeBurst(true)
    setShowLikeHint(false)
    if (burstTimeoutRef.current) clearTimeout(burstTimeoutRef.current)
    burstTimeoutRef.current = setTimeout(() => setShowLikeBurst(false), 3500)
  }

  const safeTriggerBurst = () => {
    const now = Date.now()
    if (now - lastBurstRef.current < 600) return
    lastBurstRef.current = now
    triggerLikeBurst()
  }

  const handleDownloadResume = () => {
    // Analytics tracking
    if (window.gtag) {
      window.gtag('event', 'file_download', {
        file_name: 'Mayur_s_resume.pdf',
        event_category: 'engagement',
        event_label: 'about_section',
      })
    }

    // Create download link
    const link = document.createElement('a')
    link.href = '/Mayur_s_resume.pdf'
    link.download = 'Mayur_Bhalgama_Resume.pdf'
    link.click()
  }

  const stats = [
    { number: '3+', label: 'Years Experience', icon: Calendar },
    { number: '20+', label: 'Projects Completed', icon: Code },
    { number: '1000+', label: 'Cups of Coffee', icon: Coffee },
    { number: '∞', label: 'Lines of Code', icon: Heart },
  ]

  const highlights = [
    'React.js, Next.js, JavaScript, HTML5, CSS3',
    'Reusable UI with Material UI, Ant Design, Tailwind CSS',
    'Application design, debugging, and performance improvement',
    'Front-end architecture and webpage optimization',
    'Strong client communication and requirement understanding',
    'Manual testing and issue resolution',
  ]

  return (
    <section id="about" className="py-20 lg:py-32 bg-surface/50" ref={ref}>
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-text mb-4">
              About Me
            </h2>
            <p className="text-xl text-text-secondary max-w-2xl mx-auto">
              Get to know the person behind the code
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Profile Image and Stats */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-8 order-2 lg:order-1"
            >
              {/* Profile Image */}
              <div className="relative">
                <motion.div
                  className="relative w-64 h-64 sm:w-72 sm:h-72 lg:w-80 lg:h-80 mx-auto"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Background decoration */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-full opacity-20 animate-pulse-slow" />
                  <div className="absolute -inset-4 bg-gradient-to-br from-primary/30 to-secondary/30 rounded-full blur-xl opacity-50" />

                  {/* Profile photo */}
                  <img
                    src="/images/profile-pic.jpg"
                    alt="Mayur Bhalgama - Software Engineer"
                    className="relative w-full h-full object-cover rounded-full border-4 border-background shadow-2xl select-none"
                    onError={e => {
                      // Fallback to placeholder if image doesn't exist
                      e.target.src = `data:image/svg+xml,${encodeURIComponent(`
                        <svg width="320" height="320" xmlns="http://www.w3.org/2000/svg">
                          <rect width="100%" height="100%" fill="#e2e8f0"/>
                          <circle cx="160" cy="130" r="40" fill="#64748b"/>
                          <path d="M100 260 Q160 220 220 260" fill="#64748b"/>
                          <text x="160" y="300" text-anchor="middle" font-family="Arial" font-size="12" fill="#64748b">Profile Photo</text>
                        </svg>
                      `)}`
                    }}
                    draggable={false}
                  />

                  {/* Instagram-like heart burst from bottom-left heart icon */}
                  {showLikeBurst && (
                    <>
                      {/* central gradient heart near heart icon */}
                      <motion.div
                        className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 pointer-events-none"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: [0.8, 1.25, 1], opacity: [0, 1, 0] }}
                        transition={{ duration: 2.2, ease: 'easeInOut' }}
                      >
                        <GradientHeart size={110} />
                      </motion.div>

                      {/* small confetti hearts flying out from heart icon */}
                      {likeParticles.map((p, i) => (
                        <motion.div
                          key={i}
                          className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 pointer-events-none"
                          initial={{
                            x: 0,
                            y: 0,
                            scale: 0.6,
                            rotate: 0,
                            opacity: 0,
                          }}
                          animate={{
                            x: p.x,
                            y: -p.y /* invert y so positive is upward visually */,
                            scale: [0.6, 1, 0.8],
                            rotate: p.rot,
                            opacity: [0, 1, 0],
                          }}
                          transition={{
                            duration: 2.8,
                            ease: 'easeOut',
                            delay: p.delay,
                          }}
                        >
                          <GradientHeart size={18} />
                        </motion.div>
                      ))}
                    </>
                  )}

                  {/* Floating badges */}
                  <motion.div
                    className="absolute -top-2 -right-2 sm:-top-4 sm:-right-4 bg-primary text-background p-2 sm:p-3 rounded-full shadow-lg"
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Code size={16} className="sm:w-5 sm:h-5" />
                  </motion.div>

                  <motion.button
                    type="button"
                    className="absolute -bottom-2 -left-2 sm:-bottom-4 sm:-left-4 bg-secondary text-background p-2 sm:p-3 rounded-full shadow-lg"
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                    onClick={safeTriggerBurst}
                    onDoubleClick={e => {
                      e.preventDefault()
                      safeTriggerBurst()
                    }}
                    aria-label="Like"
                  >
                    <Heart size={16} className="sm:w-5 sm:h-5" />
                  </motion.button>

                  {/* Hint near heart icon */}
                  {showLikeHint && (
                    <motion.div
                      className="absolute bottom-12 left-2 sm:bottom-14 sm:left-3 bg-surface/90 text-text border border-border rounded-full px-2.5 py-1 text-xs shadow-md pointer-events-none"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                    >
                      Tap
                    </motion.div>
                  )}
                </motion.div>

                {/* Location */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="flex items-center justify-center mt-6 text-text-secondary"
                >
                  <MapPin size={18} className="mr-2" />
                  <span>Ahmedabad, India</span>
                </motion.div>
              </div>

              {/* Stats Grid */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="grid grid-cols-2 gap-3 sm:gap-4"
              >
                {stats.map((stat, index) => {
                  const Icon = stat.icon
                  return (
                    <motion.div
                      key={stat.label}
                      className="bg-background border border-border rounded-lg p-4 sm:p-6 text-center hover:shadow-lg transition-shadow duration-200"
                      whileHover={{ scale: 1.05 }}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={inView ? { opacity: 1, scale: 1 } : {}}
                      transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                    >
                      <Icon
                        size={20}
                        className="sm:w-6 sm:h-6 text-primary mx-auto mb-2"
                      />
                      <div className="text-xl sm:text-2xl font-bold text-text mb-1">
                        {stat.number}
                      </div>
                      <div className="text-xs sm:text-sm text-text-secondary">
                        {stat.label}
                      </div>
                    </motion.div>
                  )
                })}
              </motion.div>
            </motion.div>

            {/* Bio and Content */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-6 sm:space-y-8 order-1 lg:order-2"
            >
              {/* Bio */}
              <div className="space-y-4 sm:space-y-6">
                <h3 className="text-xl sm:text-2xl font-bold text-text">
                  Crafting Digital Experiences
                </h3>

                <div className="space-y-4 text-text-secondary leading-relaxed text-sm sm:text-base">
                  <p>
                    I&apos;m a frontend-focused software engineer with 3+ years
                    of experience building modern web applications with React.js
                    and Next.js. I specialize in translating client requirements
                    into scalable, maintainable solutions.
                  </p>

                  <p>
                    I&apos;ve delivered responsive interfaces, reusable
                    component systems, and performance improvements across
                    multiple products. I care deeply about clean code,
                    usability, and accessibility.
                  </p>

                  <p>
                    I collaborate closely with stakeholders, maintain clear
                    communication, and enjoy shipping reliable features that
                    solve real problems.
                  </p>
                </div>
              </div>

              {/* Key Highlights */}
              <div>
                <h4 className="text-base sm:text-lg font-semibold text-text mb-4">
                  What I Do Best
                </h4>
                <div className="grid gap-3">
                  {highlights.map((highlight, index) => (
                    <motion.div
                      key={index}
                      className="flex items-start space-x-3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={inView ? { opacity: 1, x: 0 } : {}}
                      transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                    >
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <span className="text-text-secondary text-sm sm:text-base">
                        {highlight}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Download Resume Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 1.2 }}
                className="pt-4"
              >
                <motion.button
                  onClick={handleDownloadResume}
                  className="group bg-primary text-background px-6 py-3 sm:px-8 sm:py-4 rounded-lg font-semibold text-base sm:text-lg hover:bg-secondary transition-colors duration-200 flex items-center space-x-3 shadow-lg hover:shadow-xl w-full sm:w-auto justify-center"
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

              {/* Quote */}
              <motion.blockquote
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 1.4 }}
                className="border-l-4 border-primary pl-4 sm:pl-6 py-4 bg-surface/50 rounded-r-lg"
              >
                <p className="text-text-secondary italic text-base sm:text-lg">
                  &ldquo;Code is like humor. When you have to explain it,
                  it&apos;s bad.&rdquo;
                </p>
                <footer className="text-text text-sm mt-2">- Cory House</footer>
              </motion.blockquote>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default About
