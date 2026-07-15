import { Github, Linkedin, Mail } from 'lucide-react'
import { LINKS } from '../data/links'

// Build the social links array (GitHub, LinkedIn, Email) from dynamic contact
// info with a fallback to the static LINKS. Shared between Hero and Footer.
export function useSocialLinks(contactInfo) {
  return [
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
}
