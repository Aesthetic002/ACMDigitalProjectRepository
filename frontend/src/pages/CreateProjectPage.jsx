import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { projectsAPI, tagsAPI, assetsAPI } from '../services/api'
import toast from 'react-hot-toast'
import { ArrowLeft, Plus, X, Loader2, Save, Upload } from 'lucide-react'

export default function CreateProjectPage() {
  const { projectId } = useParams()
  const isEditing = !!projectId
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    techStack: [],
    githubUrl: '',
    demoUrl: '',
  })
  const [techInput, setTechInput] = useState('')
  const [files, setFiles] = useState([])
  const [uploadProgress, setUploadProgress] = useState({})

  const { isLoading: projectLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectsAPI.getById(projectId),
    enabled: isEditing,
    onSuccess: (data) => {
      const project = data.data.project
      setFormData({
        title: project.title || '',
        description: project.description || '',
        techStack: project.techStack || [],
        githubUrl: project.githubUrl || '',
        demoUrl: project.demoUrl || '',
      })
    },
  })

  const { data: tagsData } = useQuery({
    queryKey: ['tags'],
    queryFn: () => tagsAPI.getAll(),
  })

  const tags = tagsData?.data?.tags || []

  const createMutation = useMutation({
    mutationFn: (data) => projectsAPI.create(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create project')
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data) => projectsAPI.update(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['project', projectId] })
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update project')
    },
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const addTech = (tech) => {
    const trimmedTech = tech.trim()
    if (trimmedTech && !formData.techStack.includes(trimmedTech)) {
      setFormData((prev) => ({
        ...prev,
        techStack: [...prev.techStack, trimmedTech],
      }))
    }
    setTechInput('')
  }

  const removeTech = (techToRemove) => {
    setFormData((prev) => ({
      ...prev,
      techStack: prev.techStack.filter((tech) => tech !== techToRemove),
    }))
  }

  const handleTechKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTech(techInput)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      toast.error('Title is required')
      return
    }
    if (!formData.description.trim()) {
      toast.error('Description is required')
      return
    }
    if (formData.techStack.length === 0) {
      toast.error('Add at least one technology')
      return
    }

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      techStack: formData.techStack,
      ...(formData.githubUrl && { githubUrl: formData.githubUrl.trim() }),
      ...(formData.demoUrl && { demoUrl: formData.demoUrl.trim() }),
    }

    try {
      let targetProjectId = projectId

      if (isEditing) {
        await updateMutation.mutateAsync(payload)
      } else {
        const response = await createMutation.mutateAsync(payload)
        targetProjectId = response.data.project.id
      }

      if (files.length > 0) {
        toast.loading('Uploading files...', { id: 'upload-toast' })

        for (const file of files) {
          try {
            const formData = new FormData()
            formData.append('projectId', targetProjectId)
            formData.append('file', file)

            await assetsAPI.uploadAsset(formData, (progressEvent) => {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
              setUploadProgress(prev => ({ ...prev, [file.name]: percentCompleted }))
            })

          } catch (uploadError) {
            console.error('Upload failed for', file.name, uploadError)
            toast.error(`Failed to upload ${file.name}`, { id: 'upload-toast' })
          }
        }
        toast.success('Files uploaded!', { id: 'upload-toast' })
      }

      navigate(`/projects/${targetProjectId}`)

    } catch (error) {
      // Error handled by mutation onError
    }
  }

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFiles(prev => [...prev, ...Array.from(e.target.files)])
    }
  }

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  if (isEditing && projectLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen animate-fade-in pb-20">
      {/* Header */}
      <div className="relative py-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-500/5 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/2 -tranzinc-x-1/2 w-[600px] h-[400px] bg-primary-500/5 rounded-full blur-[120px]" />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center space-x-2 text-zinc-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <h1 className="text-3xl sm:text-4xl font-bold text-white">
            {isEditing ? 'Edit Project' : 'Submit a New Project'}
          </h1>
          <p className="text-zinc-400 mt-2">
            {isEditing
              ? 'Update your project details below.'
              : 'Share your amazing work with the ACM community.'}
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-premium rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-zinc-300 mb-2">
                Project Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter a catchy title for your project"
                className="w-full px-4 py-3 input-glow"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-zinc-300 mb-2">
                Description <span className="text-red-400">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={6}
                placeholder="Describe your project, its features, and what problem it solves..."
                className="w-full px-4 py-3 input-glow resize-none"
              />
            </div>

            {/* Tech Stack */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Tech Stack <span className="text-red-400">*</span>
              </label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    onKeyDown={handleTechKeyDown}
                    placeholder="Add technology (press Enter)"
                    className="flex-1 px-4 py-3 input-glow"
                  />
                  <button
                    type="button"
                    onClick={() => addTech(techInput)}
                    className="px-4 py-3 bg-zinc-700/60 text-white rounded-xl hover:bg-zinc-600/60 transition-colors border border-zinc-600/40"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>

                {formData.techStack.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.techStack.map((tech, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary-500/15 text-primary-400 border border-primary-500/25 rounded-lg text-sm"
                      >
                        {tech}
                        <button
                          type="button"
                          onClick={() => removeTech(tech)}
                          className="hover:text-white transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {tags.length > 0 && (
                  <div>
                    <p className="text-xs text-zinc-500 mb-2">Popular technologies:</p>
                    <div className="flex flex-wrap gap-2">
                      {tags
                        .filter((tag) => !formData.techStack.includes(tag.name))
                        .slice(0, 8)
                        .map((tag) => (
                          <button
                            key={tag.id}
                            type="button"
                            onClick={() => addTech(tag.name)}
                            className="px-2.5 py-1 text-xs bg-zinc-800/60 text-zinc-400 rounded-md hover:bg-zinc-700/60 hover:text-white transition-colors border border-zinc-700/40"
                          >
                            + {tag.name}
                          </button>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Links */}
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="githubUrl" className="block text-sm font-medium text-zinc-300 mb-2">
                  GitHub URL
                </label>
                <input
                  type="url"
                  id="githubUrl"
                  name="githubUrl"
                  value={formData.githubUrl}
                  onChange={handleChange}
                  placeholder="https://github.com/username/repo"
                  className="w-full px-4 py-3 input-glow"
                />
              </div>

              <div>
                <label htmlFor="demoUrl" className="block text-sm font-medium text-zinc-300 mb-2">
                  Demo URL
                </label>
                <input
                  type="url"
                  id="demoUrl"
                  name="demoUrl"
                  value={formData.demoUrl}
                  onChange={handleChange}
                  placeholder="https://your-demo.com"
                  className="w-full px-4 py-3 input-glow"
                />
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Project Images & Files
                </label>
                <div className="border-2 border-dashed border-zinc-700/50 rounded-xl p-6 text-center hover:border-primary-500/30 transition-colors bg-zinc-800/20">
                  <input
                    type="file"
                    id="file-upload"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*,application/pdf"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-2">
                    <div className="p-3 bg-zinc-800/60 rounded-full border border-zinc-700/40">
                      <Upload className="w-6 h-6 text-primary-400" />
                    </div>
                    <span className="text-white font-medium">Click to upload files</span>
                    <span className="text-sm text-zinc-500">SVG, PNG, JPG or PDF</span>
                  </label>
                </div>

                {files.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-zinc-800/40 rounded-lg border border-zinc-700/30">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-zinc-700/40 rounded-lg flex items-center justify-center border border-zinc-600/30">
                            <span className="text-xs uppercase text-zinc-400">
                              {file.name.split('.').pop()}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm text-white truncate max-w-[200px]">{file.name}</p>
                            <p className="text-xs text-zinc-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        </div>
                        {uploadProgress[file.name] !== undefined ? (
                          <span className="text-xs text-primary-400">{uploadProgress[file.name]}%</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="text-zinc-400 hover:text-red-400 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Submit */}
            <div className="flex items-center justify-end gap-4 pt-6 border-t border-zinc-700/30">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="btn-ghost"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{isEditing ? 'Updating...' : 'Creating...'}</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>{isEditing ? 'Update Project' : 'Submit Project'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
