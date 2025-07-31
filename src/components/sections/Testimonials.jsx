import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import {
  ChevronLeft,
  ChevronRight,
  Quote,
  Star,
  Linkedin,
  Twitter,
} from 'lucide-react'

const Testimonials = () => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  })

  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  const testimonials = [
    {
      id: 1,
      name: 'Sarah Johnson',
      role: 'Product Manager',
      company: 'TechCorp Inc.',
      avatar: '/testimonials/sarah.jpg',
      content:
        'Working with John has been an absolute pleasure. His technical expertise and problem-solving skills are exceptional. He delivered our project ahead of schedule and exceeded all expectations.',
      rating: 5,
      project: 'E-commerce Platform',
      linkedin: 'https://linkedin.com/in/sarahjohnson',
      featured: true,
    },
    {
      id: 2,
      name: 'Michael Chen',
      role: 'CTO',
      company: 'StartupXYZ',
      avatar: '/testimonials/michael.jpg',
      content:
        "John's full-stack development skills are top-notch. He built our entire platform from scratch and his code quality is impeccable. A true professional who goes above and beyond.",
      rating: 5,
      project: 'Fintech Platform',
      twitter: 'https://twitter.com/michaelchen',
      featured: true,
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      role: 'Design Lead',
      company: 'Digital Agency Pro',
      avatar: '/testimonials/emily.jpg',
      content:
        'John has an excellent eye for translating designs into pixel-perfect code. His collaboration skills and attention to detail make him a joy to work with.',
      rating: 5,
      project: 'Agency Website Redesign',
      linkedin: 'https://linkedin.com/in/emilyrodriguez',
      featured: false,
    },
    {
      id: 4,
      name: 'David Kim',
      role: 'Founder',
      company: 'InnovateNow',
      avatar: '/testimonials/david.jpg',
      content:
        'John delivered exactly what we needed and more. His technical insights and suggestions significantly improved our product. Highly recommend for any complex development project.',
      rating: 5,
      project: 'SaaS Dashboard',
      linkedin: 'https://linkedin.com/in/davidkim',
      featured: false,
    },
    {
      id: 5,
      name: 'Lisa Thompson',
      role: 'Marketing Director',
      company: 'GrowthCo',
      avatar: '/testimonials/lisa.jpg',
      content:
        'The website John built for us increased our conversion rate by 40%. His understanding of both technical implementation and business goals is remarkable.',
      rating: 5,
      project: 'Marketing Website',
      twitter: 'https://twitter.com/lisathompson',
      featured: true,
    },
    {
      id: 6,
      name: 'Alex Rivera',
      role: 'CEO',
      company: 'FutureTech',
      avatar: '/testimonials/alex.jpg',
      content:
        'John is a rare find - a developer who truly understands the business side of technology. His solutions are not just technically sound but also strategically smart.',
      rating: 5,
      project: 'Corporate Platform',
      linkedin: 'https://linkedin.com/in/alexrivera',
      featured: false,
    },
  ]

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentIndex(prevIndex =>
        prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
      )
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlaying, testimonials.length])

  const nextTestimonial = () => {
    setCurrentIndex(prevIndex =>
      prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
    )
  }

  const prevTestimonial = () => {
    setCurrentIndex(prevIndex =>
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
    )
  }

  const goToTestimonial = index => {
    setCurrentIndex(index)
  }

  const currentTestimonial = testimonials[currentIndex]

  const TestimonialCard = ({ testimonial, isActive = false }) => {
    return (
      <motion.div
        className={`bg-surface border border-border rounded-xl p-6 sm:p-8 ${
          isActive ? 'shadow-xl' : 'opacity-60'
        }`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{
          opacity: isActive ? 1 : 0.6,
          scale: isActive ? 1 : 0.95,
          y: isActive ? 0 : 20,
        }}
        transition={{ duration: 0.5 }}
      >
        {/* Quote Icon */}
        <div className="text-primary mb-4 sm:mb-6">
          <Quote size={28} className="sm:w-8 sm:h-8" fill="currentColor" />
        </div>

        {/* Content */}
        <blockquote className="text-text-secondary text-base sm:text-lg leading-relaxed mb-4 sm:mb-6 italic">
          &ldquo;{testimonial.content}&rdquo;
        </blockquote>

        {/* Rating */}
        <div className="flex items-center space-x-1 mb-4 sm:mb-6">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={14}
              className={`sm:w-4 sm:h-4 ${
                i < testimonial.rating
                  ? 'text-yellow-400 fill-current'
                  : 'text-border'
              }`}
            />
          ))}
        </div>

        {/* Author Info */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <img
              src={testimonial.avatar}
              alt={testimonial.name}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-primary/20"
              onError={e => {
                e.target.src = `data:image/svg+xml,${encodeURIComponent(`
                  <svg width="48" height="48" xmlns="http://www.w3.org/2000/svg">
                    <rect width="100%" height="100%" fill="#e2e8f0"/>
                    <circle cx="24" cy="18" r="8" fill="#64748b"/>
                    <path d="M12 36 Q24 30 36 36" fill="#64748b"/>
                  </svg>
                `)}`
              }}
            />
            <div>
              <h4 className="font-semibold text-text text-sm sm:text-base">
                {testimonial.name}
              </h4>
              <p className="text-text-secondary text-xs sm:text-sm">
                {testimonial.role} at {testimonial.company}
              </p>
              <p className="text-primary text-xs font-medium">
                Project: {testimonial.project}
              </p>
            </div>
          </div>

          {/* Social Links */}
          <div className="flex space-x-2 justify-start sm:justify-end">
            {testimonial.linkedin && (
              <motion.a
                href={testimonial.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 sm:p-2 text-text-secondary hover:text-blue-600 transition-colors duration-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Linkedin size={14} className="sm:w-4 sm:h-4" />
              </motion.a>
            )}
            {testimonial.twitter && (
              <motion.a
                href={testimonial.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 sm:p-2 text-text-secondary hover:text-blue-400 transition-colors duration-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Twitter size={14} className="sm:w-4 sm:h-4" />
              </motion.a>
            )}
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <section
      id="testimonials"
      className="py-20 lg:py-32 bg-surface/50"
      ref={ref}
    >
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
              What Clients Say
            </h2>
            <p className="text-xl text-text-secondary max-w-2xl mx-auto">
              Don&apos;t just take my word for it - here&apos;s what my clients
              and colleagues have to say about working with me
            </p>
          </motion.div>

          {/* Main Testimonial Display */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative mb-8 sm:mb-12"
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
          >
            <div className="flex items-center justify-center space-x-4 sm:space-x-8">
              {/* Previous Button */}
              <motion.button
                onClick={prevTestimonial}
                className="p-2.5 sm:p-3 bg-background border border-border rounded-full text-text-secondary hover:text-primary hover:border-primary transition-colors duration-200 hidden md:flex items-center justify-center"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Previous testimonial"
              >
                <ChevronLeft size={20} className="sm:w-6 sm:h-6" />
              </motion.button>

              {/* Testimonial Card */}
              <div className="flex-1 max-w-4xl">
                <AnimatePresence mode="wait">
                  <TestimonialCard
                    key={currentTestimonial.id}
                    testimonial={currentTestimonial}
                    isActive={true}
                  />
                </AnimatePresence>
              </div>

              {/* Next Button */}
              <motion.button
                onClick={nextTestimonial}
                className="p-2.5 sm:p-3 bg-background border border-border rounded-full text-text-secondary hover:text-primary hover:border-primary transition-colors duration-200 hidden md:flex items-center justify-center"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Next testimonial"
              >
                <ChevronRight size={20} className="sm:w-6 sm:h-6" />
              </motion.button>
            </div>

            {/* Mobile Navigation */}
            <div className="flex md:hidden justify-center space-x-3 sm:space-x-4 mt-6">
              <motion.button
                onClick={prevTestimonial}
                className="p-2.5 bg-background border border-border rounded-full text-text-secondary hover:text-primary transition-colors duration-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ChevronLeft size={18} />
              </motion.button>
              <motion.button
                onClick={nextTestimonial}
                className="p-2.5 bg-background border border-border rounded-full text-text-secondary hover:text-primary transition-colors duration-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ChevronRight size={18} />
              </motion.button>
            </div>
          </motion.div>

          {/* Testimonial Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex justify-center space-x-2 mb-8 sm:mb-12"
          >
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToTestimonial(index)}
                className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all duration-200 ${
                  index === currentIndex
                    ? 'bg-primary scale-125'
                    : 'bg-border hover:bg-text-secondary'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </motion.div>

          {/* Featured Testimonials Grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <h3 className="text-xl sm:text-2xl font-bold text-text mb-6 sm:mb-8 text-center">
              Featured Reviews
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {testimonials
                .filter(t => t.featured)
                .slice(0, 3)
                .map((testimonial, index) => (
                  <motion.div
                    key={testimonial.id}
                    className="bg-background border border-border rounded-lg p-4 sm:p-6 hover:shadow-lg transition-shadow duration-200"
                    initial={{ opacity: 0, y: 20 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center space-x-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          className="sm:w-3.5 sm:h-3.5 text-yellow-400 fill-current"
                        />
                      ))}
                    </div>

                    <p className="text-text-secondary text-xs sm:text-sm mb-4 line-clamp-3">
                      &ldquo;{testimonial.content}&rdquo;
                    </p>

                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <img
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover"
                        onError={e => {
                          e.target.src = `data:image/svg+xml,${encodeURIComponent(`
                          <svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
                            <rect width="100%" height="100%" fill="#e2e8f0"/>
                            <circle cx="16" cy="12" r="5" fill="#64748b"/>
                            <path d="M8 24 Q16 20 24 24" fill="#64748b"/>
                          </svg>
                        `)}`
                        }}
                      />
                      <div>
                        <div className="font-medium text-text text-xs sm:text-sm">
                          {testimonial.name}
                        </div>
                        <div className="text-text-secondary text-xs">
                          {testimonial.company}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-12 sm:mt-16 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 text-center"
          >
            {[
              { number: '50+', label: 'Happy Clients' },
              { number: '100+', label: 'Projects Completed' },
              { number: '4.9/5', label: 'Average Rating' },
              { number: '98%', label: 'Client Retention' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                className="p-4 sm:p-6 bg-background border border-border rounded-lg"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: 1.0 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary mb-2">
                  {stat.number}
                </div>
                <div className="text-text-secondary text-xs sm:text-sm">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default Testimonials
