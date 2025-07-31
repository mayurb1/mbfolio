import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Calendar,
  Clock,
  ArrowLeft,
  Tag,
  Eye,
  Heart,
  MessageCircle,
  Share2,
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

const BlogPost = () => {
  const navigate = useNavigate()

  // Mock blog post data - in a real app, this would be fetched from an API
  const post = {
    id: 1,
    title: 'Building Scalable React Applications: Best Practices and Patterns',
    excerpt:
      'Learn how to structure React applications for scale with modern patterns, state management, and performance optimization techniques.',
    category: 'React',
    author: 'Mayur Bhalgama',
    date: '2024-01-15',
    readTime: '8 min read',
    image: '/blog/react-patterns.jpg',
    tags: ['React', 'JavaScript', 'Frontend', 'Performance'],
    views: 1250,
    likes: 89,
    comments: 23,
    content: `
# Building Scalable React Applications: Best Practices and Patterns

React has become the go-to library for building user interfaces, but as applications grow in complexity, it becomes crucial to establish proper patterns and practices that ensure maintainability and scalability.

## Table of Contents

1. [Project Structure](#project-structure)
2. [Component Architecture](#component-architecture)
3. [State Management](#state-management)
4. [Performance Optimization](#performance-optimization)
5. [Testing Strategies](#testing-strategies)

## Project Structure

A well-organized project structure is the foundation of any scalable React application. Here's a recommended folder structure:

\`\`\`
src/
  components/
    ui/
    layout/
    sections/
  hooks/
  contexts/
  services/
  utils/
  types/
  constants/
\`\`\`

### Key Principles

- **Separation of Concerns**: Keep different types of files in dedicated folders
- **Feature-based Organization**: Group related components together
- **Consistent Naming**: Use consistent naming conventions throughout the project

## Component Architecture

### Functional Components with Hooks

Always prefer functional components with hooks over class components:

\`\`\`jsx
import { useState, useEffect } from 'react';

const UserProfile = ({ userId }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser(userId).then(setUser).finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div className="user-profile">
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
};
\`\`\`

### Custom Hooks

Extract reusable logic into custom hooks:

\`\`\`jsx
const useApi = (url) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(url)
      .then(response => response.json())
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [url]);

  return { data, loading, error };
};
\`\`\`

## State Management

For complex state management, consider these options:

### Context API for Global State

\`\`\`jsx
const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};
\`\`\`

### Redux Toolkit for Complex Applications

\`\`\`jsx
import { configureStore } from '@reduxjs/toolkit';
import userSlice from './slices/userSlice';

export const store = configureStore({
  reducer: {
    user: userSlice,
  },
});
\`\`\`

## Performance Optimization

### Memoization

Use \`React.memo\`, \`useMemo\`, and \`useCallback\` strategically:

\`\`\`jsx
const ExpensiveComponent = React.memo(({ data }) => {
  const processedData = useMemo(() => {
    return data.map(item => ({ ...item, processed: true }));
  }, [data]);

  return <div>{/* render processed data */}</div>;
});
\`\`\`

### Code Splitting

Implement route-based code splitting:

\`\`\`jsx
const HomePage = lazy(() => import('./pages/HomePage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
      </Routes>
    </Suspense>
  );
}
\`\`\`

## Testing Strategies

### Unit Testing with React Testing Library

\`\`\`jsx
import { render, screen, fireEvent } from '@testing-library/react';
import Button from './Button';

test('calls onClick when clicked', () => {
  const handleClick = jest.fn();
  render(<Button onClick={handleClick}>Click me</Button>);
  
  fireEvent.click(screen.getByText('Click me'));
  expect(handleClick).toHaveBeenCalledTimes(1);
});
\`\`\`

### Integration Testing

\`\`\`jsx
test('user can submit form', async () => {
  render(<ContactForm />);
  
  fireEvent.change(screen.getByLabelText(/name/i), {
            target: { value: 'Mayur Bhalgama' }
  });
  
  fireEvent.click(screen.getByText(/submit/i));
  
  await waitFor(() => {
    expect(screen.getByText(/success/i)).toBeInTheDocument();
  });
});
\`\`\`

## Conclusion

Building scalable React applications requires careful planning and consistent practices. By following these patterns and best practices, you'll create applications that are maintainable, performant, and enjoyable to work with.

Remember, these are guidelines, not rigid rules. Adapt them to your specific needs and project requirements.

---

What patterns do you use in your React applications? Share your thoughts in the comments below!
    `,
  }

  const goBack = () => {
    navigate('/')
    setTimeout(() => {
      const element = document.getElementById('blog')
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }, 100)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: window.location.href,
        })
      } catch (err) {
        console.log('Error sharing:', err)
      }
    } else {
      // Fallback to copying URL to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 bg-gradient-to-br from-surface via-background to-surface">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Back Button */}
            <motion.button
              onClick={goBack}
              className="flex items-center space-x-2 text-text-secondary hover:text-primary transition-colors duration-200 mb-8"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              whileHover={{ x: -4 }}
            >
              <ArrowLeft size={20} />
              <span>Back to Blog</span>
            </motion.button>

            {/* Article Header */}
            <motion.header
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center mb-12"
            >
              {/* Category */}
              <span className="inline-block px-4 py-2 bg-primary text-background rounded-full text-sm font-medium mb-4">
                {post.category}
              </span>

              {/* Title */}
              <h1 className="text-3xl lg:text-5xl font-bold text-text mb-6 leading-tight">
                {post.title}
              </h1>

              {/* Meta Info */}
              <div className="flex flex-wrap justify-center items-center gap-6 text-text-secondary mb-8">
                <div className="flex items-center space-x-2">
                  <Calendar size={16} />
                  <span>{new Date(post.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock size={16} />
                  <span>{post.readTime}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Eye size={16} />
                  <span>{post.views} views</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Heart size={16} />
                  <span>{post.likes} likes</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MessageCircle size={16} />
                  <span>{post.comments} comments</span>
                </div>
              </div>

              {/* Share Button */}
              <motion.button
                onClick={handleShare}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-surface border border-border rounded-lg text-text hover:bg-background transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Share2 size={16} />
                <span>Share Article</span>
              </motion.button>
            </motion.header>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <section className="py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="prose prose-lg max-w-none"
            >
              <ReactMarkdown
                components={{
                  code({ node: _node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '')
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={oneDark}
                        language={match[1]}
                        PreTag="div"
                        className="rounded-lg"
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    )
                  },
                  h1: ({ children }) => (
                    <h1 className="text-3xl font-bold text-text mb-6">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-2xl font-bold text-text mb-4 mt-8">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-xl font-bold text-text mb-3 mt-6">
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => (
                    <p className="text-text-secondary mb-4 leading-relaxed">
                      {children}
                    </p>
                  ),
                  ul: ({ children }) => (
                    <ul className="text-text-secondary mb-4 list-disc list-inside space-y-2">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="text-text-secondary mb-4 list-decimal list-inside space-y-2">
                      {children}
                    </ol>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-primary pl-6 py-4 bg-surface/50 rounded-r-lg italic text-text-secondary mb-6">
                      {children}
                    </blockquote>
                  ),
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      className="text-primary hover:text-secondary transition-colors duration-200 underline"
                    >
                      {children}
                    </a>
                  ),
                }}
              >
                {post.content}
              </ReactMarkdown>
            </motion.article>

            {/* Tags */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-12 pt-8 border-t border-border"
            >
              <h3 className="text-lg font-semibold text-text mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="flex items-center space-x-1 px-3 py-2 bg-surface border border-border rounded-lg text-sm text-text-secondary hover:border-primary hover:text-primary transition-colors duration-200"
                  >
                    <Tag size={14} />
                    <span>{tag}</span>
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Author Bio */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="mt-12 p-6 bg-surface border border-border rounded-lg"
            >
              <div className="flex items-start space-x-4">
                <img
                  src="/profile-photo.jpg"
                  alt={post.author}
                  className="w-16 h-16 rounded-full object-cover"
                  onError={e => {
                    e.target.src = `data:image/svg+xml,${encodeURIComponent(`
                      <svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
                        <rect width="100%" height="100%" fill="#e2e8f0"/>
                        <circle cx="32" cy="24" r="12" fill="#64748b"/>
                        <path d="M16 48 Q32 40 48 48" fill="#64748b"/>
                      </svg>
                    `)}`
                  }}
                />
                <div>
                  <h4 className="text-lg font-semibold text-text mb-2">
                    About {post.author}
                  </h4>
                  <p className="text-text-secondary leading-relaxed">
                    John is a passionate software engineer with over 5 years of
                    experience in full-stack development. He loves sharing
                    knowledge and helping other developers grow in their
                    careers.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default BlogPost
