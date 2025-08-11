import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Calendar, MapPin, ExternalLink, Award, TrendingUp } from 'lucide-react'

const Experience = () => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  })

  const experiences = [
    {
      id: 1,
      company: 'IndiaNIC Infotech Limited',
      position: 'Software Engineer',
      duration: 'June 2024 – Present',
      location: 'Ahmedabad, India',
      type: 'Full-time',
      logo: '/logos/indianic.png',
      website: 'https://www.indianic.com/',
      description:
        'Contributed to Cybuild (construction completions and permit system) with form builder modules, analytics dashboards using Chart.js, and multi-role access. Maintained direct client communication to gather requirements and refine UX.',
      achievements: [
        'Built analytics dashboards and role-based access modules',
        'Led client discussions for requirements and UX iterations',
        'Delivered reusable, responsive React components with API integration',
      ],
      technologies: ['React', 'Chart.js', 'REST APIs', 'Tailwind CSS'],
      highlights: [
        { metric: 'Multi-role', description: 'Access management' },
        { metric: 'Dashboards', description: 'Analytics reporting' },
        { metric: 'UX', description: 'Client feedback driven' },
      ],
    },
    {
      id: 2,
      company: 'Brainvire Infotech',
      position: 'UI Developer',
      duration: 'March 2023 – June 2024',
      location: 'Ahmedabad, India',
      type: 'Full-time',
      logo: '/logos/brainvire.png',
      website: 'https://www.brainvire.com/',
      description:
        'Built a browser-based PDF editor with annotations and collaborative features. Developed an online exam platform with role management and analytics. Led redesign of company website with modern responsive layouts and performance optimizations.',
      achievements: [
        'Implemented collaborative PDF annotation editor',
        'Shipped exam platform with roles, scheduling, and analytics',
        'Led responsive redesign with improved Lighthouse scores',
      ],
      technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Redux'],
      highlights: [
        { metric: 'Redesign', description: 'Website modernization' },
        { metric: 'Platform', description: 'Exam system launch' },
        { metric: 'Perf', description: 'Optimized UX' },
      ],
    },
    {
      id: 3,
      company: 'Virtual Height IT Services Pvt. Ltd.',
      position: 'React Developer',
      duration: 'Feb 2022 – Feb 2023',
      location: 'Ahmedabad, India',
      type: 'Full-time',
      logo: '/logos/virtual-height.png',
      website: 'https://www.virtualheight.com/',
      description:
        'Developed a B2B jewelry e-commerce platform with React, Redux-Saga, and MUI. Contributed to restaurant delivery app with geo search and order placement. Refactored legacy code and improved performance via lazy loading and code splitting.',
      achievements: [
        'Shipped B2B e-commerce features (catalog, cart, payments)',
        'Improved performance using code splitting and lazy loading',
        'Built responsive UIs from Figma/XD designs',
      ],
      technologies: ['React', 'Redux-Saga', 'Material UI', 'Tailwind CSS'],
      highlights: [
        { metric: 'E‑commerce', description: 'B2B platform' },
        { metric: 'Refactor', description: 'Reusable components' },
        { metric: 'UX', description: 'Responsive design' },
      ],
    },
  ]

  const education = [
    {
      id: 1,
      institution: 'Silver Oak College of Engineering and Technology',
      degree: 'B.Tech in Computer Science',
      duration: '2018 – 2022',
      location: 'Ahmedabad, India',
      gpa: 'CGPA: 8.00/10',
      logo: '/logos/socet.png',
      description:
        'Focused on core CS fundamentals and web development. Final year project: RTO applicant portal.',
      achievements: ['Built RTO applicant portal as final year project'],
    },
  ]

  const TimelineItem = ({ item, index, isLast, type = 'experience' }) => {
    return (
      <motion.div
        className="relative flex items-start space-x-4 sm:space-x-6 pb-8 sm:pb-12"
        initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.6, delay: index * 0.2 }}
      >
        {/* Timeline Line */}
        <div className="relative flex flex-col items-center">
          {/* Timeline Dot */}
          <motion.div
            className="w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-full flex items-center justify-center border-4 border-background shadow-lg z-10"
            whileHover={{ scale: 1.1 }}
            initial={{ scale: 0 }}
            animate={inView ? { scale: 1 } : {}}
            transition={{ duration: 0.3, delay: index * 0.2 + 0.3 }}
          >
            {type === 'experience' ? (
              <img
                src={item.logo}
                alt={`${item.company} logo`}
                className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover"
                onError={e => {
                  e.target.src = `data:image/svg+xml,${encodeURIComponent(`
                    <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                      <rect width="100%" height="100%" fill="#3B82F6"/>
                      <text x="50%" y="50%" text-anchor="middle" dy="0.3em" font-family="Arial" font-size="10" fill="white">${item.company.charAt(0)}</text>
                    </svg>
                  `)}`
                }}
              />
            ) : (
              <Award size={18} className="sm:w-5 sm:h-5 text-background" />
            )}
          </motion.div>

          {/* Timeline Line */}
          {!isLast && (
            <motion.div
              className="w-0.5 bg-border h-full absolute top-10 sm:top-12"
              initial={{ height: 0 }}
              animate={inView ? { height: '100%' } : {}}
              transition={{ duration: 0.8, delay: index * 0.2 + 0.5 }}
            />
          )}
        </div>

        {/* Content */}
        <motion.div
          className="flex-1 bg-surface border border-border rounded-lg p-4 sm:p-6 hover:shadow-lg transition-shadow duration-200"
          whileHover={{ scale: 1.02 }}
        >
          {/* Header */}
          <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:items-start sm:justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg sm:text-xl font-bold text-text mb-1">
                {type === 'experience' ? item.position : item.degree}
              </h3>
              <div className="flex items-center space-x-2 text-primary font-semibold">
                <span className="text-sm sm:text-base">
                  {type === 'experience' ? item.company : item.institution}
                </span>
                {item.website && (
                  <a
                    href={item.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-secondary transition-colors duration-200"
                    aria-label={`Visit ${item.company || item.institution} website`}
                  >
                    <ExternalLink size={14} className="sm:w-4 sm:h-4" />
                  </a>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:items-end">
              <div className="flex items-center text-text-secondary text-xs sm:text-sm mb-1">
                <Calendar size={12} className="sm:w-3.5 sm:h-3.5 mr-1" />
                <span>{item.duration}</span>
              </div>
              <div className="flex items-center text-text-secondary text-xs sm:text-sm mb-2">
                <MapPin size={12} className="sm:w-3.5 sm:h-3.5 mr-1" />
                <span>{item.location}</span>
              </div>
              {item.type && (
                <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full self-start sm:self-end">
                  {item.type}
                </span>
              )}
              {item.gpa && (
                <span className="text-text-secondary text-xs sm:text-sm mt-1">
                  GPA: {item.gpa}
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <p className="text-text-secondary mb-4 leading-relaxed text-sm sm:text-base">
            {item.description}
          </p>

          {/* Highlights */}
          {item.highlights && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4">
              {item.highlights.map((highlight, i) => (
                <div
                  key={i}
                  className="text-center bg-background/50 rounded-lg p-3"
                >
                  <div className="text-base sm:text-lg font-bold text-primary">
                    {highlight.metric}
                  </div>
                  <div className="text-xs text-text-secondary">
                    {highlight.description}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Achievements */}
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-text mb-2">
              Key Achievements:
            </h4>
            <ul className="space-y-1">
              {item.achievements.map((achievement, i) => (
                <li
                  key={i}
                  className="flex items-start space-x-2 text-xs sm:text-sm text-text-secondary"
                >
                  <TrendingUp
                    size={12}
                    className="sm:w-3.5 sm:h-3.5 text-primary mt-0.5 flex-shrink-0"
                  />
                  <span>{achievement}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Technologies */}
          {item.technologies && (
            <div>
              <h4 className="text-sm font-semibold text-text mb-2">
                Technologies Used:
              </h4>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {item.technologies.map((tech, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 bg-background border border-border rounded text-xs text-text-secondary hover:border-primary hover:text-primary transition-colors duration-200"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    )
  }

  return (
    <section id="experience" className="py-20 lg:py-32 bg-surface/50" ref={ref}>
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-text mb-4">
              Experience & Education
            </h2>
            <p className="text-xl text-text-secondary max-w-2xl mx-auto">
              My professional journey and academic background
            </p>
          </motion.div>

          {/* Experience Timeline */}
          <div className="mb-16">
            <motion.h3
              initial={{ opacity: 0, x: -30 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl sm:text-2xl font-bold text-text mb-8 flex items-center"
            >
              <div className="w-1 h-6 sm:h-8 bg-primary rounded-full mr-4" />
              Professional Experience
            </motion.h3>

            <div className="space-y-0">
              {experiences.map((experience, index) => (
                <TimelineItem
                  key={experience.id}
                  item={experience}
                  index={index}
                  isLast={index === experiences.length - 1}
                  type="experience"
                />
              ))}
            </div>
          </div>

          {/* Education Timeline */}
          <div>
            <motion.h3
              initial={{ opacity: 0, x: -30 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-xl sm:text-2xl font-bold text-text mb-8 flex items-center"
            >
              <div className="w-1 h-6 sm:h-8 bg-secondary rounded-full mr-4" />
              Education
            </motion.h3>

            <div className="space-y-0">
              {education.map((edu, index) => (
                <TimelineItem
                  key={edu.id}
                  item={edu}
                  index={index}
                  isLast={true}
                  type="education"
                />
              ))}
            </div>
          </div>

          {/* Call to Action */}
          {/* <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-center mt-16 p-6 sm:p-8 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border border-primary/20"
          >
            <h3 className="text-lg sm:text-xl font-bold text-text mb-4">
              Ready to Work Together?
            </h3>
            <p className="text-text-secondary mb-6 text-sm sm:text-base">
              I&apos;m always interested in new opportunities and exciting
              projects.
            </p>
            <motion.button
              onClick={() => {
                const element = document.getElementById('contact')
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' })
                }
              }}
              className="bg-primary text-background px-6 py-2.5 sm:px-8 sm:py-3 rounded-lg font-semibold hover:bg-secondary transition-colors duration-200 text-sm sm:text-base"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Get In Touch
            </motion.button>
          </motion.div> */}
        </div>
      </div>
    </section>
  )
}

export default Experience
