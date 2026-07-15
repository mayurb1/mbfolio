import { cache } from 'react'
import { connectDB } from '@/lib/db'
import Users from '@/models/users'
import Experience from '@/models/Experience'
import Project from '@/models/Project'

// Shared master-data aggregation used by BOTH the /api/master Route Handler and
// the server-rendered public site (so the public page can be SSR/ISR without an
// extra HTTP round-trip). Wrapped in React cache() to dedupe within a request.
//
// Scope with { username } (preferred) or { userId }. With neither, falls back to
// the PRIMARY_USERNAME env user, then to the first user in the collection — so
// the legacy single-site root keeps working.
// Returns the masterData object, or null if the target user profile is absent.
const SELECT_FIELDS =
  'bio profileImage name email phone linkedUrl githubUrl location headline availability resume username'

export const getMasterData = cache(async ({ username, userId } = {}) => {
  await connectDB()

  // Resolve which user's profile to load.
  let query
  if (userId) {
    query = { _id: userId }
  } else if (username) {
    query = { username: String(username).toLowerCase().trim() }
  } else if (process.env.PRIMARY_USERNAME) {
    query = { username: String(process.env.PRIMARY_USERNAME).toLowerCase().trim() }
  } else {
    query = {}
  }

  // .lean() → plain object so it's safely serializable as an RSC prop.
  const user = await Users.findOne(query).select(SELECT_FIELDS).lean()

  if (!user) return null

  const experiences = await Experience.find({
    isActive: true,
    userId: user._id,
  }).select('startDate endDate isOngoing')

  let totalExperienceMonths = 0
  if (experiences.length > 0) {
    const earliestStartDate = experiences.reduce((earliest, exp) => {
      const startDate = new Date(exp.startDate)
      return startDate < earliest ? startDate : earliest
    }, new Date(experiences[0].startDate))

    const latestEndDate = experiences.reduce(
      (latest, exp) => {
        if (exp.isOngoing || !exp.endDate) {
          return new Date() > latest ? new Date() : latest
        }
        const endDate = new Date(exp.endDate)
        return endDate > latest ? endDate : latest
      },
      new Date(experiences[0].endDate || new Date())
    )

    const startYear = earliestStartDate.getFullYear()
    const startMonth = earliestStartDate.getMonth()
    const endYear = latestEndDate.getFullYear()
    const endMonth = latestEndDate.getMonth()

    totalExperienceMonths = (endYear - startYear) * 12 + (endMonth - startMonth)
  }

  const years = Math.floor(totalExperienceMonths / 12)
  const months = totalExperienceMonths % 12

  let experienceText = ''
  if (years > 0 && months > 0) {
    experienceText = `${years}.${months}`
  } else if (years > 0) {
    experienceText = `${years}+ years`
  } else if (months > 0) {
    experienceText = `${months} months`
  } else {
    experienceText = 'Getting started'
  }

  const completedProjectsCount = await Project.countDocuments({
    userId: user._id,
    status: 'completed',
    isActive: true,
  })
  const totalProjectsCount = await Project.countDocuments({
    userId: user._id,
    isActive: true,
  })
  const activeExperiencesCount = await Experience.countDocuments({
    userId: user._id,
    isActive: true,
  })

  return {
    user: {
      id: user._id?.toString(),
      name: user.name,
      username: user.username,
      email: user.email,
      phone: user.phone || null,
      bio: user.bio || '',
      profileImage: user.profileImage || null,
      linkedinUrl: user.linkedUrl || null,
      githubUrl: user.githubUrl || null,
      location: {
        full: user.location || null,
        city: user.location?.city || null,
        state: user.location?.state || null,
        country: user.location?.country || null,
        address: user.location?.address || null,
        coordinates: user.location?.coordinates || null,
      },
      headline: user.headline || null,
      availability: user.availability !== undefined ? user.availability : null,
      resume: user.resume || null,
    },
    stats: {
      experience: {
        text: experienceText,
        years,
        months,
        totalMonths: totalExperienceMonths,
      },
      projects: {
        completed: completedProjectsCount,
        total: totalProjectsCount,
      },
      experiences: {
        count: activeExperiencesCount,
      },
    },
    highlights: [
      'React.js, Next.js, JavaScript, HTML5, CSS3',
      'Reusable UI with Material UI, Ant Design, Tailwind CSS',
      'Application design, debugging, and performance improvement',
      'Front-end architecture and webpage optimization',
      'Strong client communication and requirement understanding',
      'Manual testing and issue resolution',
    ],
  }
})
