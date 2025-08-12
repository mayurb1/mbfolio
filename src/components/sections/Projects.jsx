import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import {
  ExternalLink,
  Github,
  Calendar,
  Users,
  Star,
  Filter,
  X,
  Play,
  Code,
  Eye,
} from 'lucide-react'
import { LINKS } from '../../data/links'

const GITHUB_PROFILE = LINKS.github

const Projects = () => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  })

  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedProject, setSelectedProject] = useState(null)

  const projects = [
    {
      id: 1,
      title: 'RTO Applicant Portal',
      description:
        'Online portal to streamline RTO applicant submissions and processing with structured forms and status tracking.',
      category: 'Full-Stack',
      image: '/projects/rto-portal.jpg',
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
      image: '/projects/calculator.jpg',
      technologies: ['React', 'CSS3'],
      github: GITHUB_PROFILE,
      demo: GITHUB_PROFILE,
      featured: false,
      status: 'completed',
      duration: '1 week',
      team: 'Solo',
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
      title: 'Weather Data App',
      description:
        'Fetches and displays real-time weather updates with a clean UI and location-based search.',
      category: 'Frontend',
      image: '/projects/weather-data.jpg',
      technologies: ['React', 'OpenWeather API', 'Tailwind CSS'],
      github: GITHUB_PROFILE,
      demo: GITHUB_PROFILE,
      featured: true,
      status: 'completed',
      duration: '1 week',
      team: 'Solo',
      highlights: [
        'Real-time weather fetching and display',
        'Search by city/location',
        'Mobile-first, responsive interface',
      ],
      fullDescription:
        'A small app to retrieve weather data from public APIs and present it in an accessible, responsive dashboard with clear typography and color usage.',
      screenshots: [],
      metrics: null,
    },
  ]

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

  const ProjectCard = ({ project, index }) => {
    return (
      <motion.div
        className="group bg-surface border border-border rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        whileHover={{ y: -5 }}
        onClick={() => setSelectedProject(project)}
      >
        {/* Project Image */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={project.image}
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

          {/* Overlay */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="flex space-x-4">
              <motion.button
                className="p-3 bg-white/20 rounded-full text-white hover:bg-white/30 transition-colors duration-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={e => {
                  e.stopPropagation()
                  window.open(project.demo, '_blank')
                }}
              >
                <Eye size={20} />
              </motion.button>
              <motion.button
                className="p-3 bg-white/20 rounded-full text-white hover:bg-white/30 transition-colors duration-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={e => {
                  e.stopPropagation()
                  window.open(project.github, '_blank')
                }}
              >
                <Github size={20} />
              </motion.button>
            </div>
          </div>

          {/* Status Badge */}
          <div className="absolute top-4 left-4">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                project.status === 'completed'
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : project.status === 'ongoing'
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
              }`}
            >
              {project.status}
            </span>
          </div>

          {/* Featured Badge */}
          {project.featured && (
            <div className="absolute top-4 right-4">
              <span className="flex items-center space-x-1 px-2 py-1 bg-primary/20 text-primary border border-primary/30 rounded-full text-xs font-medium">
                <Star size={12} fill="currentColor" />
                <span>Featured</span>
              </span>
            </div>
          )}
        </div>

        {/* Project Info */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xl font-bold text-text group-hover:text-primary transition-colors duration-200">
              {project.title}
            </h3>
            <span className="px-2 py-1 bg-background border border-border rounded text-xs text-text-secondary">
              {project.category}
            </span>
          </div>

          <p className="text-text-secondary mb-4 leading-relaxed">
            {project.description}
          </p>

          {/* Technologies */}
          <div className="flex flex-wrap gap-2 mb-4">
            {project.technologies.slice(0, 4).map((tech, i) => (
              <span
                key={i}
                className="px-2 py-1 bg-background border border-border rounded text-xs text-text-secondary"
              >
                {tech}
              </span>
            ))}
            {project.technologies.length > 4 && (
              <span className="px-2 py-1 bg-background border border-border rounded text-xs text-text-secondary">
                +{project.technologies.length - 4} more
              </span>
            )}
          </div>

          {/* Project Stats */}
          <div className="flex items-center justify-between text-sm text-text-secondary">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Calendar size={14} />
                <span>{project.duration}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users size={14} />
                <span>{project.team}</span>
              </div>
            </div>

            <div className="flex space-x-2">
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
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  const ProjectModal = ({ project, onClose }) => {
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
                <p className="text-text-secondary">{project.category}</p>
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
              {/* Screenshots */}
              {project.screenshots && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {project.screenshots.map((screenshot, index) => (
                    <img
                      key={index}
                      src={screenshot}
                      alt={`${project.title} screenshot ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg"
                      onError={e => {
                        e.target.src = `data:image/svg+xml,${encodeURIComponent(`
                          <svg width="400" height="200" xmlns="http://www.w3.org/2000/svg">
                            <rect width="100%" height="100%" fill="#e2e8f0"/>
                            <text x="50%" y="50%" text-anchor="middle" dy="0.3em" font-family="Arial" font-size="16" fill="#64748b">Screenshot ${index + 1}</text>
                          </svg>
                        `)}`
                      }}
                    />
                  ))}
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
                    Project Metrics
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

              {/* Actions */}
              <div className="flex space-x-4">
                <motion.a
                  href={project.demo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 bg-primary text-background px-6 py-3 rounded-lg font-semibold hover:bg-secondary transition-colors duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Play size={20} />
                  <span>View Demo</span>
                </motion.a>
                <motion.a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 border border-border text-text px-6 py-3 rounded-lg font-semibold hover:bg-surface transition-colors duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Code size={20} />
                  <span>View Code</span>
                </motion.a>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    )
  }

  return (
    <section id="projects" className="py-20 lg:py-32 bg-background" ref={ref}>
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
              Featured Projects
            </h2>
            <p className="text-xl text-text-secondary max-w-2xl mx-auto">
              A showcase of my best work across different technologies and
              domains
            </p>
          </motion.div>

          {/* Category Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap justify-center gap-2 sm:gap-2 mb-12"
          >
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-1.5 sm:space-x-2 px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-medium transition-colors duration-200 text-xs sm:text-sm ${
                  selectedCategory === category.id
                    ? 'bg-primary text-background'
                    : 'bg-surface border border-border text-text-secondary hover:text-text hover:bg-background'
                }`}
              >
                <Filter size={14} className="sm:w-4 sm:h-4" />
                <span>{category.label}</span>
                <span className="text-xs opacity-70">({category.count})</span>
              </button>
            ))}
          </motion.div>

          {/* Projects Grid */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            layout
          >
            <AnimatePresence mode="wait">
              {filteredProjects.map((project, index) => (
                <ProjectCard key={project.id} project={project} index={index} />
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-center mt-16"
          >
            <h3 className="text-2xl font-bold text-text mb-4">
              Want to see more?
            </h3>
            <p className="text-text-secondary mb-6">
              Check out my GitHub profile for more projects and contributions.
            </p>
            <motion.a
              href={GITHUB_PROFILE}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 bg-primary text-background px-8 py-3 rounded-lg font-semibold hover:bg-secondary transition-colors duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Github size={20} />
              <span>View GitHub Profile</span>
            </motion.a>
          </motion.div>
        </div>
      </div>

      {/* Project Modal */}
      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </section>
  )
}

export default Projects
