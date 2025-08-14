import { motion } from 'framer-motion'
import { Github, Linkedin, Mail, Heart, ExternalLink } from 'lucide-react'
import { LINKS } from '../../data/links'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const socialLinks = [
    {
      name: 'GitHub',
      url: LINKS.github,
      icon: Github,
      color: 'hover:text-gray-900 dark:hover:text-white',
    },
    {
      name: 'LinkedIn',
      url: LINKS.linkedin,
      icon: Linkedin,
      color: 'hover:text-blue-600',
    },
    {
      name: 'Email',
      url: LINKS.email,
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
    { name: 'Resume', href: LINKS.resume, external: true },
    { name: 'GitHub', href: LINKS.github, external: true },
    { name: 'LinkedIn', href: LINKS.linkedin, external: true },
  ]

  const scrollToSection = href => {
    if (href.startsWith('#')) {
      const element = document.getElementById(href.slice(1))
      if (element) {
        const offsetTop = element.offsetTop - 80
        window.scrollTo({ top: offsetTop, behavior: 'smooth' })
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
      <div className="container mx-auto px-4 lg:px-8 py-10">
        {/* Mobile-first simplified footer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand + Social */}
          <div className="space-y-4">
            <button
              onClick={() => scrollToSection('#hero')}
              className="text-xl lg:text-2xl font-bold text-gradient focus:outline-none rounded-lg p-1"
              aria-label="Go to top of page"
            >
              &lt;MB /&gt;
            </button>
            <p className="text-text-secondary text-sm leading-relaxed">
              Software Engineer crafting modern web experiences.
            </p>
            <div className="flex flex-wrap gap-3">
              {socialLinks.map(social => {
                const Icon = social.icon
                return (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-2 bg-background border border-border rounded-lg text-text-secondary transition-colors duration-200 ${social.color}`}
                    aria-label={`Visit my ${social.name} profile`}
                  >
                    <Icon size={18} />
                  </a>
                )
              })}
            </div>
            {/* Mobile Contact CTA */}
            <a
              href={LINKS.email}
              className="inline-flex items-center gap-2 bg-primary text-background px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity md:hidden"
            >
              <Mail size={16} />
              <span>Get in Touch</span>
            </a>
          </div>

          {/* Links split into Website and External */}
          <div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-text font-semibold mb-3">Site links</h3>
                <ul className="space-y-2 text-sm">
                  {quickLinks.map(link => (
                    <li key={link.name}>
                      <a
                        href={link.href}
                        onClick={e => handleLinkClick(e, link.href, false)}
                        className="text-text-secondary hover:text-primary transition-colors"
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-text font-semibold mb-3">External links</h3>
                <ul className="space-y-2 text-sm">
                  {resources.map(resource => (
                    <li key={resource.name}>
                      <a
                        href={resource.href}
                        onClick={e =>
                          handleLinkClick(e, resource.href, resource.external)
                        }
                        target={resource.external ? '_blank' : undefined}
                        rel={
                          resource.external ? 'noopener noreferrer' : undefined
                        }
                        className="text-text-secondary hover:text-primary transition-colors inline-flex items-center gap-1"
                      >
                        <span>{resource.name}</span>
                        {resource.external && <ExternalLink size={12} />}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Newsletter/Contact (hidden on small, simplified on md+) */}
          <div className="hidden md:block">
            <h3 className="text-text font-semibold mb-3">Stay Connected</h3>
            <p className="text-text-secondary text-sm mb-4">
              Get notified about new projects and posts.
            </p>
            <a
              href={LINKS.email}
              className="inline-flex items-center gap-2 bg-primary text-background px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <Mail size={16} />
              <span>Get in Touch</span>
            </a>
          </div>
        </div>

        <div className="border-t border-border"></div>

        {/* Bottom Footer */}
        <div className="pt-6 flex flex-col md:flex-row justify-between items-center gap-3">
          <div className="text-text-secondary text-sm flex items-center gap-1">
            <span>© {currentYear} Mayur Bhalgama</span>
            <motion.span
              className="text-red-500"
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
            >
              <Heart size={14} fill="currentColor" />
            </motion.span>
            <span>Thanks for visiting.</span>
          </div>

          {/* Removed policy links for a cleaner footer; keep spacing balanced */}
          <div className="text-text-secondary text-xs">
            <span className="opacity-70">
              Stay curious. Build great things.
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
