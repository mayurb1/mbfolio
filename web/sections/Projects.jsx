'use client'

import { useState, useMemo, useCallback, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { ExternalLink, Github, Calendar, Users, Star, X } from 'lucide-react'
import Select from '../ui/Select'
import Carousel from '../ui/Carousel'
import { ProjectsGridSkeleton, SectionHeaderSkeleton } from '../ui/SkeletonLoader'
import RetryState from '../ui/RetryState'
import EmptyState from '../ui/EmptyState'
import { useApiResource } from '../../hooks/useApiResource'
import { useProfile } from '../../contexts/ProfileContext'

const Projects = () => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  })
  const { userId } = useProfile()

  // Fetch projects from API (scoped to the profile owner)
  const {
    data: projects,
    loading,
    error,
    retry: handleRetry,
  } = useApiResource('/projects', {
    params: {
      isActive: true,
      limit: 50, // Get all active projects
      userId,
    },
    // Transform API data to match existing component structure
    transform: response =>
      response.data.data.projects.map(project => {
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
      }),
    // No static fallback — show the retry/empty state instead.
    fallback: [],
    errorMessage: 'Failed to load projects',
  })

  // UI state
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedProject, setSelectedProject] = useState(null)

  // Memoize processed projects
  const processedProjects = useMemo(() => {
    return projects
  }, [projects])

  const categories = useMemo(() => {
    // Helper function to get category name from project
    const getCategoryName = (project) => {
      if (!project.category) return 'Uncategorized'
      return project.category?.name || project.category
    }

    // Dynamically build categories from available projects
    const categoryMap = new Map()

    processedProjects.forEach(project => {
      const categoryName = getCategoryName(project)
      if (categoryMap.has(categoryName)) {
        categoryMap.set(categoryName, categoryMap.get(categoryName) + 1)
      } else {
        categoryMap.set(categoryName, 1)
      }
    })

    // Convert to array and sort by count (descending)
    const dynamicCategories = Array.from(categoryMap.entries())
      .map(([name, count]) => ({
        id: name,
        label: name,
        count
      }))
      .sort((a, b) => b.count - a.count)

    // Always include "All Projects" at the beginning
    return [
      { id: 'all', label: 'All Projects', count: processedProjects.length },
      ...dynamicCategories
    ]
  }, [processedProjects])

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
                  <div class="absolute inset-0 flex items-center justify-center" style="background-color: var(--color-surface);">
                    <div class="text-center" style="color: var(--color-text-secondary);">
                      <div class="text-2xl mb-2">📷</div>
                      <div class="text-sm font-medium">Project Image</div>
                      <div class="text-xs">Not Available</div>
                    </div>
                  </div>
                `
              }}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: 'var(--color-surface)' }}>
              <div className="text-center" style={{ color: 'var(--color-text-secondary)' }}>
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
                  aria-label={`View ${project.title} source code on GitHub`}
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
                  aria-label={`View ${project.title} live demo`}
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
                aria-label="Close project details"
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
                  <div className="w-full h-64 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--color-surface)' }}>
                    <div className="text-center" style={{ color: 'var(--color-text-secondary)' }}>
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
            <>
              <SectionHeaderSkeleton />
              <ProjectsGridSkeleton count={6} />
            </>
          ) : error ? (
            <RetryState
              error={error}
              onRetry={handleRetry}
              ariaLabel="Retry loading projects"
              className="text-center py-20"
            />
          ) : (
            <>
              {/* Header and Filter */}
              <div className="flex flex-col gap-6 mb-8 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-text mb-2">Projects</h2>
                  <p className="text-text-secondary text-sm sm:text-base">
                    {processedProjects.length > 0
                      ? `${processedProjects.length} projects showcasing my work`
                      : 'Selected personal and organization projects.'}
                  </p>
                </div>

                {/* Filter Select */}
                <div className="w-full sm:w-64">
                  <label htmlFor="project-category" className="sr-only">
                    Filter projects by category
                  </label>
                  <Select
                    id="project-category"
                    value={selectedCategory}
                    onChange={e => setSelectedCategory(e.target.value)}
                    aria-label="Filter projects by category"
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
                <EmptyState
                  className="text-center py-20"
                  message={
                    selectedCategory === 'all'
                      ? 'No projects found.'
                      : `No projects found in ${selectedCategory} category.`
                  }
                />
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