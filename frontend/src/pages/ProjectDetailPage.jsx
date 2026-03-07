import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { formatDistanceToNow, format } from 'date-fns'
import { projectsAPI } from '../services/api'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'
import {
  ArrowLeft, Calendar, Users, Github, ExternalLink,
  Edit, Trash2, Star, Clock, CheckCircle, XCircle,
  AlertCircle, Loader2, Share2
} from 'lucide-react'

export default function ProjectDetailPage() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user, isAuthenticated } = useAuthStore()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectsAPI.getById(projectId),
    enabled: !!projectId,
  })

  const project = data?.data?.project

  const deleteMutation = useMutation({
    mutationFn: () => projectsAPI.delete(projectId),
    onSuccess: () => {
      toast.success('Project archived successfully')
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      navigate('/projects')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete project')
    },
  })

  const isOwner = isAuthenticated && user?.uid === project?.ownerId
  const isContributor = isAuthenticated && project?.contributors?.includes(user?.uid)
  const canEdit = isOwner || isContributor || user?.role === 'admin'

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to archive this project? This can be undone by an admin.')) {
      deleteMutation.mutate()
    }
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success('Link copied to clipboard!')
  }

  const statusConfig = {
    pending: { icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/15', border: 'border-amber-500/20', label: 'Pending Review' },
    approved: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/15', border: 'border-emerald-500/20', label: 'Approved' },
    rejected: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/15', border: 'border-red-500/20', label: 'Rejected' },
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
      </div>
    )
  }

  if (isError || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Project Not Found</h1>
          <p className="text-zinc-400 mb-6">The project you're looking for doesn't exist or has been removed.</p>
          <Link to="/projects" className="btn-primary">
            Browse Projects
          </Link>
        </div>
      </div>
    )
  }

  const StatusIcon = statusConfig[project.status]?.icon || AlertCircle

  return (
    <div className="min-h-screen animate-fade-in">
      {/* Header with gradient */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-500/5 via-transparent to-transparent" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary-500/5 rounded-full blur-[100px]" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            to="/projects"
            className="inline-flex items-center space-x-2 text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Projects</span>
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                {project.isFeatured && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500 text-amber-950 rounded-full text-xs font-semibold shadow-lg shadow-amber-500/20">
                    <Star className="w-3 h-3" />
                    Featured
                  </span>
                )}
                <span className={`inline-flex items-center gap-1 px-3 py-1 ${statusConfig[project.status]?.bg} ${statusConfig[project.status]?.color} ${statusConfig[project.status]?.border} border rounded-full text-sm`}>
                  <StatusIcon className="w-3.5 h-3.5" />
                  {statusConfig[project.status]?.label}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white">
                {project.title}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="p-2 rounded-lg bg-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-700/80 transition-all border border-zinc-700/50"
              >
                <Share2 className="w-5 h-5" />
              </button>
              {canEdit && (
                <>
                  <Link
                    to={`/projects/${projectId}/edit`}
                    className="p-2 rounded-lg bg-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-700/80 transition-all border border-zinc-700/50"
                  >
                    <Edit className="w-5 h-5" />
                  </Link>
                  {isOwner && (
                    <button
                      onClick={handleDelete}
                      disabled={deleteMutation.isPending}
                      className="p-2 rounded-lg bg-zinc-800/80 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all border border-zinc-700/50"
                    >
                      {deleteMutation.isPending ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Trash2 className="w-5 h-5" />
                      )}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-400">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              Created {project.createdAt ? format(new Date(project.createdAt), 'MMM d, yyyy') : 'Recently'}
            </span>
            {project.contributors?.length > 0 && (
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {project.contributors.length} contributor{project.contributors.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <div className="glass-premium rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">About This Project</h2>
              <p className="text-zinc-300 whitespace-pre-wrap leading-relaxed">
                {project.description}
              </p>
            </div>

            {project.assets?.length > 0 && (
              <div className="glass-premium rounded-2xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Screenshots & Files</h2>
                <div className="grid grid-cols-2 gap-4">
                  {project.assets.map((asset) => (
                    <a
                      key={asset.id}
                      href={asset.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block rounded-lg overflow-hidden bg-zinc-900 group relative hover:ring-2 hover:ring-primary-500/50 transition-all"
                    >
                      {asset.contentType?.startsWith('image/') ? (
                        <>
                          <img src={asset.url} alt={asset.filename} className="w-full h-40 object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                            <ExternalLink className="w-6 h-6 text-white drop-shadow-lg" />
                          </div>
                        </>
                      ) : (
                        <div className="h-40 flex flex-col items-center justify-center text-zinc-400 group-hover:text-white transition-colors p-4 text-center">
                          <ExternalLink className="w-8 h-8 mb-2 opacity-50 group-hover:opacity-100" />
                          <span className="text-sm font-medium truncate w-full px-2">{asset.filename}</span>
                        </div>
                      )}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {project.techStack?.length > 0 && (
              <div className="glass-premium rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Tech Stack</h3>
                <div className="flex flex-wrap gap-2">
                  {project.techStack.map((tech, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-primary-500/10 text-primary-400 border border-primary-500/20 rounded-lg text-sm"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="glass-premium rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Links</h3>
              <div className="space-y-3">
                {(project.githubUrl || project.repoUrl) && (
                  <a
                    href={project.githubUrl || project.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/60 hover:bg-zinc-700/60 transition-all border border-zinc-700/40 hover:border-zinc-600/60"
                  >
                    <Github className="w-5 h-5 text-zinc-400" />
                    <span className="text-zinc-300">View Source Code</span>
                    <ExternalLink className="w-4 h-4 text-zinc-500 ml-auto" />
                  </a>
                )}
                {project.demoUrl && (
                  <a
                    href={project.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/60 hover:bg-zinc-700/60 transition-all border border-zinc-700/40 hover:border-zinc-600/60"
                  >
                    <ExternalLink className="w-5 h-5 text-zinc-400" />
                    <span className="text-zinc-300">Live Demo</span>
                    <ExternalLink className="w-4 h-4 text-zinc-500 ml-auto" />
                  </a>
                )}
                {!project.githubUrl && !project.demoUrl && (
                  <p className="text-zinc-500 text-sm">No external links available</p>
                )}
              </div>
            </div>

            <div className="glass-premium rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Project Info</h3>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-zinc-400">Status</dt>
                  <dd className={statusConfig[project.status]?.color}>{project.status}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-zinc-400">Created</dt>
                  <dd className="text-zinc-300">
                    {project.createdAt
                      ? formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })
                      : 'Unknown'}
                  </dd>
                </div>
                {project.updatedAt && (
                  <div className="flex justify-between">
                    <dt className="text-zinc-400">Updated</dt>
                    <dd className="text-zinc-300">
                      {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}
                    </dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-zinc-400">Project ID</dt>
                  <dd className="text-zinc-500 font-mono text-xs">{project.id}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
