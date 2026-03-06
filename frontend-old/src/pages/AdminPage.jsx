import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminAPI, projectsAPI } from '../services/api'
import toast from 'react-hot-toast'
import { 
  Shield, 
  Loader2, 
  CheckCircle, 
  XCircle, 
  Clock,
  Users,
  FolderOpen,
  TrendingUp,
  AlertTriangle,
  Eye,
  ThumbsUp,
  ThumbsDown,
  ExternalLink,
  Star,
  Sparkles
} from 'lucide-react'

export default function AdminPage() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('pending')
  const [selectedProject, setSelectedProject] = useState(null)

  // Fetch stats
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminAPI.getStats(),
  })

  // Fetch pending projects
  const { data: pendingData, isLoading: pendingLoading } = useQuery({
    queryKey: ['pending-projects'],
    queryFn: () => adminAPI.getPendingProjects(),
  })

  // Fetch all projects
  const { data: allProjectsData, isLoading: allProjectsLoading } = useQuery({
    queryKey: ['all-projects'],
    queryFn: () => projectsAPI.getAll({ limit: 100 }),
  })

  const stats = statsData?.data?.stats || {}
  const pendingProjects = pendingData?.data?.projects || []
  const allProjects = allProjectsData?.data?.projects || []

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: (projectId) => adminAPI.approveProject(projectId),
    onSuccess: () => {
      toast.success('Project approved!')
      queryClient.invalidateQueries({ queryKey: ['pending-projects'] })
      queryClient.invalidateQueries({ queryKey: ['all-projects'] })
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
      setSelectedProject(null)
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to approve project')
    },
  })

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: ({ projectId, reason }) => adminAPI.rejectProject(projectId, reason),
    onSuccess: () => {
      toast.success('Project rejected')
      queryClient.invalidateQueries({ queryKey: ['pending-projects'] })
      queryClient.invalidateQueries({ queryKey: ['all-projects'] })
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
      setSelectedProject(null)
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to reject project')
    },
  })

  // Feature mutation
  const featureMutation = useMutation({
    mutationFn: ({ projectId, featured }) => adminAPI.featureProject(projectId, featured),
    onSuccess: (_, { featured }) => {
      toast.success(featured ? 'Project featured!' : 'Project unfeatured')
      queryClient.invalidateQueries({ queryKey: ['all-projects'] })
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update feature status')
    },
  })

  const handleReject = (projectId) => {
    const reason = prompt('Enter rejection reason (optional):')
    rejectMutation.mutate({ projectId, reason })
  }

  const getStatusConfig = (status) => {
    switch (status) {
      case 'approved':
        return { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10' }
      case 'pending':
        return { icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/10' }
      case 'rejected':
        return { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10' }
      default:
        return { icon: Clock, color: 'text-slate-400', bg: 'bg-slate-500/10' }
    }
  }

  if (statsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen animate-fade-in pb-20">
      {/* Header */}
      <div className="bg-gradient-to-b from-slate-800/50 to-transparent py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-primary-400" />
            <h1 className="text-3xl sm:text-4xl font-bold text-white">Admin Dashboard</h1>
          </div>
          <p className="text-slate-400">
            Manage projects, review submissions, and monitor platform activity.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-primary-500/10 rounded-xl">
                <FolderOpen className="w-6 h-6 text-primary-400" />
              </div>
              <TrendingUp className="w-4 h-4 text-green-400" />
            </div>
            <p className="text-3xl font-bold text-white">{stats.totalProjects || allProjects.length}</p>
            <p className="text-sm text-slate-400">Total Projects</p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-500/10 rounded-xl">
                <Clock className="w-6 h-6 text-yellow-400" />
              </div>
              {pendingProjects.length > 0 && (
                <span className="flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-yellow-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-400"></span>
                </span>
              )}
            </div>
            <p className="text-3xl font-bold text-white">{pendingProjects.length}</p>
            <p className="text-sm text-slate-400">Pending Review</p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500/10 rounded-xl">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white">
              {allProjects.filter(p => p.status === 'approved').length}
            </p>
            <p className="text-sm text-slate-400">Approved</p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-500/10 rounded-xl">
                <Sparkles className="w-6 h-6 text-purple-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white">
              {allProjects.filter(p => p.featured).length}
            </p>
            <p className="text-sm text-slate-400">Featured</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {[
            { id: 'pending', label: 'Pending Review', count: pendingProjects.length },
            { id: 'all', label: 'All Projects', count: allProjects.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary-500 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  activeTab === tab.id ? 'bg-white/20' : 'bg-slate-700'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden">
          {activeTab === 'pending' && (
            <>
              {pendingLoading ? (
                <div className="p-12 text-center">
                  <Loader2 className="w-8 h-8 text-primary-500 animate-spin mx-auto" />
                </div>
              ) : pendingProjects.length === 0 ? (
                <div className="p-12 text-center">
                  <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">All caught up!</h3>
                  <p className="text-slate-400">No projects pending review</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-700">
                  {pendingProjects.map((project) => (
                    <div key={project.id} className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-white">{project.title}</h3>
                            <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-400 rounded-full text-xs">
                              Pending
                            </span>
                          </div>
                          <p className="text-slate-400 text-sm mb-3 line-clamp-2">
                            {project.description}
                          </p>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {project.techStack?.map((tech, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-xs"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            <span>By: {project.ownerName || project.ownerId}</span>
                            {project.createdAt && (
                              <span>
                                Submitted: {new Date(project.createdAt._seconds * 1000).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <a
                            href={`/projects/${project.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-5 h-5" />
                          </a>
                          <button
                            onClick={() => approveMutation.mutate(project.id)}
                            disabled={approveMutation.isPending}
                            className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors disabled:opacity-50"
                          >
                            <ThumbsUp className="w-4 h-4" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => handleReject(project.id)}
                            disabled={rejectMutation.isPending}
                            className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50"
                          >
                            <ThumbsDown className="w-4 h-4" />
                            <span>Reject</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'all' && (
            <>
              {allProjectsLoading ? (
                <div className="p-12 text-center">
                  <Loader2 className="w-8 h-8 text-primary-500 animate-spin mx-auto" />
                </div>
              ) : allProjects.length === 0 ? (
                <div className="p-12 text-center">
                  <FolderOpen className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">No projects</h3>
                  <p className="text-slate-400">No projects have been created yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-900/50">
                      <tr>
                        <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-4">
                          Project
                        </th>
                        <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-4">
                          Status
                        </th>
                        <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-4">
                          Featured
                        </th>
                        <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-4">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                      {allProjects.map((project) => {
                        const statusConfig = getStatusConfig(project.status)
                        const StatusIcon = statusConfig.icon
                        
                        return (
                          <tr key={project.id} className="hover:bg-slate-700/30">
                            <td className="px-6 py-4">
                              <div>
                                <p className="font-medium text-white">{project.title}</p>
                                <p className="text-sm text-slate-400 truncate max-w-xs">
                                  {project.ownerName || project.ownerId}
                                </p>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-1 px-2 py-1 ${statusConfig.bg} ${statusConfig.color} rounded-full text-xs`}>
                                <StatusIcon className="w-3 h-3" />
                                {project.status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => featureMutation.mutate({ 
                                  projectId: project.id, 
                                  featured: !project.featured 
                                })}
                                disabled={featureMutation.isPending}
                                className={`p-2 rounded-lg transition-colors ${
                                  project.featured
                                    ? 'bg-purple-500/20 text-purple-400'
                                    : 'bg-slate-700 text-slate-400 hover:text-white'
                                }`}
                              >
                                <Star className={`w-4 h-4 ${project.featured ? 'fill-current' : ''}`} />
                              </button>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <a
                                  href={`/projects/${project.id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                                {project.status === 'pending' && (
                                  <>
                                    <button
                                      onClick={() => approveMutation.mutate(project.id)}
                                      disabled={approveMutation.isPending}
                                      className="p-2 text-green-400 hover:bg-green-500/20 rounded-lg transition-colors"
                                    >
                                      <ThumbsUp className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => handleReject(project.id)}
                                      disabled={rejectMutation.isPending}
                                      className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                                    >
                                      <ThumbsDown className="w-4 h-4" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
