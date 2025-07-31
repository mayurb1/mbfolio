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
      title: 'E-Commerce Platform',
      description:
        'A comprehensive e-commerce solution with real-time inventory management, payment processing, and admin dashboard.',
      category: 'Full-Stack',
      image: '/projects/ecommerce.jpg',
      technologies: [
        'React',
        'Node.js',
        'PostgreSQL',
        'Stripe',
        'Redux',
        'Express',
      ],
      github: 'https://github.com/mayurbhalgama/ecommerce-platform',
      demo: 'https://ecommerce-demo.mayurbhalgama.dev',
      featured: true,
      status: 'completed',
      duration: '3 months',
      team: 'Solo',
      highlights: [
        'Built scalable microservices architecture',
        'Integrated secure payment processing with Stripe',
        'Implemented real-time inventory tracking',
        'Created responsive admin dashboard',
      ],
      fullDescription:
        'This full-stack e-commerce platform was built to handle high-traffic scenarios with a focus on user experience and security. The project includes features like user authentication, product catalog management, shopping cart functionality, order processing, and payment integration. The backend is built with Node.js and Express, using PostgreSQL for data persistence and Redis for caching.',
      screenshots: [
        '/projects/ecommerce-1.jpg',
        '/projects/ecommerce-2.jpg',
        '/projects/ecommerce-3.jpg',
      ],
      metrics: {
        users: '10K+',
        performance: '98/100',
        uptime: '99.9%',
      },
    },
    {
      id: 2,
      title: 'Task Management App',
      description:
        'A collaborative task management application with real-time updates, team collaboration, and progress tracking.',
      category: 'Frontend',
      image: '/projects/taskapp.jpg',
      technologies: [
        'React',
        'TypeScript',
        'Socket.io',
        'Firebase',
        'Material-UI',
      ],
      github: 'https://github.com/mayurbhalgama/task-manager',
      demo: 'https://tasks.mayurbhalgama.dev',
      featured: true,
      status: 'completed',
      duration: '2 months',
      team: '2 developers',
      highlights: [
        'Real-time collaboration with Socket.io',
        'Drag-and-drop task management',
        'Team progress analytics',
        'Mobile-responsive design',
      ],
      fullDescription:
        'A modern task management application that enables teams to collaborate effectively. Features include real-time updates, drag-and-drop interfaces, file attachments, commenting system, and comprehensive analytics dashboard. Built with React and TypeScript for type safety and maintainability.',
      screenshots: ['/projects/taskapp-1.jpg', '/projects/taskapp-2.jpg'],
      metrics: {
        users: '5K+',
        performance: '95/100',
        satisfaction: '4.8/5',
      },
    },
    {
      id: 3,
      title: 'Weather Dashboard',
      description:
        'A beautiful weather application with detailed forecasts, interactive maps, and location-based recommendations.',
      category: 'Frontend',
      image: '/projects/weather.jpg',
      technologies: [
        'Vue.js',
        'Vuex',
        'Chart.js',
        'OpenWeather API',
        'Leaflet',
      ],
      github: 'https://github.com/mayurbhalgama/weather-dashboard',
      demo: 'https://weather.mayurbhalgama.dev',
      featured: false,
      status: 'completed',
      duration: '1 month',
      team: 'Solo',
      highlights: [
        'Interactive weather maps',
        'Detailed 7-day forecasts',
        'Location-based recommendations',
        'Responsive design',
      ],
      fullDescription:
        'A comprehensive weather dashboard that provides detailed weather information with beautiful visualizations. The app integrates with multiple weather APIs to provide accurate forecasts and features interactive maps, charts, and a clean, intuitive interface.',
      screenshots: ['/projects/weather-1.jpg', '/projects/weather-2.jpg'],
      metrics: {
        accuracy: '98%',
        loadTime: '1.2s',
        rating: '4.7/5',
      },
    },
    {
      id: 4,
      title: 'API Gateway Service',
      description:
        'A robust API gateway service with authentication, rate limiting, and comprehensive monitoring capabilities.',
      category: 'Backend',
      image: '/projects/api-gateway.jpg',
      technologies: ['Node.js', 'Express', 'Redis', 'MongoDB', 'JWT', 'Docker'],
      github: 'https://github.com/mayurbhalgama/api-gateway',
      demo: 'https://api-docs.mayurbhalgama.dev',
      featured: false,
      status: 'completed',
      duration: '2 months',
      team: 'Solo',
      highlights: [
        'Rate limiting and throttling',
        'JWT-based authentication',
        'Real-time monitoring',
        'Dockerized deployment',
      ],
      fullDescription:
        'A production-ready API gateway that handles authentication, authorization, rate limiting, and monitoring for microservices. Built with scalability and security in mind, featuring comprehensive logging and analytics.',
      screenshots: ['/projects/api-1.jpg'],
      metrics: {
        throughput: '10K req/s',
        latency: '50ms',
        availability: '99.99%',
      },
    },
    {
      id: 5,
      title: 'Machine Learning Portfolio',
      description:
        'A collection of machine learning projects including image classification, NLP, and predictive analytics.',
      category: 'Data Science',
      image: '/projects/ml-portfolio.jpg',
      technologies: [
        'Python',
        'TensorFlow',
        'Pandas',
        'Scikit-learn',
        'Jupyter',
        'Flask',
      ],
      github: 'https://github.com/mayurbhalgama/ml-portfolio',
      demo: 'https://ml-demos.mayurbhalgama.dev',
      featured: true,
      status: 'ongoing',
      duration: '6 months',
      team: 'Solo',
      highlights: [
        'Image classification with 95% accuracy',
        'Natural language processing models',
        'Predictive analytics dashboard',
        'Interactive Jupyter notebooks',
      ],
      fullDescription:
        'A comprehensive collection of machine learning projects showcasing various techniques and applications. Includes computer vision, natural language processing, and predictive modeling projects with detailed documentation and live demos.',
      screenshots: [
        '/projects/ml-1.jpg',
        '/projects/ml-2.jpg',
        '/projects/ml-3.jpg',
      ],
      metrics: {
        accuracy: '95%',
        models: '15+',
        datasets: '50+',
      },
    },
    {
      id: 6,
      title: 'Mobile App Backend',
      description:
        'Scalable backend infrastructure for a social media mobile application with real-time messaging.',
      category: 'Backend',
      image: '/projects/mobile-backend.jpg',
      technologies: [
        'Node.js',
        'GraphQL',
        'PostgreSQL',
        'Redis',
        'AWS',
        'Socket.io',
      ],
      github: 'https://github.com/mayurbhalgama/mobile-backend',
      demo: 'https://api-mobile.mayurbhalgama.dev',
      featured: false,
      status: 'completed',
      duration: '4 months',
      team: '3 developers',
      highlights: [
        'GraphQL API with subscriptions',
        'Real-time messaging system',
        'AWS deployment with auto-scaling',
        'Comprehensive testing suite',
      ],
      fullDescription:
        'A robust backend system designed to support a social media mobile application. Features include user management, real-time messaging, content delivery, and analytics. Built with GraphQL for efficient data fetching and real-time subscriptions.',
      screenshots: ['/projects/mobile-1.jpg'],
      metrics: {
        users: '50K+',
        messages: '1M+/day',
        response: '100ms',
      },
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
              href="https://github.com/mayurbhalgama"
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
