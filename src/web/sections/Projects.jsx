import { useState, useEffect, useMemo, useCallback, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { ExternalLink, Github, Calendar, Users, Star, X } from 'lucide-react'
import { LINKS } from '../../data/links'
import Select from '../ui/Select'
import Carousel from '../ui/Carousel'
import api from '../../services/api'

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
    title: 'CyBuild',
    description:
      'Industrial commissioning & project management platform: permits, assets, safety workflows, QA/QC, project controls, analytics, and handovers for large-scale construction.',
    category: 'Full-Stack',
    mainImage: '/images/cybuild_main_img.png',
    images: ['/images/cybuild_main_img.png', '/images/cybuild_img_1.png'],
    technologies: [
      // Frontend
      'React',
      'TypeScript',
      'Tailwind CSS',
      'Redux Toolkit',
      'React Query',
      'Axios',
      'D3.js',
      'ApexCharts',
      'Recharts',
      'VisX',
      'AG Grid',
      'React Select',
      'React DatePicker',
      'React Grid Layout',
      'Lucide React',
      'Leaflet',
      'Formik',
      'Yup',
      'XYFlow',
      // Backend
      'Django',
      'Django REST Framework',
      'PostgreSQL',
      'JWT Auth',
      'Celery',
      'Redis',
      'Django Channels',
      'Pandas',
      'OpenPyXL',
      'SendGrid',
      'Twilio',
    ],
    github: null,
    demo: null,
    featured: false,
    status: 'ongoing',
    duration: null,
    team: 'Team project',
    type: 'organization',
    highlights: [
      'Workflow engine for permits and safety procedures',
      'Multi-tenant architecture with role-based access',
      'Real-time collaboration via WebSockets',
      'Advanced analytics dashboards and reporting',
      'GIS mapping for assets and permits (Leaflet)',
      'Document management with versioning',
      'Mobile-responsive, field-ready interface',
    ],
    fullDescription:
      'CyBuild is a commissioning and project management platform for industrial construction. It manages permits, isolation schedules, SWMS safety workflows, QA/QC checklists, punch lists, asset and cable tracking, project controls (schedules, milestones, progress), and structured handovers. The backend is powered by Django, Django REST Framework, PostgreSQL, Celery/Redis, JWT, Channels (real-time), and data tooling (Pandas/OpenPyXL), with comms via SendGrid and Twilio. The frontend is built with React + TypeScript using Tailwind CSS, Redux Toolkit, React Query, and a rich UI toolkit (AG Grid, D3/ApexCharts/Recharts/VisX, React Select, DatePicker, Grid Layout, XYFlow). It includes GIS features with Leaflet, robust form/checklist builders, and an analytics layer for performance insights.',
    screenshots: [],
    metrics: null,
  },
  {
    id: 5,
    title: 'WoundCare Pro - HIPAA-Compliant Healthcare Platform',
    description:
      'Comprehensive HIPAA-compliant wound care management solution with web dashboard and mobile capabilities for healthcare providers.',
    category: 'Full-Stack',
    mainImage: '/images/byhh_main_img.png',
    images: ['/images/byhh_main_img.png'],
    technologies: [
      // Frontend
      'Next.js',
      'React',
      'TypeScript',
      'Bootstrap',
      'SASS/SCSS',
      'Redux Toolkit',
      'React Redux',
      'Redux Persist',
      'Formik',
      'Yup',
      'React Select',
      'React DatePicker',
      'React Dropzone',
      'React Toastify',
      // Auth & Security
      'Google OAuth',
      'JS Cookie',
      'HIPAA Compliance',
      // Infrastructure
      'Docker',
      'Kubernetes',
      'AWS CloudFront',
      'Harbor Registry',
      'SonarQube',
    ],
    github: null,
    demo: null,
    featured: true,
    status: 'completed',
    duration: null,
    team: 'Team project',
    type: 'organization',
    highlights: [
      'HIPAA-compliant wound care management with anatomical location mapping',
      'Comprehensive patient management with visit tracking and communication tools',
      'Next.js 14 with TypeScript, Redux Toolkit, and Bootstrap UI components',
      'Multi-environment Kubernetes deployments (Dev/QA/UAT)',
      'Google OAuth integration with secure session management',
      'Advanced form handling with Formik/Yup validation',
      'AWS CloudFront CDN for optimized media delivery',
      'Mobile-responsive design with touch-friendly healthcare interfaces',
    ],
    fullDescription:
      'WoundCare Pro is a comprehensive healthcare platform that combines a web dashboard with mobile capabilities to streamline wound tracking, assessment, and communication among healthcare teams. Built with Next.js 14 and TypeScript, it features a robust architecture with Redux Toolkit for state management, Bootstrap for responsive UI, and HIPAA-compliant security measures. The platform includes wound management with anatomical mapping, patient management systems, Google OAuth authentication, and is deployed across multiple Kubernetes environments with Docker containerization and AWS CloudFront CDN integration.',
    screenshots: [],
    metrics: null,
  },
  {
    id: 6,
    title: 'Menu Topspin - Digital Restaurant Ordering Platform',
    description:
      'React-based digital restaurant menu application with interactive browsing, order customization, cart management, and Stripe payment integration.',
    category: 'Full-Stack',
    mainImage: '/images/topspin_main_img.png',
    images: [
      '/images/topspin_main_img.png',
      '/images/topspin_img_1.png',
      '/images/topspin_img_2.png',
    ],
    technologies: [
      // Frontend
      'React',
      'React Router DOM',
      'Redux Toolkit',
      'React Redux',
      'RTK Query',
      'SASS',
      'Swiper',
      'React Loading Skeleton',
      // Payment
      'Stripe React',
      'Stripe JS',
      // Utilities
      'Moment.js',
      'React Intersection Observer',
      'Web Vitals',
      // Testing
      'Jest',
      'React Testing Library',
      // Build & Deploy
      'React Scripts',
      'Docker',
      'Kubernetes',
      'Petpooja-api',
    ],
    github: null,
    demo: null,
    featured: false,
    status: 'completed',
    duration: null,
    team: 'Team project',
    type: 'organization',
    highlights: [
      'Interactive menu browsing with category-based navigation and scroll synchronization',
      'Item customization with add-ons, ingredients, and quantity selection',
      'Shopping cart management with add, remove, and modify functionality',
      'Stripe-powered payment integration for secure checkout',
      'Redux Toolkit state management with RTK Query for API calls',
      'Performance optimized with React Intersection Observer',
      'Mobile-first responsive design with SASS styling',
      'Docker containerization with Kubernetes deployment',
    ],
    fullDescription:
      'Menu Topspin is a comprehensive digital restaurant menu application built with React 18 and modern web technologies. The platform features interactive menu browsing with smooth scroll synchronization, advanced item customization capabilities, and integrated shopping cart management. Built with Redux Toolkit for state management and RTK Query for efficient data fetching, it includes Stripe payment processing for secure transactions. The application emphasizes performance with React Intersection Observer for efficient scrolling and includes comprehensive testing with Jest and React Testing Library. Deployed using Docker containerization and Kubernetes orchestration for scalable restaurant operations.',
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

  // API state
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // UI state
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedProject, setSelectedProject] = useState(null)

  // Fetch projects from API
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await api.get('/projects', {
          params: {
            isActive: true,
            limit: 50, // Get all active projects
          },
        })

        // Transform API data to match existing component structure
        const projectsData = response.data.data.projects.map(project => {
          const images = project.images && project.images.length > 0 
            ? [...project.images] 
            : []
          const mainImage = project.mainImage || (images.length > 0 ? images[0] : null)
          
          return {
            id: project._id || project.id,
            title: project.title,
            description: project.description,
            fullDescription: project.fullDescription,
            category: project.category,
            status: project.status,
            type: project.type,
            technologies: project.technologies || [],
            highlights: project.highlights || [],
            images,
            mainImage,
            github: project.github,
            demo: project.demo,
            duration: project.duration,
            team: project.team,
            featured: project.featured || false,
            // For backward compatibility
            metrics: null,
            screenshots: []
          }
        })

        setProjects(projectsData)
      } catch (err) {
        console.error('Error fetching projects:', err)
        setError('Failed to load projects')
        // Fallback to static data on error
        const fallbackProjects = PROJECTS_DATA.map(p => {
          const images = p.images && p.images.length > 0 ? [...p.images] : []
          const mainImage = p.mainImage || (images.length > 0 ? images[0] : null)
          return { ...p, images, mainImage }
        })
        setProjects(fallbackProjects)
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [])

  // Memoize processed projects
  const processedProjects = useMemo(() => {
    return projects
  }, [projects])

  const categories = useMemo(() => [
    { id: 'all', label: 'All Projects', count: processedProjects.length },
    {
      id: 'Full-Stack',
      label: 'Full-Stack',
      count: processedProjects.filter(p => (p.category?.name || p.category) === 'Full-Stack').length,
    },
    {
      id: 'Frontend',
      label: 'Frontend',
      count: processedProjects.filter(p => (p.category?.name || p.category) === 'Frontend').length,
    },
    {
      id: 'Backend',
      label: 'Backend',
      count: processedProjects.filter(p => (p.category?.name || p.category) === 'Backend').length,
    },
    {
      id: 'Data Science',
      label: 'Data Science',
      count: processedProjects.filter(p => (p.category?.name || p.category) === 'Data Science').length,
    },
    {
      id: 'Mobile',
      label: 'Mobile',
      count: processedProjects.filter(p => (p.category?.name || p.category) === 'Mobile').length,
    },
    {
      id: 'DevOps',
      label: 'DevOps',
      count: processedProjects.filter(p => (p.category?.name || p.category) === 'DevOps').length,
    },
  ].filter(category => category.count > 0), [processedProjects])

  const filteredProjects = useMemo(() => {
    if (selectedCategory === 'all') return processedProjects
    return processedProjects.filter(project => (project.category?.name || project.category) === selectedCategory)
  }, [selectedCategory, processedProjects])

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
        <div className="relative w-full aspect-[16/10] overflow-hidden rounded-t-xl">
          {project.mainImage ? (
            <img
              src={project.mainImage}
              alt={project.title}
              className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
              onError={e => {
                e.target.style.display = 'none'
                e.target.parentElement.innerHTML = `
                  <div class="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                    <div class="text-center text-gray-500 dark:text-gray-400">
                      <div class="text-2xl mb-2">📷</div>
                      <div class="text-sm font-medium">Project Image</div>
                      <div class="text-xs">Not Available</div>
                    </div>
                  </div>
                `
              }}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <div className="text-2xl mb-2">📷</div>
                <div className="text-sm font-medium">Project Image</div>
                <div className="text-xs">Not Available</div>
              </div>
            </div>
          )}

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
                {project.category?.name || project.category}
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
                {tech?.name || tech}
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
                    {project.category?.name || project.category}
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
              {project.images && project.images.length > 0 ? (
                <div className="mb-6">
                  <Carousel images={project.images} altPrefix={project.title} />
                </div>
              ) : (
                <div className="mb-6">
                  <div className="w-full h-64 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-500 dark:text-gray-400">
                      <div className="text-4xl mb-2">📷</div>
                      <div className="text-lg font-medium">Project Images</div>
                      <div className="text-sm">Not Available</div>
                    </div>
                  </div>
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
                      {tech?.name || tech}
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
          {/* Loading state */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-text-secondary text-lg mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="text-primary hover:text-secondary transition-colors duration-200"
              >
                Try again
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-text">Projects</h2>
                  <p className="text-text-secondary">
                    {processedProjects.length > 0 
                      ? `${processedProjects.length} projects showcasing my work` 
                      : 'Selected personal and organization projects.'}
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
              {filteredProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {filteredProjects.map((project, index) => (
                    <ProjectCard key={project.id} project={project} index={index} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <p className="text-text-secondary text-lg">
                    {selectedCategory === 'all' 
                      ? 'No projects found.' 
                      : `No projects found in ${selectedCategory} category.`}
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal */}
        {!loading && (
          <ProjectModal project={selectedProject} onClose={handleCloseModal} />
        )}
      </div>
    </section>
  )
}

export default Projects
