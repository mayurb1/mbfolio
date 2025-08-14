import { useState, useMemo, useCallback, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { ExternalLink, Github, Calendar, Users, Star, X } from 'lucide-react'
import { LINKS } from '../../data/links'
import Select from '../ui/Select'
import Carousel from '../ui/Carousel'

const GITHUB_PROFILE = LINKS.github

// Static projects data kept outside the component to preserve stable references
const PROJECTS_DATA = [
  {
    id: 1,
    title: 'RTO Applicant Portal',
    description:
      'Online portal to streamline RTO applicant submissions and processing with structured forms and status tracking.',
    category: 'Full-Stack',
    mainImage: '/projects/rto-portal.jpg',
    images: ['/projects/rto-portal.jpg'],
    technologies: [
      'React',
      'Redux',
      'Node.js',
      'Express',
      'MongoDB',
      'Tailwind CSS',
    ],
    github: GITHUB_PROFILE,
    demo: GITHUB_PROFILE,
    featured: true,
    status: 'completed',
    duration: '3 months',
    team: 'Team project',
    type: 'personal',
    highlights: [
      'Applicant workflow with validation and status updates',
      'Admin dashboard for processing requests',
      'Responsive UI with reusable components',
    ],
    fullDescription:
      'A capstone project implementing an end-to-end RTO application flow with role-based views, validations, and admin processing tools. Built with React on the frontend and Node/Express on the backend, following clean component patterns and accessible UI.',
    screenshots: [],
    metrics: null,
  },
  {
    id: 2,
    title: 'Calculator App',
    description:
      'A simple and clean calculator built with React focusing on keyboard support and responsive layout.',
    category: 'Frontend',
    mainImage: '/projects/calculator.jpg',
    images: ['/projects/calculator.jpg'],
    technologies: ['React', 'CSS3'],
    github: GITHUB_PROFILE,
    demo: GITHUB_PROFILE,
    featured: false,
    status: 'completed',
    duration: '1 week',
    team: 'Solo',
    type: 'personal',
    highlights: [
      'Keyboard accessible controls',
      'Responsive layout for mobile and desktop',
      'Clear error handling and input sanitization',
    ],
    fullDescription:
      'A lightweight calculator built with React and modern CSS. Prioritizes accessibility, responsiveness, and clean UI as per the design system.',
    screenshots: [],
    metrics: null,
  },
  {
    id: 3,
    title: 'Cloudemuse',
    description:
      'A polished weather experience with autosuggest search, geolocation, current conditions, forecasts, air quality, themes, favorites, and more — optimized for UX, accessibility, and performance.',
    category: 'Frontend',
    mainImage: '/images/cloudemuse_main_img.png',
    images: ['/images/cloudemuse_main_img.png'],
    technologies: [
      'React',
      'Vite',
      'Tailwind CSS',
      'OpenWeatherMap',
      'Open‑Meteo',
      'Netlify Functions',
      'lucide-react',
      'LocalStorage',
    ],
    github: 'https://github.com/mayurb1/cloudemuse',
    demo: 'https://cloudmuse.netlify.app/',
    featured: true,
    status: 'completed',
    duration: '1 week',
    team: 'Solo',
    type: 'personal',
    highlights: [
      'City search with debounced autosuggest and keyboard navigation',
      'Geolocation-based weather on load (if permitted)',
      'Current conditions: temp, condition, humidity, wind, icons',
      '5-day grouped forecast + next 24 hours hourly forecast',
      'Air quality: AQI, PM2.5, PM10',
      'Units toggle (°C/°F)',
      'Favorites with dropdown (add/select/remove) persisted in localStorage',
      'Theme system (light/dark) with animated toggle and dynamic backgrounds',
      'Loading and error states (spinner, skeletons, friendly errors)',
      'Responsive design from mobile to desktop',
      'Accessible UI (focus rings, aria labels)',
    ],
    fullDescription:
      'Cloudemuse delivers a modern, accessible weather dashboard with a polished search experience, geolocation on load, detailed current conditions, 5-day and hourly forecasts, and air quality insights. It features favorites with persistence, animated theme toggle with dynamic weather-aware backgrounds, and robust loading/error states. Data comes primarily from OpenWeatherMap with Open‑Meteo as a fallback (including geocoding and air quality). A Netlify Functions proxy safeguards API keys in production, while the app ships via Vite, styled with Tailwind CSS, and uses lucide-react for icons. Built with strong UX and performance in mind.',
    screenshots: [],
    metrics: null,
  },
  // Organization projects from resume (confidential: no public links)
  {
    id: 4,
    title: 'Cybuild WebApp',
    description:
      'Construction completions and permit system with form builder modules, analytics dashboards, and multi-role access management.',
    category: 'Frontend',
    mainImage: '/projects/cybuild.jpg',
    images: ['/projects/cybuild.jpg'],
    technologies: ['React', 'Chart.js', 'REST APIs'],
    github: null,
    demo: null,
    featured: false,
    status: 'ongoing',
    duration: null,
    team: 'Team project',
    type: 'organization',
    highlights: [
      'Built form builder modules',
      'Analytics dashboards with Chart.js',
      'Multi-role access management',
    ],
    fullDescription:
      'Contributed to Cybuild by developing key UI modules and analytics, collaborating closely with stakeholders to refine UX based on feedback.',
    screenshots: [],
    metrics: null,
  },
  {
    id: 5,
    title: 'BYHH - Hospital Management System',
    description:
      'Patient management system for visit histories, wound tracking, structured assessments, and notifications.',
    category: 'Frontend',
    mainImage: '/images/byhh_main_img.png',
    images: ['/images/byhh_main_img.png'],
    technologies: ['React', 'Reusable Components', 'REST APIs'],
    github: null,
    demo: null,
    featured: false,
    status: 'ongoing',
    duration: null,
    team: 'Team project',
    type: 'organization',
    highlights: [
      'Structured medical assessments and notifications',
      'Reusable component-driven React UI',
      'Seamless API data flow',
    ],
    fullDescription:
      'Built a comprehensive React-based UI for a hospital system ensuring consistent UX and smooth API integrations for core patient workflows.',
    screenshots: [],
    metrics: null,
  },
  {
    id: 6,
    title: 'Topspin Menu App',
    description:
      'In-house food ordering system with PetPooja API integration, real-time listings, add-to-cart, and category filtering.',
    category: 'Frontend',
    mainImage: '/projects/topspin-menu.jpg',
    images: ['/projects/topspin-menu.jpg'],
    technologies: ['React', 'PetPooja API', 'Responsive UI'],
    github: null,
    demo: null,
    featured: false,
    status: 'completed',
    duration: null,
    team: 'Team project',
    type: 'organization',
    highlights: [
      'Real-time listings and add-to-cart',
      'Category-based filtering',
      'Mobile-optimized and QR-accessible UI',
    ],
    fullDescription:
      'Delivered a mobile-first ordering experience for a cafe with third-party API integration and streamlined item discovery and checkout.',
    screenshots: [],
    metrics: null,
  },
  {
    id: 7,
    title: 'Browser-based PDF Editor',
    description:
      'PDF editor with annotation tools and collaborative editing features.',
    category: 'Frontend',
    mainImage: '/projects/pdf-editor.jpg',
    images: ['/projects/pdf-editor.jpg'],
    technologies: ['React'],
    github: null,
    demo: null,
    featured: false,
    status: 'completed',
    duration: null,
    team: 'Team project',
    type: 'organization',
    highlights: [
      'Annotation tools and collaboration',
      'Built with React following component standards',
    ],
    fullDescription:
      'Designed and implemented a web-based PDF editor enabling annotations and collaboration directly in the browser.',
    screenshots: [],
    metrics: null,
  },
  {
    id: 8,
    title: 'Online Exam Platform',
    description:
      'Role-based exam system with randomized questions, time-bound sessions, scheduling, and analytics dashboards.',
    category: 'Full-Stack',
    mainImage: '/projects/exam-platform.jpg',
    images: ['/projects/exam-platform.jpg'],
    technologies: ['React', 'Role Management'],
    github: null,
    demo: null,
    featured: false,
    status: 'completed',
    duration: null,
    team: 'Team project',
    type: 'organization',
    highlights: [
      'Student/Teacher/Admin role management',
      'Randomized questions and timed sessions',
      'Scheduling and analytics dashboards',
    ],
    fullDescription:
      'Implemented core UI and flows for a scalable exam platform with role-based features and robust assessment tooling.',
    screenshots: [],
    metrics: null,
  },
  {
    id: 9,
    title: 'B2B Jewelry E-commerce Platform',
    description:
      'Enterprise e-commerce with product catalogs, cart, user dashboards, and payment flows.',
    category: 'Frontend',
    mainImage: '/projects/jewelry-b2b.jpg',
    images: ['/projects/jewelry-b2b.jpg'],
    technologies: ['React', 'Redux-Saga', 'Material UI'],
    github: null,
    demo: null,
    featured: false,
    status: 'completed',
    duration: null,
    team: 'Team project',
    type: 'organization',
    highlights: [
      'Catalogs, cart, and dashboards',
      'Payment flows and performance improvements',
    ],
    fullDescription:
      'Developed core B2B storefront experiences using React, state management with Redux-Saga, and Material UI components.',
    screenshots: [],
    metrics: null,
  },
  {
    id: 10,
    title: 'Restaurant Delivery Application',
    description:
      'Geo-based restaurant search, order placement, and cart management.',
    category: 'Frontend',
    mainImage: '/projects/restaurant-delivery.jpg',
    images: ['/projects/restaurant-delivery.jpg'],
    technologies: ['React'],
    github: null,
    demo: null,
    featured: false,
    status: 'completed',
    duration: null,
    team: 'Team project',
    type: 'organization',
    highlights: [
      'Geo-based discovery and ordering',
      'Cart management and responsive UI',
    ],
    fullDescription:
      'Contributed to a delivery platform focusing on smooth ordering flows and performant list rendering.',
    screenshots: [],
    metrics: null,
  },
]

// Generate three placeholder images for a given project id
const makePlaceholders = projectId => [
  `https://picsum.photos/seed/project-${projectId}-1/1200/675`,
  `https://picsum.photos/seed/project-${projectId}-2/1200/675`,
  `https://picsum.photos/seed/project-${projectId}-3/1200/675`,
]

const Projects = () => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  })

  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedProject, setSelectedProject] = useState(null)

  // Ensure every project has a main image and multiple images (dummy placeholders for now)
  const projects = useMemo(() => {
    return PROJECTS_DATA.map(p => {
      const placeholders = makePlaceholders(p.id)
      const images =
        p.images && p.images.length > 0 ? [...p.images] : placeholders
      const mainImage = p.mainImage || images[0]
      return { ...p, images, mainImage }
    })
  }, [])

  const categories = [
    { id: 'all', label: 'All Projects', count: projects.length },
    {
      id: 'Full-Stack',
      label: 'Full-Stack',
      count: projects.filter(p => p.category === 'Full-Stack').length,
    },
    {
      id: 'Frontend',
      label: 'Frontend',
      count: projects.filter(p => p.category === 'Frontend').length,
    },
    {
      id: 'Backend',
      label: 'Backend',
      count: projects.filter(p => p.category === 'Backend').length,
    },
    {
      id: 'Data Science',
      label: 'Data Science',
      count: projects.filter(p => p.category === 'Data Science').length,
    },
  ]

  const filteredProjects = useMemo(() => {
    if (selectedCategory === 'all') return projects
    return projects.filter(project => project.category === selectedCategory)
  }, [selectedCategory, projects])

  const handleSelectProject = useCallback(
    project => setSelectedProject(project),
    []
  )
  const handleCloseModal = useCallback(() => setSelectedProject(null), [])

  const ProjectCard = memo(({ project, index }) => {
    const isOrganization = project.type === 'organization'

    return (
      <motion.div
        className="group bg-surface border border-border rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        whileHover={{ y: -5 }}
        onClick={() => handleSelectProject(project)}
      >
        {/* Project Image */}
        <div className="relative h-40 sm:h-48 md:h-52 overflow-hidden">
          <img
            src={project.mainImage || (project.images && project.images[0])}
            alt={project.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            onError={e => {
              e.target.src = `data:image/svg+xml,${encodeURIComponent(`
                <svg width="400" height="200" xmlns="http://www.w3.org/2000/svg">
                  <rect width="100%" height="100%" fill="#e2e8f0"/>
                  <text x="50%" y="50%" text-anchor="middle" dy="0.3em" font-family="Arial" font-size="16" fill="#64748b">Project Image</text>
                </svg>
              `)}`
            }}
          />

          {/* Overlay removed as requested */}

          {/* Status Badge */}
          <div className="absolute top-4 left-4">
            <span
              className={`px-2 py-1 rounded-full text-xs font-semibold border ${
                project.status === 'completed'
                  ? 'bg-green-500 text-white border-green-600'
                  : project.status === 'ongoing'
                    ? 'bg-blue-500 text-white border-blue-600'
                    : 'bg-yellow-500 text-slate-900 border-yellow-600'
              }`}
            >
              {project.status}
            </span>
          </div>

          {/* Featured Badge */}
          {project.featured && (
            <div className="absolute top-4 right-4">
              <span className="flex items-center space-x-1 px-2 py-1 bg-primary text-background border border-primary rounded-full text-xs font-semibold">
                <Star size={12} fill="currentColor" />
                <span>Featured</span>
              </span>
            </div>
          )}
        </div>

        {/* Project Info */}
        <div className="p-6">
          <div className="mb-3">
            <h3 className="text-lg sm:text-xl font-bold text-text group-hover:text-primary transition-colors duration-200 truncate">
              {project.title}
            </h3>
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <span className="px-2 py-1 bg-background border border-border rounded text-xs text-text-secondary">
                {project.category}
              </span>
              <span className="px-2 py-1 bg-background border border-border rounded text-xs text-text-secondary">
                {project.type === 'organization' ? 'Organization' : 'Personal'}
              </span>
            </div>
          </div>

          <p className="text-text-secondary mb-4 leading-relaxed text-sm sm:text-base line-clamp-2">
            {project.description}
          </p>

          {/* Technologies */}
          <div className="flex flex-wrap gap-2 mb-4">
            {project.technologies.slice(0, 3).map((tech, i) => (
              <span
                key={i}
                className="px-2 py-1 bg-background border border-border rounded text-xs text-text-secondary"
              >
                {tech}
              </span>
            ))}
            {project.technologies.length > 3 && (
              <span className="px-2 py-1 bg-background border border-border rounded text-xs text-text-secondary">
                +{project.technologies.length - 3} more
              </span>
            )}
          </div>

          {/* Project Stats */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-sm text-text-secondary">
            <div className="flex items-center gap-4 flex-wrap">
              {project.duration && (
                <div className="flex items-center space-x-1">
                  <Calendar size={14} />
                  <span>{project.duration}</span>
                </div>
              )}
              {project.team && (
                <div className="flex items-center space-x-1">
                  <Users size={14} />
                  <span>{project.team}</span>
                </div>
              )}
            </div>

            <div className="flex space-x-2">
              {!isOrganization && project.github && (
                <motion.button
                  className="p-2 hover:bg-background rounded-full transition-colors duration-200"
                  whileHover={{ scale: 1.1 }}
                  onClick={e => {
                    e.stopPropagation()
                    window.open(project.github, '_blank')
                  }}
                >
                  <Github size={16} />
                </motion.button>
              )}
              {!isOrganization && project.demo && (
                <motion.button
                  className="p-2 hover:bg-background rounded-full transition-colors duration-200"
                  whileHover={{ scale: 1.1 }}
                  onClick={e => {
                    e.stopPropagation()
                    window.open(project.demo, '_blank')
                  }}
                >
                  <ExternalLink size={16} />
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    )
  })
  ProjectCard.displayName = 'ProjectCard'

  const ProjectModal = memo(({ project, onClose }) => {
    if (!project) return null

    return (
      <AnimatePresence>
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-background rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div>
                <h2 className="text-2xl font-bold text-text">
                  {project.title}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-1 bg-background border border-border rounded text-xs text-text-secondary">
                    {project.category}
                  </span>
                  <span className="px-2 py-1 bg-background border border-border rounded text-xs text-text-secondary">
                    {project.type === 'organization'
                      ? 'Organization'
                      : 'Personal'}
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-surface rounded-full transition-colors duration-200"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Media Carousel */}
              {project.images && project.images.length > 0 && (
                <div className="mb-6">
                  <Carousel images={project.images} altPrefix={project.title} />
                </div>
              )}

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-text mb-3">
                  About This Project
                </h3>
                <p className="text-text-secondary leading-relaxed">
                  {project.fullDescription}
                </p>
              </div>

              {/* Highlights */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-text mb-3">
                  Key Highlights
                </h3>
                <ul className="space-y-2">
                  {project.highlights.map((highlight, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <Star
                        size={16}
                        className="text-primary mt-0.5 flex-shrink-0"
                      />
                      <span className="text-text-secondary">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Technologies */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-text mb-3">
                  Technologies Used
                </h3>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-surface border border-border rounded-full text-sm text-text-secondary"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Metrics */}
              {project.metrics && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-text mb-3">
                    Impact & Metrics
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.entries(project.metrics).map(([key, value]) => (
                      <div
                        key={key}
                        className="text-center p-3 bg-surface rounded-lg"
                      >
                        <div className="text-xl font-bold text-primary">
                          {value}
                        </div>
                        <div className="text-sm text-text-secondary capitalize">
                          {key}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    )
  })
  ProjectModal.displayName = 'ProjectModal'

  return (
    <section id="projects" className="py-20 lg:py-32 bg-background" ref={ref}>
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-text">Projects</h2>
              <p className="text-text-secondary">
                Selected personal and organization projects.
              </p>
            </div>

            {/* Filter Select */}
            <div className="w-48">
              <Select
                id="project-category"
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.label} ({category.count})
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {/* Project Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredProjects.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index} />
            ))}
          </div>
        </div>

        {/* Modal */}
        <ProjectModal project={selectedProject} onClose={handleCloseModal} />
      </div>
    </section>
  )
}

export default Projects
