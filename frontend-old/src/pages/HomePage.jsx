import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { projectsAPI, tagsAPI } from '../services/api'
import ProjectCard from '../components/ProjectCard'
import { ArrowRight, Sparkles, Users, FolderOpen, Zap, Code, Rocket, Search } from 'lucide-react'

export default function HomePage() {
  // Fetch featured/recent projects
  const { data: projectsData, isLoading: projectsLoading } = useQuery({
    queryKey: ['projects', 'home'],
    queryFn: () => projectsAPI.getAll({ limit: 6, status: 'approved' }),
  })

  // Fetch tags
  const { data: tagsData } = useQuery({
    queryKey: ['tags'],
    queryFn: () => tagsAPI.getAll(),
  })

  const projects = projectsData?.data?.projects || []
  const tags = tagsData?.data?.tags || []

  const stats = [
    { label: 'Projects', value: '150+', icon: FolderOpen },
    { label: 'Members', value: '500+', icon: Users },
    { label: 'Technologies', value: '50+', icon: Code },
  ]

  const features = [
    {
      icon: Sparkles,
      title: 'Showcase Your Work',
      description: 'Share your projects with the ACM community and get valuable feedback.',
    },
    {
      icon: Users,
      title: 'Collaborate',
      description: 'Find collaborators for your projects or join existing ones.',
    },
    {
      icon: Zap,
      title: 'Learn & Grow',
      description: 'Discover innovative projects and learn from your peers.',
    },
  ]

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary-500/10 via-transparent to-transparent" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500/20 rounded-full blur-3xl" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-accent-500/20 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center space-x-2 bg-primary-500/10 border border-primary-500/20 rounded-full px-4 py-2 mb-8">
              <Sparkles className="w-4 h-4 text-primary-400" />
              <span className="text-sm text-primary-400">Welcome to ACM Project Archive</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-6">
              <span className="text-white">Discover Amazing</span>
              <br />
              <span className="gradient-text">Student Projects</span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
              A platform for ACM club members to showcase their innovative projects, 
              collaborate with peers, and inspire the next generation of developers.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/projects" className="btn-primary text-lg px-8 py-3 flex items-center space-x-2">
                <span>Explore Projects</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/projects/new" className="btn-secondary text-lg px-8 py-3 flex items-center space-x-2">
                <Rocket className="w-5 h-5" />
                <span>Submit Your Project</span>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-3 gap-4 max-w-2xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50">
                <stat.icon className="w-6 h-6 text-primary-400 mx-auto mb-2" />
                <div className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Why ACM Project Archive?
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Everything you need to share your work and connect with the community.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-8 rounded-2xl bg-slate-800/50 border border-slate-700/50 card-hover"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-primary-500/20 to-accent-500/20 rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="w-7 h-7 text-primary-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-slate-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Projects Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                Recent Projects
              </h2>
              <p className="text-slate-400">Check out the latest from our community</p>
            </div>
            <Link
              to="/projects"
              className="hidden sm:flex items-center space-x-2 text-primary-400 hover:text-primary-300 transition-colors"
            >
              <span>View All</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {projectsLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-slate-800/50 rounded-2xl overflow-hidden">
                  <div className="h-48 skeleton" />
                  <div className="p-5 space-y-4">
                    <div className="h-6 skeleton w-3/4" />
                    <div className="h-4 skeleton w-full" />
                    <div className="h-4 skeleton w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : projects.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <FolderOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No projects yet</h3>
              <p className="text-slate-400 mb-6">Be the first to submit a project!</p>
              <Link to="/projects/new" className="btn-primary">
                Submit Project
              </Link>
            </div>
          )}

          <div className="mt-8 text-center sm:hidden">
            <Link to="/projects" className="btn-secondary">
              View All Projects
            </Link>
          </div>
        </div>
      </section>

      {/* Tags Section */}
      {tags.length > 0 && (
        <section className="py-20 bg-slate-900/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Browse by Technology
              </h2>
              <p className="text-slate-400">Find projects built with your favorite tech</p>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              {tags.slice(0, 15).map((tag) => (
                <Link
                  key={tag.id}
                  to={`/search?q=${tag.name}`}
                  className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-full text-slate-300 hover:bg-primary-500/20 hover:border-primary-500/30 hover:text-primary-400 transition-all"
                >
                  {tag.name}
                  {tag.count && <span className="ml-2 text-slate-500">({tag.count})</span>}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-600 to-accent-600 p-8 sm:p-12">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
            
            <div className="relative text-center">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Ready to Share Your Project?
              </h2>
              <p className="text-white/80 mb-8 max-w-xl mx-auto">
                Join hundreds of students who have already shared their work. 
                Get feedback, find collaborators, and inspire others.
              </p>
              <Link to="/projects/new" className="inline-flex items-center space-x-2 bg-white text-primary-600 font-semibold px-8 py-3 rounded-xl hover:bg-slate-100 transition-colors">
                <span>Get Started</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
