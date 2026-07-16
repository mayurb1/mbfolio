import { Github, Linkedin, Mail } from 'lucide-react'

// Build the social links array (GitHub, LinkedIn, Email) purely from the
// dynamic contact info. Links the user hasn't provided are filtered out.
// Shared between Hero and Footer.
export function useSocialLinks(contactInfo) {
  return [
    {
      name: 'GitHub',
      url: contactInfo.githubUrl || null,
      icon: Github,
      color: 'hover:text-gray-900 dark:hover:text-white',
    },
    {
      name: 'LinkedIn',
      url: contactInfo.linkedinUrl || null,
      icon: Linkedin,
      color: 'hover:text-blue-600',
    },
    {
      name: 'Email',
      url: contactInfo.email ? `mailto:${contactInfo.email}` : null,
      icon: Mail,
      color: 'hover:text-red-500',
    },
  ].filter(link => link.url)
}
