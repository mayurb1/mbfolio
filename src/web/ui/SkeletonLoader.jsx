import { motion } from 'framer-motion'

// Base skeleton component
const Skeleton = ({ className = "", animate = true, ...props }) => {
  return (
    <motion.div
      className={`bg-surface/60 rounded ${animate ? 'animate-pulse' : ''} ${className}`}
      {...props}
    />
  )
}

// Project Card Skeleton
const ProjectCardSkeleton = ({ index = 0 }) => {
  return (
    <motion.div
      className="bg-surface border border-border rounded-xl overflow-hidden"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      {/* Image Skeleton */}
      <Skeleton className="w-full aspect-[16/10]" />
      
      {/* Content Skeleton */}
      <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
        {/* Title and badges */}
        <div>
          <Skeleton className="h-5 sm:h-6 w-3/4 mb-2" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-4 sm:h-5 w-16 sm:w-20" />
            <Skeleton className="h-4 sm:h-5 w-12 sm:w-16" />
          </div>
        </div>
        
        {/* Description */}
        <div className="space-y-2">
          <Skeleton className="h-3 sm:h-4 w-full" />
          <Skeleton className="h-3 sm:h-4 w-5/6" />
        </div>
        
        {/* Technologies */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          <Skeleton className="h-5 sm:h-6 w-12 sm:w-16" />
          <Skeleton className="h-5 sm:h-6 w-16 sm:w-20" />
          <Skeleton className="h-5 sm:h-6 w-10 sm:w-14" />
          <Skeleton className="h-5 sm:h-6 w-8 sm:w-12" />
        </div>
        
        {/* Footer */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <Skeleton className="h-3 sm:h-4 w-12 sm:w-16" />
            <Skeleton className="h-3 sm:h-4 w-8 sm:w-12" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-6 w-6 sm:h-8 sm:w-8 rounded-full" />
            <Skeleton className="h-6 w-6 sm:h-8 sm:w-8 rounded-full" />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Projects Grid Skeleton
const ProjectsGridSkeleton = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <ProjectCardSkeleton key={index} index={index} />
      ))}
    </div>
  )
}

