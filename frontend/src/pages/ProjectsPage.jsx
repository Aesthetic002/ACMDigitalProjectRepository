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

  const { data: projectsData, isLoading, isError, refetch } = useQuery({
    queryKey: ['projects', { status, techStack, limit }],
    queryFn: () => projectsAPI.getAll({ status: status || undefined, techStack: techStack || undefined, limit }),
  })

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
      <div className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-500/5 via-transparent to-transparent" />
        <div className="absolute top-10 left-1/4 w-72 h-72 bg-primary-500/10 rounded-full blur-[100px]" />
        <div className="absolute top-10 right-1/4 w-72 h-72 bg-accent-500/10 rounded-full blur-[100px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Browse Projects
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl">
            Discover innovative projects from ACM club members. Filter by status or technology.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Filters */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-3 flex-wrap">
              <select
                value={status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="px-4 py-2.5 input-glow cursor-pointer"
              >
                <option value="">All Status</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>

              <select
                value={techStack}
                onChange={(e) => handleFilterChange('tech', e.target.value)}
                className="px-4 py-2.5 input-glow cursor-pointer"
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
                  className="flex items-center space-x-1 px-3 py-2 text-zinc-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                  <span>Clear filters</span>
                </button>
              )}
            </div>

            <div className="text-zinc-400 text-sm">
              {projects.length} project{projects.length !== 1 ? 's' : ''} found
            </div>
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mt-4">
              {status && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-500/15 text-primary-400 rounded-full text-sm border border-primary-500/20">
                  Status: {status}
                  <button onClick={() => handleFilterChange('status', '')}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {techStack && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-500/15 text-primary-400 rounded-full text-sm border border-primary-500/20">
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
            <FolderOpen className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No projects found</h3>
            <p className="text-zinc-400 mb-6">
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
