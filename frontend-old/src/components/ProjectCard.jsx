import { Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { Users, Calendar, ArrowUpRight, Star } from 'lucide-react'

export default function ProjectCard({ project }) {
  const statusColors = {
    pending: 'badge-warning',
    approved: 'badge-success',
    rejected: 'badge-error',
  }

  return (
    <div className="group bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden card-hover">
      {/* Project Image/Preview */}
      <div className="relative h-48 bg-gradient-to-br from-slate-700 to-slate-800 overflow-hidden">
        {project.thumbnail ? (
          <img
            src={project.thumbnail}
            alt={project.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-6xl opacity-20">
              {project.techStack?.[0]?.charAt(0) || '🚀'}
            </div>
          </div>
        )}
        
        {/* Featured badge */}
        {project.isFeatured && (
          <div className="absolute top-3 left-3 flex items-center space-x-1 bg-amber-500 text-amber-950 px-2 py-1 rounded-full text-xs font-semibold">
            <Star className="w-3 h-3" />
            <span>Featured</span>
          </div>
        )}

        {/* Status badge */}
        <div className={`absolute top-3 right-3 badge ${statusColors[project.status] || 'badge-info'}`}>
          {project.status}
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content */}
      <div className="p-5">
        <Link to={`/projects/${project.id}`}>
          <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-primary-400 transition-colors line-clamp-1">
            {project.title}
          </h3>
        </Link>

        <p className="text-slate-400 text-sm mb-4 line-clamp-2">
          {project.description}
        </p>

        {/* Tech Stack */}
        <div className="flex flex-wrap gap-2 mb-4">
          {project.techStack?.slice(0, 3).map((tech, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-slate-700/50 text-slate-300 rounded-md text-xs"
            >
              {tech}
            </span>
          ))}
          {project.techStack?.length > 3 && (
            <span className="px-2 py-1 text-slate-400 text-xs">
              +{project.techStack.length - 3} more
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
          <div className="flex items-center space-x-4 text-xs text-slate-400">
            {project.contributors?.length > 0 && (
              <span className="flex items-center space-x-1">
                <Users className="w-3.5 h-3.5" />
                <span>{project.contributors.length}</span>
              </span>
            )}
            <span className="flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>
                {project.createdAt
                  ? formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })
                  : 'Recently'}
              </span>
            </span>
          </div>

          <Link
            to={`/projects/${project.id}`}
            className="flex items-center space-x-1 text-primary-400 text-sm font-medium hover:text-primary-300 transition-colors"
          >
            <span>View</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
