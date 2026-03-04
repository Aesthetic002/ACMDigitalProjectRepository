import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { projectsAPI, tagsAPI } from '../services/api'
import ProjectCard from '../components/ProjectCard'
import { Search, Filter, X, FolderOpen, Loader2 } from 'lucide-react'

export default function ProjectsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [showFilters, setShowFilters] = useState(false)

  const status = searchParams.get('status') || ''
  const techStack = searchParams.get('tech') || ''
  const limit = parseInt(searchParams.get('limit')) || 20

  // Fetch projects
  const { data: projectsData, isLoading, isError, refetch } = useQuery({
    queryKey: ['projects', { status, techStack, limit }],
    queryFn: () => projectsAPI.getAll({ status: status || undefined, techStack: techStack || undefined, limit }),
  })

  // Fetch tags for filter
  const { data: tagsData } = useQuery({
    queryKey: ['tags'],
    queryFn: () => tagsAPI.getAll(),
  })

  const projects = projectsData?.data?.projects || []
  const tags = tagsData?.data?.tags || []

  const handleFilterChange = (key, value) => {
    const newParams = new URLSearchParams(searchParams)
    if (value) {
      newParams.set(key, value)
    } else {
      newParams.delete(key)
    }
    setSearchParams(newParams)
  }

  const clearFilters = () => {
    setSearchParams({})
  }

  const hasActiveFilters = status || techStack

  return (
    <div className="min-h-screen animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-b from-slate-800/50 to-transparent py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Browse Projects
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl">
            Discover innovative projects from ACM club members. Filter by status or technology.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Filters */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-3 flex-wrap">
              {/* Status Filter */}
              <select
                value={status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>

              {/* Tech Filter */}
              <select
                value={techStack}
                onChange={(e) => handleFilterChange('tech', e.target.value)}
                className="px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">All Technologies</option>
                {tags.map((tag) => (
                  <option key={tag.id} value={tag.name}>
                    {tag.name}
                  </option>
                ))}
              </select>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center space-x-1 px-3 py-2 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                  <span>Clear filters</span>
                </button>
              )}
            </div>

            <div className="text-slate-400 text-sm">
              {projects.length} project{projects.length !== 1 ? 's' : ''} found
            </div>
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mt-4">
              {status && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-500/20 text-primary-400 rounded-full text-sm">
                  Status: {status}
                  <button onClick={() => handleFilterChange('status', '')}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {techStack && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-500/20 text-primary-400 rounded-full text-sm">
                  Tech: {techStack}
                  <button onClick={() => handleFilterChange('tech', '')}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Projects Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
          </div>
        ) : isError ? (
          <div className="text-center py-20">
            <div className="text-red-400 mb-4">Failed to load projects</div>
            <button onClick={() => refetch()} className="btn-secondary">
              Try Again
            </button>
          </div>
        ) : projects.length > 0 ? (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>

            {/* Load More */}
            {projectsData?.data?.nextPageToken && (
              <div className="mt-12 text-center">
                <button className="btn-secondary">
                  Load More Projects
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <FolderOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No projects found</h3>
            <p className="text-slate-400 mb-6">
              {hasActiveFilters
                ? 'Try adjusting your filters to find more projects.'
                : 'Be the first to submit a project!'}
            </p>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="btn-secondary">
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
