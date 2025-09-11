import { useState } from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Calendar, Clock, ArrowRight, Tag, Eye, Heart, MessageCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

const Blog = () => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  })

  const [selectedCategory, setSelectedCategory] = useState('all')

  const blogPosts = [
    {
      id: 1,
      title: 'Building Scalable React Applications: Best Practices and Patterns',
      excerpt: 'Learn how to structure React applications for scale with modern patterns, state management, and performance optimization techniques.',
      content: 'Full blog post content would be here...',
      category: 'React',
      author: 'Mayur Bhalgama',
      date: '2024-01-15',
      readTime: '8 min read',
      image: '/blog/react-patterns.jpg',
      tags: ['React', 'JavaScript', 'Frontend', 'Performance'],
      views: 1250,
      likes: 89,
      comments: 23,
      featured: true,
      slug: 'building-scalable-react-applications'
    },
    {
      id: 2,
      title: 'Node.js Performance Optimization: From Slow to Lightning Fast',
      excerpt: 'Discover proven techniques to optimize Node.js applications, including memory management, clustering, and database optimization.',
      content: 'Full blog post content would be here...',
      category: 'Node.js',
      author: 'Mayur Bhalgama',
      date: '2024-01-08',
      readTime: '12 min read',
      image: '/blog/nodejs-performance.jpg',
      tags: ['Node.js', 'Performance', 'Backend', 'Optimization'],
      views: 980,
      likes: 67,
      comments: 18,
      featured: true,
      slug: 'nodejs-performance-optimization'
    },
    {
      id: 3,
      title: 'The Future of Web Development: Trends to Watch in 2024',
      excerpt: 'Explore the emerging trends and technologies that will shape web development in 2024, from AI integration to new frameworks.',
      content: 'Full blog post content would be here...',
      category: 'Industry',
      author: 'Mayur Bhalgama',
      date: '2024-01-01',
      readTime: '6 min read',
      image: '/blog/web-trends-2024.jpg',
      tags: ['Web Development', 'Trends', 'Future', 'Technology'],
      views: 2100,
      likes: 156,
      comments: 45,
      featured: false,
      slug: 'future-of-web-development-2024'
    },
    {
      id: 4,
      title: 'CSS Grid vs Flexbox: When to Use What',
      excerpt: 'A comprehensive guide to understanding the differences between CSS Grid and Flexbox, with practical examples and use cases.',
      content: 'Full blog post content would be here...',
      category: 'CSS',
      author: 'Mayur Bhalgama',
      date: '2023-12-20',
      readTime: '5 min read',
      image: '/blog/css-grid-flexbox.jpg',
      tags: ['CSS', 'Layout', 'Frontend', 'Grid', 'Flexbox'],
      views: 850,
      likes: 45,
      comments: 12,
      featured: false,
      slug: 'css-grid-vs-flexbox'
    },
    {
      id: 5,
      title: 'Building a GraphQL API with Node.js and Apollo Server',
      excerpt: 'Learn how to create a robust GraphQL API using Node.js and Apollo Server, including schema design and performance optimization.',
      content: 'Full blog post content would be here...',
      category: 'GraphQL',
      author: 'Mayur Bhalgama',
      date: '2023-12-10',
      readTime: '15 min read',
      image: '/blog/graphql-apollo.jpg',
      tags: ['GraphQL', 'Node.js', 'Apollo', 'API', 'Backend'],
      views: 650,
      likes: 38,
      comments: 9,
      featured: false,
      slug: 'building-graphql-api-nodejs-apollo'
    },
    {
      id: 6,
      title: 'Machine Learning for Web Developers: Getting Started',
      excerpt: 'An introduction to machine learning concepts and tools that web developers can use to add AI capabilities to their applications.',
      content: 'Full blog post content would be here...',
      category: 'Machine Learning',
      author: 'Mayur Bhalgama',
      date: '2023-11-25',
      readTime: '10 min read',
      image: '/blog/ml-web-developers.jpg',
      tags: ['Machine Learning', 'AI', 'JavaScript', 'TensorFlow'],
      views: 1400,
      likes: 92,
      comments: 31,
      featured: true,
      slug: 'machine-learning-for-web-developers'
    }
  ]

  const categories = [
    { id: 'all', label: 'All Posts', count: blogPosts.length },
    { id: 'React', label: 'React', count: blogPosts.filter(p => p.category === 'React').length },
    { id: 'Node.js', label: 'Node.js', count: blogPosts.filter(p => p.category === 'Node.js').length },
    { id: 'CSS', label: 'CSS', count: blogPosts.filter(p => p.category === 'CSS').length },
    { id: 'GraphQL', label: 'GraphQL', count: blogPosts.filter(p => p.category === 'GraphQL').length },
    { id: 'Machine Learning', label: 'ML', count: blogPosts.filter(p => p.category === 'Machine Learning').length }
  ]

  const filteredPosts = selectedCategory === 'all' 
    ? blogPosts 
    : blogPosts.filter(post => post.category === selectedCategory)

  const featuredPosts = blogPosts.filter(post => post.featured)

  const BlogCard = ({ post, index, featured = false }) => {
    return (
      <motion.article
        className={`group bg-surface border border-border rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 ${
          featured ? 'lg:col-span-2' : ''
        }`}
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        whileHover={{ y: -5 }}
      >
        {/* Post Image */}
        <div className={`relative overflow-hidden ${featured ? 'h-64' : 'h-48'}`}>
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            onError={(e) => {
              e.target.src = `data:image/svg+xml,${encodeURIComponent(`
                <svg width="400" height="200" xmlns="http://www.w3.org/2000/svg">
                  <rect width="100%" height="100%" fill="#e2e8f0"/>
                  <text x="50%" y="50%" text-anchor="middle" dy="0.3em" font-family="Arial" font-size="16" fill="#64748b">Blog Post</text>
                </svg>
              `)}`
            }}
          />
          
          {/* Category Badge */}
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 bg-primary text-background rounded-full text-sm font-medium">
              {post.category}
            </span>
          </div>

          {/* Featured Badge */}
          {post.featured && (
            <div className="absolute top-4 right-4">
              <span className="px-3 py-1 bg-accent text-background rounded-full text-sm font-medium">
                Featured
              </span>
            </div>
          )}
        </div>

        {/* Post Content */}
        <div className="p-6">
          {/* Meta Info */}
          <div className="flex items-center space-x-4 mb-3 text-sm text-text-secondary">
            <div className="flex items-center space-x-1">
              <Calendar size={14} />
              <span>{new Date(post.date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock size={14} />
              <span>{post.readTime}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Eye size={14} />
              <span>{post.views}</span>
            </div>
          </div>

          {/* Title */}
          <h3 className={`font-bold text-text group-hover:text-primary transition-colors duration-200 mb-3 ${
            featured ? 'text-xl lg:text-2xl' : 'text-lg'
          }`}>
            <Link to={`/blog/${post.slug}`}>
              {post.title}
            </Link>
          </h3>

          {/* Excerpt */}
          <p className="text-text-secondary mb-4 leading-relaxed">
            {post.excerpt}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.slice(0, 3).map((tag, i) => (
              <span
                key={i}
                className="flex items-center space-x-1 px-2 py-1 bg-background border border-border rounded text-xs text-text-secondary hover:border-primary hover:text-primary transition-colors duration-200"
              >
                <Tag size={10} />
                <span>{tag}</span>
              </span>
            ))}
            {post.tags.length > 3 && (
              <span className="px-2 py-1 bg-background border border-border rounded text-xs text-text-secondary">
                +{post.tags.length - 3}
              </span>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-text-secondary">
              <div className="flex items-center space-x-1">
                <Heart size={14} />
                <span>{post.likes}</span>
              </div>
              <div className="flex items-center space-x-1">
                <MessageCircle size={14} />
                <span>{post.comments}</span>
              </div>
            </div>

            <motion.div
              whileHover={{ x: 4 }}
            >
              <Link
                to={`/blog/${post.slug}`}
                className="flex items-center space-x-2 text-primary hover:text-secondary transition-colors duration-200 font-medium"
              >
                <span>Read More</span>
                <ArrowRight size={16} />
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.article>
    )
  }

  return (
    <section 
      id="blog" 
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
              Latest Blog Posts
            </h2>
            <p className="text-xl text-text-secondary max-w-2xl mx-auto">
              Sharing knowledge and insights about web development, technology, and best practices
            </p>
          </motion.div>

          {/* Featured Posts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-16"
          >
            <h3 className="text-2xl font-bold text-text mb-8 flex items-center">
              <div className="w-1 h-8 bg-primary rounded-full mr-4" />
              Featured Posts
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {featuredPosts.slice(0, 3).map((post, index) => (
                <BlogCard
                  key={post.id}
                  post={post}
                  index={index}
                  featured={index === 0}
                />
              ))}
            </div>
          </motion.div>

          {/* Category Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap justify-center gap-2 mb-12"
          >
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  selectedCategory === category.id
                    ? 'bg-primary text-background'
                    : 'bg-background border border-border text-text-secondary hover:text-text hover:bg-surface'
                }`}
                aria-label={`Filter posts by ${category.label} category`}
              >
                {category.label} ({category.count})
              </button>
            ))}
          </motion.div>

          {/* All Posts */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            layout
          >
            {filteredPosts.map((post, index) => (
              <BlogCard
                key={post.id}
                post={post}
                index={index}
              />
            ))}
          </motion.div>

          {/* Newsletter Signup */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-16 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-8 text-center border border-primary/20"
          >
            <h3 className="text-2xl font-bold text-text mb-4">
              Subscribe to My Newsletter
            </h3>
            <p className="text-text-secondary mb-6 max-w-2xl mx-auto">
              Get the latest blog posts, tutorials, and web development tips delivered directly to your inbox. 
              No spam, unsubscribe anytime.
            </p>
            
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg border border-border bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <motion.button
                type="submit"
                className="bg-primary text-background px-8 py-3 rounded-lg font-semibold hover:bg-secondary transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Subscribe to newsletter"
              >
                Subscribe
              </motion.button>
            </form>

            <p className="text-xs text-text-secondary mt-4">
              Join 500+ developers who are already subscribed
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default Blog