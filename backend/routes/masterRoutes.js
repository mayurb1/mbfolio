const express = require('express')
const Users = require('../models/users')
const Experience = require('../models/Experience')
const Project = require('../models/Project')

const router = express.Router()

// GET /api/master - Get master data for entire website (public)
router.get('/', async (req, res) => {
  try {
    // Get complete user data
    const user = await Users.findOne({}).select(
      'bio profileImage name email phone linkedUrl githubUrl location headline availability resume'
    )

    if (!user) {
      return res.status(404).json({
        message: 'User profile not found',
        status: 404,
      })
    }

    // Calculate total experience from all experiences
    const experiences = await Experience.find({ isActive: true }).select(
      'startDate endDate isOngoing'
    )

    let totalExperienceMonths = 0
    if (experiences.length > 0) {
      // Find earliest start date
      const earliestStartDate = experiences.reduce((earliest, exp) => {
        const startDate = new Date(exp.startDate)
        return startDate < earliest ? startDate : earliest
      }, new Date(experiences[0].startDate))

      // Find latest end date (or current date if ongoing)
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

      // Calculate total months
      const startYear = earliestStartDate.getFullYear()
      const startMonth = earliestStartDate.getMonth()
      const endYear = latestEndDate.getFullYear()
      const endMonth = latestEndDate.getMonth()

      totalExperienceMonths =
        (endYear - startYear) * 12 + (endMonth - startMonth)
    }

    // Convert to years and months
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

    // Count completed projects
    const completedProjectsCount = await Project.countDocuments({
      status: 'completed',
      isActive: true,
    })

    // Get some additional stats
    const totalProjectsCount = await Project.countDocuments({ isActive: true })
    const activeExperiencesCount = await Experience.countDocuments({
      isActive: true,
    })

    // Prepare master data for entire website
    const masterData = {
      user: {
        name: user.name,
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
          years: years,
          months: months,
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
      // Skills and highlights for About section
      highlights: [
        'React.js, Next.js, JavaScript, HTML5, CSS3',
        'Reusable UI with Material UI, Ant Design, Tailwind CSS',
        'Application design, debugging, and performance improvement',
        'Front-end architecture and webpage optimization',
        'Strong client communication and requirement understanding',
        'Manual testing and issue resolution',
      ],
    }

    res.status(200).json({
      data: masterData,
      message: 'Master data retrieved successfully',
      status: 200,
    })
  } catch (err) {
    res.status(500).json({
      message: err.message,
      status: 500,
    })
  }
})

module.exports = router
