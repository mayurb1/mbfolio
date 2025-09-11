import { useEffect, useState } from 'react'
import { 
  FolderOpen, 
  Mail, 
  Image, 
  TrendingUp,
  Clock,
  User,
  Eye,
  Calendar
} from 'lucide-react'
import AdminLayout from '../components/layout/AdminLayout'
import StatsCard from '../components/ui/StatsCard'
import Button from '../components/ui/Button'

const Dashboard = () => {
  const [stats, setStats] = useState({
    projects: { total: 8, change: '+2 this month' },
    messages: { total: 12, change: '+4 new' },
    media: { total: 24, change: '+6 files' },
    views: { total: 1248, change: '+15% this week' }
  })

  const [recentActivity, setRecentActivity] = useState([
    {
      id: 1,
      type: 'contact',
      title: 'New contact form submission',
      description: 'John Doe sent a project inquiry',
      time: '2 hours ago',
      icon: Mail,
      status: 'new'
    },
    {
      id: 2,
      type: 'project',
      title: 'Project updated',
      description: 'CloudEmuse weather app was modified',
      time: '5 hours ago',
      icon: FolderOpen,
      status: 'updated'
    },
    {
      id: 3,
      type: 'media',
      title: 'New images uploaded',
      description: '3 project screenshots added',
      time: '1 day ago',
      icon: Image,
      status: 'completed'
    },
    {
      id: 4,
      type: 'contact',
      title: 'Contact form submission',
      description: 'Sarah Smith asked about collaboration',
      time: '2 days ago',
      icon: Mail,
      status: 'read'
    },
    {
      id: 5,
      type: 'project',
      title: 'New project created',
      description: 'RTO Portal project was added',
      time: '3 days ago',
      icon: FolderOpen,
      status: 'completed'
    }
  ])

  // Simulate loading stats (replace with actual API call)
  useEffect(() => {
    // This would be replaced with actual API calls
    const fetchStats = async () => {
      // Simulated API call delay
      setTimeout(() => {
        setStats({
          projects: { total: 8, change: '+2 this month' },
          messages: { total: 12, change: '+4 new' },
          media: { total: 24, change: '+6 files' },
          views: { total: 1248, change: '+15% this week' }
        })
      }, 500)
    }

    fetchStats()
  }, [])

  const getActivityIcon = (type, status) => {
    switch (type) {
      case 'contact':
        return Mail
      case 'project':
        return FolderOpen
      case 'media':
        return Image
      default:
        return Calendar
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'new':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'updated':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      case 'read':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
      case 'completed':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
    }
  }

  return (
    <AdminLayout pageTitle="Dashboard">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-600 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                Welcome back, Admin! 👋
              </h2>
              <p className="text-slate-600 dark:text-slate-300 mt-1 text-sm sm:text-base">
                Here's what's happening with your portfolio today.
              </p>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3 flex-wrap sm:flex-nowrap">
              <Button variant="secondary" size="small" className="flex-1 sm:flex-initial">
                <Eye className="w-4 h-4 mr-2" />
                <span className="hidden xs:inline">View Site</span>
                <span className="xs:hidden">Site</span>
              </Button>
              <Button size="small" className="flex-1 sm:flex-initial">
                <FolderOpen className="w-4 h-4 mr-2" />
                <span className="hidden xs:inline">Add Project</span>
                <span className="xs:hidden">Add</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatsCard
            title="Total Projects"
            value={stats.projects.total}
            icon={FolderOpen}
            change={stats.projects.change}
            description="Published projects"
          />
          <StatsCard
            title="New Messages"
            value={stats.messages.total}
            icon={Mail}
            change={stats.messages.change}
            description="Contact submissions"
          />
          <StatsCard
            title="Media Files"
            value={stats.media.total}
            icon={Image}
            change={stats.media.change}
            description="Images & documents"
          />
          <StatsCard
            title="Site Views"
            value={stats.views.total.toLocaleString()}
            icon={TrendingUp}
            change={stats.views.change}
            description="Total page views"
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          {/* Recent Activity */}
          <div className="xl:col-span-3">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-600 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Recent Activity
                </h3>
                <Button variant="ghost" size="small">
                  View All
                </Button>
              </div>

              <div className="space-y-3 sm:space-y-4">
                {recentActivity.map((activity) => {
                  const Icon = getActivityIcon(activity.type, activity.status)
                  return (
                    <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
                          <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600 dark:text-slate-300" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0">
                          <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                            {activity.title}
                          </p>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full self-start sm:self-auto ${getStatusColor(activity.status)}`}>
                            {activity.status}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
                          {activity.description}
                        </p>
                        <div className="flex items-center mt-2 text-xs text-slate-500 dark:text-slate-300">
                          <Clock className="w-3 h-3 mr-1 flex-shrink-0" />
                          <span>{activity.time}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="xl:col-span-2">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-600 p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 sm:mb-6">
                Quick Actions
              </h3>
              
              <div className="space-y-3 sm:space-y-4">
                <Button 
                  variant="primary" 
                  size="medium"
                  className="w-full justify-start text-sm sm:text-base"
                  onClick={() => {
                    // Navigate to add project page
                    console.log('Navigate to add project')
                  }}
                >
                  <FolderOpen className="w-4 h-4 mr-2 sm:mr-3 flex-shrink-0" />
                  <span>Add New Project</span>
                </Button>
                
                <Button 
                  variant="secondary" 
                  size="medium"
                  className="w-full justify-start text-sm sm:text-base"
                  onClick={() => {
                    // Navigate to contact forms
                    console.log('Navigate to contact forms')
                  }}
                >
                  <Mail className="w-4 h-4 mr-2 sm:mr-3 flex-shrink-0" />
                  <span>View Messages</span>
                </Button>
                
                <Button 
                  variant="secondary" 
                  size="medium"
                  className="w-full justify-start text-sm sm:text-base"
                  onClick={() => {
                    // Navigate to media management
                    console.log('Navigate to media')
                  }}
                >
                  <Image className="w-4 h-4 mr-2 sm:mr-3 flex-shrink-0" />
                  <span>Manage Media</span>
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="medium"
                  className="w-full justify-start text-sm sm:text-base"
                  onClick={() => {
                    // Open site in new tab
                    window.open('/', '_blank')
                  }}
                >
                  <Eye className="w-4 h-4 mr-2 sm:mr-3 flex-shrink-0" />
                  <span>View Portfolio</span>
                </Button>
              </div>

              {/* User info */}
              <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-slate-200 dark:border-slate-600">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                      Admin User
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-300 truncate">
                      Last login: Today at 2:30 PM
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default Dashboard