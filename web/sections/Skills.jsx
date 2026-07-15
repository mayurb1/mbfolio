'use client'

import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { SkillsSkeleton, SectionHeaderSkeleton } from '../ui/SkeletonLoader'
import EmptyState from '../ui/EmptyState'
import { useApiResource } from '../../hooks/useApiResource'

// Smooth animation variants for chips
const chipsContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.15 },
  },
}

const chipItem = {
  hidden: { opacity: 0, y: 12, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 260, damping: 20, mass: 0.6 },
  },
}

const Skills = () => {
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true })

  // Fetch skills from API
  const { data: skills, loading } = useApiResource('/skills', {
    params: {
      isActive: true,
      limit: 100, // Get all active skills
    },
    // Extract skill names from the response
    transform: response => response.data.data.skills.map(skill => skill.name),
    fallback: [],
  })

  return (
    <section id="skills" className="py-16 lg:py-24 bg-background" ref={ref}>
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <>
              <SectionHeaderSkeleton />
              <SkillsSkeleton count={12} />
            </>
          ) : (
            <>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6 }}
                className="text-center mb-12 sm:mb-16"
              >
                <h2 className="text-3xl lg:text-4xl font-bold text-text mb-4">
                  Skills & Tools
                </h2>
                <p className="text-xl text-text-secondary max-w-2xl mx-auto">
                  A selection of technologies I use to craft modern web experiences
                </p>
              </motion.div>

              {/* Animated Chips */}
              {skills.length > 0 ? (
            <motion.div
              variants={chipsContainer}
              initial="hidden"
              animate={inView ? 'show' : 'hidden'}
              className="flex flex-wrap gap-3 sm:gap-4 justify-center"
            >
              {skills.map(tech => (
                <motion.span
                  key={tech}
                  variants={chipItem}
                  className="px-4 py-2 bg-surface border border-border rounded-full text-text-secondary hover:text-background hover:bg-primary transition-colors duration-200 shadow-sm will-change-transform"
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                  style={{
                    WebkitBackfaceVisibility: 'hidden',
                    backfaceVisibility: 'hidden',
                  }}
                >
                  {tech}
                </motion.span>
              ))}
            </motion.div>
              ) : (
                <EmptyState
                  message="No skills found"
                  textClassName="text-xl text-text-secondary"
                />
              )}
            </>
          )}
        </div>
      </div>
    </section>
  )
}

export default Skills