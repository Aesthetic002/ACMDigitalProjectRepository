import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminAPI, projectsAPI } from '../services/api'
import { GlowingEffect } from '../components/ui/glowing-effect'
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

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminAPI.getStats(),
  })

  const { data: pendingData, isLoading: pendingLoading } = useQuery({
    queryKey: ['pending-projects'],
    queryFn: () => adminAPI.getPendingProjects(),
  })

  const { data: allProjectsData, isLoading: allProjectsLoading } = useQuery({
    queryKey: ['all-projects'],
    queryFn: () => projectsAPI.getAll({ limit: 100 }),
  })

  const stats = statsData?.data?.stats || {}
  const pendingProjects = pendingData?.data?.projects || []
  const allProjects = allProjectsData?.data?.projects || []

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
        return { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' }
      case 'pending':
        return { icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' }
      case 'rejected':
        return { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' }
      default:
        return { icon: Clock, color: 'text-zinc-400', bg: 'bg-zinc-500/10', border: 'border-zinc-500/20' }
    }
  }

  if (statsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
      </div>
    )
  }

  const dashboardStats = [
    { icon: FolderOpen, label: 'Total Projects', value: stats.totalProjects || allProjects.length, iconBg: 'bg-primary-500/10', iconColor: 'text-primary-400', extra: <TrendingUp className="w-4 h-4 text-emerald-400" /> },
    { icon: Clock, label: 'Pending Review', value: pendingProjects.length, iconBg: 'bg-amber-500/10', iconColor: 'text-amber-400', extra: pendingProjects.length > 0 ? <span className="flex h-3 w-3"><span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-amber-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-amber-400"></span></span> : null },
    { icon: CheckCircle, label: 'Approved', value: allProjects.filter(p => p.status === 'approved').length, iconBg: 'bg-emerald-500/10', iconColor: 'text-emerald-400' },
    { icon: Sparkles, label: 'Featured', value: allProjects.filter(p => p.featured).length, iconBg: 'bg-purple-500/10', iconColor: 'text-purple-400' },
  ]

  return (
    <div className="min-h-screen animate-fade-in pb-20">
      {/* Header */}
      <div className="relative py-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-500/5 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary-500/8 rounded-full blur-[100px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-primary-400" />
            <h1 className="text-3xl sm:text-4xl font-bold text-white">Admin Dashboard</h1>
          </div>
          <p className="text-zinc-400">
            Manage projects, review submissions, and monitor platform activity.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {dashboardStats.map((stat, index) => (
            <div key={index} className="relative rounded-[1.25rem] border-[0.75px] border-zinc-700/40 p-1">
              <GlowingEffect
                spread={40}
                glow={true}
                disabled={false}
                proximity={64}
                inactiveZone={0.01}
                borderWidth={2}
              />
              <div className="relative bg-zinc-800/60 backdrop-blur-sm rounded-[0.9rem] p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 ${stat.iconBg} rounded-xl`}>
                    <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                  </div>
                  {stat.extra}
                </div>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-zinc-400 mt-1">{stat.label}</p>
              </div>
            </div>
          ))}
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
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${activeTab === tab.id
                  ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20'
                  : 'bg-zinc-800/80 text-zinc-400 hover:text-white border border-zinc-700/50'
                }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === tab.id ? 'bg-white/20' : 'bg-zinc-700'
                  }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="glass-premium rounded-2xl overflow-hidden">
          {activeTab === 'pending' && (
            <>
              {pendingLoading ? (
                <div className="p-12 text-center">
                  <Loader2 className="w-8 h-8 text-primary-500 animate-spin mx-auto" />
                </div>
              ) : pendingProjects.length === 0 ? (
                <div className="p-12 text-center">
                  <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">All caught up!</h3>
                  <p className="text-zinc-400">No projects pending review</p>
                </div>
              ) : (
                <div className="divide-y divide-zinc-700/30">
                  {pendingProjects.map((project) => (
                    <div key={project.id} className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-white">{project.title}</h3>
                            <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 rounded-full text-xs border border-amber-500/20">
                              Pending
                            </span>
                          </div>
                          <p className="text-zinc-400 text-sm mb-3 line-clamp-2">
                            {project.description}
                          </p>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {project.techStack?.map((tech, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-zinc-700/40 text-zinc-300 rounded text-xs border border-zinc-600/30"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-zinc-500">
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
                            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700/40 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-5 h-5" />
                          </a>
                          <button
                            onClick={() => approveMutation.mutate(project.id)}
                            disabled={approveMutation.isPending}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-500/15 text-emerald-400 rounded-lg hover:bg-emerald-500/25 transition-colors disabled:opacity-50 border border-emerald-500/20"
                          >
                            <ThumbsUp className="w-4 h-4" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => handleReject(project.id)}
                            disabled={rejectMutation.isPending}
                            className="flex items-center gap-2 px-4 py-2 bg-red-500/15 text-red-400 rounded-lg hover:bg-red-500/25 transition-colors disabled:opacity-50 border border-red-500/20"
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
                  <FolderOpen className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">No projects</h3>
                  <p className="text-zinc-400">No projects have been created yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-zinc-900/40">
                      <tr>
                        <th className="text-left text-xs font-medium text-zinc-400 uppercase tracking-wider px-6 py-4">
                          Project
                        </th>
                        <th className="text-left text-xs font-medium text-zinc-400 uppercase tracking-wider px-6 py-4">
                          Status
                        </th>
                        <th className="text-left text-xs font-medium text-zinc-400 uppercase tracking-wider px-6 py-4">
                          Featured
                        </th>
                        <th className="text-left text-xs font-medium text-zinc-400 uppercase tracking-wider px-6 py-4">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-700/30">
                      {allProjects.map((project) => {
                        const statusConfig = getStatusConfig(project.status)
                        const StatusIcon = statusConfig.icon

                        return (
                          <tr key={project.id} className="hover:bg-zinc-700/20 transition-colors">
                            <td className="px-6 py-4">
                              <div>
                                <p className="font-medium text-white">{project.title}</p>
                                <p className="text-sm text-zinc-400 truncate max-w-xs">
                                  {project.ownerName || project.ownerId}
                                </p>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-1 px-2 py-1 ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border} border rounded-full text-xs`}>
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
                                className={`p-2 rounded-lg transition-all border ${project.featured
                                    ? 'bg-purple-500/15 text-purple-400 border-purple-500/20'
                                    : 'bg-zinc-800/60 text-zinc-400 hover:text-white border-zinc-700/40'
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
                                  className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700/40 rounded-lg transition-colors"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                                {project.status === 'pending' && (
                                  <>
                                    <button
                                      onClick={() => approveMutation.mutate(project.id)}
                                      disabled={approveMutation.isPending}
                                      className="p-2 text-emerald-400 hover:bg-emerald-500/15 rounded-lg transition-colors"
                                    >
                                      <ThumbsUp className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => handleReject(project.id)}
                                      disabled={rejectMutation.isPending}
                                      className="p-2 text-red-400 hover:bg-red-500/15 rounded-lg transition-colors"
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
