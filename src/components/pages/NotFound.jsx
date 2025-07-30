import { motion } from 'framer-motion'
import { Home, ArrowLeft, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const NotFound = () => {
  const navigate = useNavigate()

  const goHome = () => {
    navigate('/')
  }

  const goBack = () => {
    window.history.back()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full text-center">
        {/* Animated 404 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <motion.h1
            className="text-8xl md:text-9xl font-bold text-gradient bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
            animate={{ 
              scale: [1, 1.05, 1],
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            404
          </motion.h1>
        </motion.div>

        {/* Error message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-text mb-4">
            Page Not Found
          </h2>
          <p className="text-text-secondary text-lg leading-relaxed">
            Oops! The page you're looking for seems to have wandered off into the digital void. 
            Don't worry, even the best explorers sometimes take a wrong turn.
          </p>
        </motion.div>

        {/* Animated search icon */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-8"
        >
          <motion.div
            animate={{ 
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="inline-flex items-center justify-center w-20 h-20 bg-surface border border-border rounded-full text-text-secondary"
          >
            <Search size={32} />
          </motion.div>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="space-y-4"
        >
          <button
            onClick={goHome}
            className="w-full bg-primary text-background py-3 px-6 rounded-lg font-semibold hover:bg-secondary transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <Home size={20} />
            <span>Go Home</span>
          </button>
          
          <button
            onClick={goBack}
            className="w-full border border-border text-text py-3 px-6 rounded-lg font-semibold hover:bg-surface transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <ArrowLeft size={20} />
            <span>Go Back</span>
          </button>
        </motion.div>

        {/* Fun fact */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-8 p-4 bg-surface border border-border rounded-lg"
        >
          <p className="text-text-secondary text-sm">
            <strong className="text-primary">Fun Fact:</strong> The HTTP 404 error code was named after room 404 at CERN, 
            where the World Wide Web was created. The room contained the central database of the web!
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default NotFound