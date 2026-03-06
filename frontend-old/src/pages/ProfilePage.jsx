import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usersAPI, projectsAPI } from '../services/api'
import { useAuthStore } from '../store/authStore'
import { updateProfile } from 'firebase/auth'
import { auth } from '../config/firebase'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { 
  User, 
  Mail, 
  Calendar, 
  Edit3, 
  Save, 
  X, 
  Loader2, 
  ExternalLink,
  FolderOpen,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react'

export default function ProfilePage() {
  const { user, setUser } = useAuthStore()
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  const [displayName, setDisplayName] = useState(user?.displayName || '')

  // Fetch user profile
  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => usersAPI.getProfile(),
  })

  // Fetch user's projects
  const { data: projectsData, isLoading: projectsLoading } = useQuery({
    queryKey: ['my-projects'],
    queryFn: () => projectsAPI.getAll({ ownerId: user?.uid, limit: 50 }),
    enabled: !!user?.uid,
  })

  const profile = profileData?.data?.user
  const projects = projectsData?.data?.projects || []

  // Update profile mutation
  const updateMutation = useMutation({
    mutationFn: async (newDisplayName) => {
      // Update Firebase profile
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: newDisplayName })
      }
      // Update backend
      return usersAPI.updateProfile({ displayName: newDisplayName })
    },
    onSuccess: () => {
      setUser({ ...user, displayName })
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      toast.success('Profile updated successfully!')
      setIsEditing(false)
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update profile')
    },
  })

  const handleSave = () => {
    if (!displayName.trim()) {
      toast.error('Display name cannot be empty')
      return
    }
    updateMutation.mutate(displayName)
  }

  const handleCancel = () => {
    setDisplayName(user?.displayName || '')
    setIsEditing(false)
  }

  const getStatusConfig = (status) => {
    switch (status) {
      case 'approved':
        return { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10', label: 'Approved' }
      case 'pending':
        return { icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/10', label: 'Pending' }
      case 'rejected':
        return { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10', label: 'Rejected' }
      default:
        return { icon: Clock, color: 'text-slate-400', bg: 'bg-slate-500/10', label: status }
    }
  }

  const projectStats = {
    total: projects.length,
    approved: projects.filter(p => p.status === 'approved').length,
    pending: projects.filter(p => p.status === 'pending').length,
    rejected: projects.filter(p => p.status === 'rejected').length,
  }

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen animate-fade-in pb-20">
      {/* Header */}
      <div className="bg-gradient-to-b from-slate-800/50 to-transparent py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName}
                  className="w-24 h-24 rounded-2xl object-cover border-4 border-slate-700"
                />
              ) : (
                <div className="w-24 h-24 bg-gradient-to-tr from-primary-500 to-cyan-400 rounded-2xl flex items-center justify-center text-3xl font-bold text-white border-4 border-slate-700">
                  {(user?.displayName || user?.email || 'U').charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1 text-center sm:text-left">
              {isEditing ? (
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xl font-semibold focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    autoFocus
                  />
                  <button
                    onClick={handleSave}
                    disabled={updateMutation.isPending}
                    className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
                  >
                    {updateMutation.isPending ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Save className="w-5 h-5" />
                    )}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <h1 className="text-2xl sm:text-3xl font-bold text-white">
                    {user?.displayName || 'Anonymous User'}
                  </h1>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 text-slate-400 hover:text-white transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              )}
              
              <div className="flex flex-wrap items-center gap-4 mt-2 justify-center sm:justify-start text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-4 h-4" />
                  {user?.email}
                </span>
                {profile?.createdAt && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    Joined {new Date(profile.createdAt._seconds * 1000).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-white">{projectStats.total}</p>
            <p className="text-sm text-slate-400">Total Projects</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-green-400">{projectStats.approved}</p>
            <p className="text-sm text-slate-400">Approved</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-yellow-400">{projectStats.pending}</p>
            <p className="text-sm text-slate-400">Pending</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-red-400">{projectStats.rejected}</p>
            <p className="text-sm text-slate-400">Rejected</p>
          </div>
        </div>

        {/* Projects Section */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-slate-700">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-primary-400" />
              My Projects
            </h2>
            <Link to="/projects/new" className="btn-primary text-sm">
              New Project
            </Link>
          </div>

          {projectsLoading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 text-primary-500 animate-spin mx-auto" />
            </div>
          ) : projects.length === 0 ? (
            <div className="p-12 text-center">
              <FolderOpen className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No projects yet</h3>
              <p className="text-slate-400 mb-4">
                Start sharing your work with the community
              </p>
              <Link to="/projects/new" className="btn-primary">
                Create Your First Project
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-700">
              {projects.map((project) => {
                const statusConfig = getStatusConfig(project.status)
                const StatusIcon = statusConfig.icon
                
                return (
                  <div
                    key={project.id}
                    className="p-4 hover:bg-slate-700/30 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/projects/${project.id}`}
                            className="text-white font-medium hover:text-primary-400 transition-colors truncate"
                          >
                            {project.title}
                          </Link>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 ${statusConfig.bg} ${statusConfig.color} rounded-full text-xs`}>
                            <StatusIcon className="w-3 h-3" />
                            {statusConfig.label}
                          </span>
                        </div>
                        <p className="text-slate-400 text-sm mt-1 line-clamp-1">
                          {project.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          {project.techStack?.slice(0, 3).map((tech, index) => (
                            <span
                              key={index}
                              className="px-2 py-0.5 bg-slate-700 text-slate-300 rounded text-xs"
                            >
                              {tech}
                            </span>
                          ))}
                          {project.techStack?.length > 3 && (
                            <span className="text-xs text-slate-500">
                              +{project.techStack.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/projects/${project.id}/edit`}
                          className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Link>
                        <Link
                          to={`/projects/${project.id}`}
                          className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
