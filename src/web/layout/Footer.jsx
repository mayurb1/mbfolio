import { motion } from 'framer-motion'
import { Github, Linkedin, Mail, Heart, ExternalLink } from 'lucide-react'
import { LINKS } from '../../data/links'
import { useMasterData } from '../../hooks/useMasterData'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  // Get dynamic data from Redux store
  const { user, getContactInfo } = useMasterData()
  const contactInfo = getContactInfo()

  // Dynamic social links with fallback to static LINKS
  const socialLinks = [
    {
      name: 'GitHub',
      url: contactInfo.githubUrl || LINKS.github,
      icon: Github,
      color: 'hover:text-gray-900 dark:hover:text-white',
    },
    {
      name: 'LinkedIn',
      url: contactInfo.linkedinUrl || LINKS.linkedin,
      icon: Linkedin,
      color: 'hover:text-blue-600',
    },
    {
      name: 'Email',
      url: contactInfo.email ? `mailto:${contactInfo.email}` : LINKS.email,
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

  // Dynamic resources with fallback to static LINKS
  const resources = [
    { name: 'Resume', href: user.resume || LINKS.resume, external: true },
    {
      name: 'GitHub',
      href: contactInfo.githubUrl || LINKS.github,
      external: true,
    },
    {
      name: 'LinkedIn',
      href: contactInfo.linkedinUrl || LINKS.linkedin,
      external: true,
    },
  ]

  // Dynamic email link for contact buttons
  const emailLink = contactInfo.email
    ? `mailto:${contactInfo.email}`
    : LINKS.email

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
        {/* Footer content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* About + Social */}
          <div className="lg:col-span-1">
            <div className="space-y-4">
              <p className="text-text font-semibold text-lg">
                Software Engineer
              </p>
              <p className="text-text-secondary text-sm leading-relaxed">
                Crafting modern web experiences with passion and precision.
                Always learning, always building.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                {socialLinks.map(social => {
                  const Icon = social.icon
                  return (
                    <a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`p-2 bg-background border border-border rounded-lg text-text-secondary transition-colors duration-200 hover:bg-primary hover:text-background hover:border-primary`}
                      aria-label={`Visit my ${social.name} profile`}
                    >
                      <Icon size={18} />
                    </a>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="lg:col-span-1">
            <h3 className="text-text font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-3 text-sm">
              {quickLinks.map(link => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    onClick={e => handleLinkClick(e, link.href, false)}
                    className="text-text-secondary hover:text-primary transition-colors duration-200 flex items-center group"
                  >
                    <span className="w-2 h-2 bg-border rounded-full mr-3 group-hover:bg-primary transition-colors duration-200"></span>
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect Section */}
          <div className="lg:col-span-1">
            <h3 className="text-text font-semibold mb-4">Connect</h3>
            <div className="space-y-4">
              <p className="text-text-secondary text-sm leading-relaxed">
                Let's build something amazing together.
              </p>
              <a
                href={emailLink}
                className="inline-flex items-center gap-2 bg-primary text-background px-6 py-3 rounded-lg text-sm font-semibold hover:bg-secondary transition-colors duration-200"
              >
                <Mail size={16} />
                <span>Get in Touch</span>
              </a>

              {/* External Resources */}
              {/* <div className="pt-2">
                <p className="text-text-secondary text-xs mb-2 uppercase tracking-wide">Resources</p>
                <div className="space-y-2">
                  {resources.map(resource => (
                    <a
                      key={resource.name}
                      href={resource.href}
                      onClick={e =>
                        handleLinkClick(e, resource.href, resource.external)
                      }
                      target={resource.external ? '_blank' : undefined}
                      rel={
                        resource.external ? 'noopener noreferrer' : undefined
                      }
                      className="text-text-secondary hover:text-primary transition-colors duration-200 text-sm inline-flex items-center gap-1"
                    >
                      <span>{resource.name}</span>
                      {resource.external && <ExternalLink size={12} />}
                    </a>
                  ))}
                </div>
              </div> */}
            </div>
          </div>
        </div>

        <div className="border-t border-border"></div>

        {/* Bottom Footer */}
        <div className="pt-6 flex flex-col md:flex-row justify-between items-center gap-3">
          <div className="text-text-secondary text-sm flex items-center gap-1">
            <span>
              © {currentYear} {user.name || 'Mayur Bhalgama'}
            </span>
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