// Blog Card Skeleton
const BlogCardSkeleton = ({ index = 0, featured = false }) => {
  return (
    <motion.div
      className={`bg-surface border border-border rounded-xl overflow-hidden ${
        featured ? 'lg:col-span-2' : ''
      }`}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      {/* Image Skeleton */}
      <Skeleton className={`w-full ${featured ? 'h-48 sm:h-64' : 'h-40 sm:h-48'}`} />
      
      {/* Content Skeleton */}
      <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
        {/* Meta info */}
        <div className="flex flex-wrap gap-2 sm:gap-4">
          <Skeleton className="h-3 sm:h-4 w-16 sm:w-20" />
          <Skeleton className="h-3 sm:h-4 w-12 sm:w-16" />
          <Skeleton className="h-3 sm:h-4 w-8 sm:w-12" />
        </div>
        
        {/* Title */}
        <Skeleton className={`h-5 sm:h-6 w-4/5 ${featured ? 'lg:h-7 xl:h-8' : ''}`} />
        
        {/* Excerpt */}
        <div className="space-y-2">
          <Skeleton className="h-3 sm:h-4 w-full" />
          <Skeleton className="h-3 sm:h-4 w-3/4" />
        </div>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          <Skeleton className="h-5 sm:h-6 w-12 sm:w-16" />
          <Skeleton className="h-5 sm:h-6 w-16 sm:w-20" />
          <Skeleton className="h-5 sm:h-6 w-10 sm:w-14" />
        </div>
        
        {/* Footer */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <Skeleton className="h-3 sm:h-4 w-6 sm:w-8" />
            <Skeleton className="h-3 sm:h-4 w-6 sm:w-8" />
          </div>
          <Skeleton className="h-3 sm:h-4 w-16 sm:w-20" />
        </div>
      </div>
    </motion.div>
  )
}

// Blog Grid Skeleton
const BlogGridSkeleton = ({ count = 6, featured = true }) => {
  return (
    <>
      {/* Featured Posts Skeleton */}
      {featured && (
        <div className="mb-12 sm:mb-16">
          <div className="flex items-center mb-6 sm:mb-8">
            <Skeleton className="w-1 h-6 sm:h-8 mr-3 sm:mr-4" />
            <Skeleton className="h-6 sm:h-8 w-32 sm:w-40" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {Array.from({ length: 3 }).map((_, index) => (
              <BlogCardSkeleton
                key={`featured-${index}`}
                index={index}
                featured={index === 0}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Category Filter Skeleton */}
      <div className="flex flex-wrap justify-center gap-2 mb-8 sm:mb-12">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-8 sm:h-10 w-16 sm:w-20" />
        ))}
      </div>
      
      {/* All Posts Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {Array.from({ length: count }).map((_, index) => (
          <BlogCardSkeleton key={index} index={index} />
        ))}
      </div>
    </>
  )
}

// Timeline Item Skeleton (for Experience)
const TimelineItemSkeleton = ({ index = 0, isLast = false }) => {
  return (
    <motion.div
      className="relative flex items-start space-x-4 sm:space-x-6 pb-8 sm:pb-12"
      initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: index * 0.2 }}
    >
      {/* Timeline Line */}
      <div className="relative flex flex-col items-center">
        {/* Timeline Dot Skeleton */}
        <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 rounded-full" />
        
        {/* Timeline Line Skeleton */}
        {!isLast && (
          <Skeleton className="w-0.5 h-20 mt-2" animate={false} />
        )}
      </div>
      
      {/* Content Skeleton */}
      <div className="flex-1 bg-surface border border-border rounded-lg p-4 sm:p-6 space-y-4">
        {/* Header */}
        <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-5 w-1/2" />
          </div>
          <div className="space-y-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        </div>
        
        {/* Description */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>
        
        {/* Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-background/50 rounded-lg p-3 space-y-2">
              <Skeleton className="h-6 w-12 mx-auto" />
              <Skeleton className="h-3 w-16 mx-auto" />
            </div>
          ))}
        </div>
        
        {/* Achievements */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-start space-x-2">
              <Skeleton className="w-4 h-4 mt-0.5 rounded-full" animate={false} />
              <Skeleton className="h-4 flex-1" />
            </div>
          ))}
        </div>
        
        {/* Technologies */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-36" />
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-6 w-16" />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Experience Timeline Skeleton
const ExperienceTimelineSkeleton = ({ count = 3 }) => {
  return (
    <div className="space-y-0">
      {Array.from({ length: count }).map((_, index) => (
        <TimelineItemSkeleton
          key={index}
          index={index}
          isLast={index === count - 1}
        />
      ))}
    </div>
  )
}

// Testimonials Skeleton
const TestimonialsSkeleton = ({ count = 3 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          className="bg-surface border border-border rounded-xl p-4 sm:p-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <div className="space-y-3 sm:space-y-4">
            {/* Quote */}
            <div className="space-y-2">
              <Skeleton className="h-3 sm:h-4 w-full" />
              <Skeleton className="h-3 sm:h-4 w-5/6" />
              <Skeleton className="h-3 sm:h-4 w-4/6" />
            </div>
            
            {/* Author */}
            <div className="flex items-center space-x-3">
              <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-3 sm:h-4 w-20 sm:w-24" />
                <Skeleton className="h-2 sm:h-3 w-24 sm:w-32" />
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

// Skills Skeleton
const SkillsSkeleton = ({ count = 8 }) => {
  return (
    <div className="flex flex-wrap gap-3 sm:gap-4 justify-center">
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          className="px-3 sm:px-4 py-1.5 sm:py-2 bg-surface border border-border rounded-full"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          <Skeleton className="h-3 sm:h-4 w-12 sm:w-16" animate={false} />
        </motion.div>
      ))}
    </div>
  )
}

// General Loading Spinner
const LoadingSpinner = ({ size = "md", className = "" }) => {
  const sizeClasses = {
    sm: "h-6 w-6 sm:h-8 sm:w-8",
    md: "h-8 w-8 sm:h-12 sm:w-12",
    lg: "h-12 w-12 sm:h-16 sm:w-16"
  }
  
  return (
    <div className={`flex justify-center items-center py-8 sm:py-12 ${className}`}>
      <motion.div
        className={`animate-spin rounded-full border-b-2 border-primary ${sizeClasses[size]}`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
    </div>
  )
}

// Section Header Skeleton
const SectionHeaderSkeleton = () => {
  return (
    <div className="text-center mb-12 sm:mb-16 space-y-3 sm:space-y-4">
      <Skeleton className="h-6 sm:h-8 lg:h-10 w-48 sm:w-64 mx-auto" />
      <Skeleton className="h-4 sm:h-5 w-72 sm:w-96 mx-auto max-w-full" />
    </div>
  )
}

// Export all components
export {
  Skeleton,
  ProjectCardSkeleton,
  ProjectsGridSkeleton,
  BlogCardSkeleton,
  BlogGridSkeleton,
  TimelineItemSkeleton,
  ExperienceTimelineSkeleton,
  TestimonialsSkeleton,
  SkillsSkeleton,
  LoadingSpinner,
  SectionHeaderSkeleton,
}

export default Skeleton