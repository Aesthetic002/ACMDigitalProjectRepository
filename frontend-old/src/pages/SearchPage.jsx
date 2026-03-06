import { useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { searchAPI } from '../services/api'
import { Search, Loader2, Filter, X, FolderOpen, Github, ExternalLink, Clock, CheckCircle } from 'lucide-react'

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const [searchInput, setSearchInput] = useState(query)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    techStack: '',
    status: '',
  })

  // Search query
  const { data: searchData, isLoading } = useQuery({
    queryKey: ['search', query, filters],
    queryFn: () => {
      const params = { q: query }
      if (filters.techStack) params.techStack = filters.techStack
      if (filters.status) params.status = filters.status
      return searchAPI.search(params)
    },
    enabled: !!query,
  })

  const results = searchData?.data?.results || searchData?.data?.projects || []

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchInput.trim()) {
      setSearchParams({ q: searchInput.trim() })
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({ techStack: '', status: '' })
  }

  const hasActiveFilters = filters.techStack || filters.status

  return (
    <div className="min-h-screen animate-fade-in pb-20">
      {/* Header with Search */}
      <div className="bg-gradient-to-b from-slate-800/50 to-transparent py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white text-center mb-8">
            Search Projects
          </h1>

          <form onSubmit={handleSearch} className="relative">
            <div className="relative flex gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="w-5 h-5 text-slate-500" />
                </div>
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search by project name, description, or technology..."
                  className="w-full pl-12 pr-4 py-4 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-lg"
                />
              </div>
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-4 rounded-xl border transition-colors ${
                  showFilters || hasActiveFilters
                    ? 'bg-primary-500/20 border-primary-500 text-primary-400'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                <Filter className="w-5 h-5" />
              </button>
              <button
                type="submit"
                className="btn-primary px-8 py-4 text-lg"
              >
                Search
              </button>
            </div>
          </form>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-slate-800 border border-slate-700 rounded-xl animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-white">Filters</h3>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-slate-400 hover:text-white flex items-center gap-1"
                  >
                    <X className="w-4 h-4" />
                    Clear all
                  </button>
                )}
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    Technology
                  </label>
                  <input
                    type="text"
                    value={filters.techStack}
                    onChange={(e) => handleFilterChange('techStack', e.target.value)}
                    placeholder="e.g., React, Python"
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">All Statuses</option>
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Results */}
        {query ? (
          <>
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-slate-400">
                {isLoading ? (
                  'Searching...'
                ) : (
                  <>
                    {results.length} result{results.length !== 1 ? 's' : ''} for{' '}
                    <span className="text-white font-medium">"{query}"</span>
                  </>
                )}
              </p>
            </div>

            {/* Results List */}
            {isLoading ? (
              <div className="py-12 text-center">
                <Loader2 className="w-10 h-10 text-primary-500 animate-spin mx-auto" />
                <p className="text-slate-400 mt-4">Searching projects...</p>
              </div>
            ) : results.length === 0 ? (
              <div className="py-12 text-center">
                <FolderOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No results found</h3>
                <p className="text-slate-400 mb-6">
                  Try adjusting your search or filters to find what you're looking for.
                </p>
                <div className="flex justify-center gap-4">
                  <Link to="/projects" className="btn-ghost">
                    Browse All Projects
                  </Link>
                  <button
                    onClick={() => {
                      setSearchInput('')
                      setSearchParams({})
                    }}
                    className="btn-primary"
                  >
                    Clear Search
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {results.map((project) => (
                  <Link
                    key={project.id}
                    to={`/projects/${project.id}`}
                    className="block bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-slate-600 hover:bg-slate-800 transition-all group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-white group-hover:text-primary-400 transition-colors truncate">
                            {project.title}
                          </h3>
                          {project.status === 'approved' ? (
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-green-500/10 text-green-400 rounded-full text-xs">
                              <CheckCircle className="w-3 h-3" />
                              Approved
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-yellow-500/10 text-yellow-400 rounded-full text-xs">
                              <Clock className="w-3 h-3" />
                              Pending
                            </span>
                          )}
                          {project.featured && (
                            <span className="px-2 py-0.5 bg-purple-500/10 text-purple-400 rounded-full text-xs">
                              Featured
                            </span>
                          )}
                        </div>

                        <p className="text-slate-400 text-sm line-clamp-2 mb-3">
                          {project.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-2">
                          {project.techStack?.slice(0, 5).map((tech, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-xs"
                            >
                              {tech}
                            </span>
                          ))}
                          {project.techStack?.length > 5 && (
                            <span className="text-xs text-slate-500">
                              +{project.techStack.length - 5} more
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                          <span>By {project.ownerName || 'Unknown'}</span>
                          {project.createdAt && (
                            <span>
                              {new Date(project.createdAt._seconds * 1000).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        {project.githubUrl && (
                          <span className="p-2 text-slate-400 bg-slate-700 rounded-lg">
                            <Github className="w-4 h-4" />
                          </span>
                        )}
                        {project.demoUrl && (
                          <span className="p-2 text-slate-400 bg-slate-700 rounded-lg">
                            <ExternalLink className="w-4 h-4" />
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        ) : (
          /* Empty State - No Query */
          <div className="py-12 text-center">
            <Search className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Search for projects</h3>
            <p className="text-slate-400 mb-6 max-w-md mx-auto">
              Enter a search term above to find projects by name, description, or technology stack.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {['React', 'Python', 'Machine Learning', 'Web Development', 'Mobile App'].map((term) => (
                <button
                  key={term}
                  onClick={() => {
                    setSearchInput(term)
                    setSearchParams({ q: term })
                  }}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors text-sm"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
