import { motion } from 'framer-motion'
import {
  Github,
  Linkedin,
  Twitter,
  Mail,
  Heart,
  ExternalLink,
} from 'lucide-react'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const socialLinks = [
    {
      name: 'GitHub',
      url: 'https://github.com/mayurbhalgama',
      icon: Github,
      color: 'hover:text-gray-900 dark:hover:text-white',
    },
    {
      name: 'LinkedIn',
      url: 'https://linkedin.com/in/mayurbhalgama',
      icon: Linkedin,
      color: 'hover:text-blue-600',
    },
    {
      name: 'Twitter',
      url: 'https://twitter.com/mayurbhalgama',
      icon: Twitter,
      color: 'hover:text-blue-400',
    },
    {
      name: 'Email',
      url: 'mailto:mayur@example.com',
      icon: Mail,
      color: 'hover:text-red-500',
    },
  ]

  const quickLinks = [
    { name: 'About', href: '#about' },
    { name: 'Projects', href: '#projects' },
    { name: 'Experience', href: '#experience' },
    { name: 'Contact', href: '#contact' },
  ]

  const resources = [
    { name: 'Resume', href: '/resume.pdf', external: true },
    { name: 'Blog', href: '#blog' },
    {
      name: 'GitHub',
      href: 'https://github.com/mayurbhalgama',
      external: true,
    },
    {
      name: 'LinkedIn',
      href: 'https://linkedin.com/in/mayurbhalgama',
      external: true,
    },
  ]

  const scrollToSection = href => {
    if (href.startsWith('#')) {
      const element = document.getElementById(href.slice(1))
      if (element) {
        const offsetTop = element.offsetTop - 80
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth',
        })
      }
    }
  }

  const handleLinkClick = (e, href, external) => {
    if (!external && href.startsWith('#')) {
      e.preventDefault()
      scrollToSection(href)
    }
  }

  return (
    <footer className="bg-surface border-t border-border">
      <div className="container mx-auto px-4 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <motion.div
              className="text-2xl font-bold text-gradient"
              whileHover={{ scale: 1.05 }}
            >
              &lt;MB /&gt;
            </motion.div>
            <p className="text-text-secondary text-sm leading-relaxed">
              Software Engineer passionate about creating innovative solutions
              and beautiful user experiences. Let&apos;s build something amazing
              together!
            </p>

            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map(social => {
                const Icon = social.icon
                return (
                  <motion.a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-text-secondary transition-colors duration-200 ${social.color}`}
                    whileHover={{ scale: 1.2, y: -2 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label={`Visit my ${social.name} profile`}
                  >
                    <Icon size={20} />
                  </motion.a>
                )
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-text font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map(link => (
                <li key={link.name}>
                  <motion.a
                    href={link.href}
                    onClick={e => handleLinkClick(e, link.href, false)}
                    className="text-text-secondary hover:text-primary transition-colors duration-200 text-sm"
                    whileHover={{ x: 4 }}
                  >
                    {link.name}
                  </motion.a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-text font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              {resources.map(resource => (
                <li key={resource.name}>
                  <motion.a
                    href={resource.href}
                    onClick={e =>
                      handleLinkClick(e, resource.href, resource.external)
                    }
                    target={resource.external ? '_blank' : undefined}
                    rel={resource.external ? 'noopener noreferrer' : undefined}
                    className="text-text-secondary hover:text-primary transition-colors duration-200 text-sm flex items-center space-x-1"
                    whileHover={{ x: 4 }}
                  >
                    <span>{resource.name}</span>
                    {resource.external && <ExternalLink size={12} />}
                  </motion.a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter/Contact */}
          <div>
            <h3 className="text-text font-semibold mb-4">Stay Connected</h3>
            <p className="text-text-secondary text-sm mb-4">
              Get notified about new projects and blog posts.
            </p>
            <motion.a
              href="mailto:mayur@example.com"
              className="inline-flex items-center space-x-2 bg-primary text-background px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Mail size={16} />
              <span>Get in Touch</span>
            </motion.a>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border"></div>

        {/* Bottom Footer */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-text-secondary text-sm flex items-center space-x-1">
            <span>© {currentYear} Mayur Bhalgama. Made with</span>
            <motion.span
              className="text-red-500"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
            >
              <Heart size={16} fill="currentColor" />
            </motion.span>
            <span>using React & Tailwind CSS</span>
          </div>

          <div className="flex items-center space-x-6 text-text-secondary text-sm">
            <motion.a
              href="/privacy"
              className="hover:text-primary transition-colors duration-200"
              whileHover={{ y: -1 }}
            >
              Privacy Policy
            </motion.a>
            <motion.a
              href="/terms"
              className="hover:text-primary transition-colors duration-200"
              whileHover={{ y: -1 }}
            >
              Terms of Service
            </motion.a>
            <motion.a
              href="/sitemap.xml"
              className="hover:text-primary transition-colors duration-200"
              whileHover={{ y: -1 }}
            >
              Sitemap
            </motion.a>
          </div>
        </div>

        {/* Developer Credit */}
        <div className="pt-4 text-center">
          <p className="text-text-secondary text-xs">
            Designed and developed with modern web technologies. View source on{' '}
            <motion.a
              href="https://github.com/mayurbhalgama/portfolio"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
              whileHover={{ scale: 1.05 }}
            >
              GitHub
            </motion.a>
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
