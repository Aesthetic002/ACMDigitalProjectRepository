import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { projectsAPI, tagsAPI, assetsAPI } from '@/services/api';
import { toast } from 'sonner';
import { Plus, X, Loader2, Save, Upload, Info, CheckCircle2, Edit } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export default function ProjectForm({ initialData = null, projectId = null, isAdmin = false }) {
    const isEditing = !!projectId;
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        description: initialData?.description || '',
        techStack: initialData?.techStack || [],
        githubUrl: initialData?.githubUrl || '',
        demoUrl: initialData?.demoUrl || '',
    });

    const [techInput, setTechInput] = useState('');
    const [files, setFiles] = useState([]);
    const [uploadProgress, setUploadProgress] = useState({});
    const [availableTags, setAvailableTags] = useState([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Fetch tags for suggestions
        const fetchTags = async () => {
            try {
                const response = await tagsAPI.getAll();
                setAvailableTags(response.data.tags || []);
            } catch (err) {
                console.error('Failed to fetch tags', err);
            }
        };
        fetchTags();
    }, []);

    // Create mutation
    const createMutation = useMutation({
        mutationFn: (data) => projectsAPI.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to create project');
        },
    });

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: (data) => projectsAPI.update(projectId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            queryClient.invalidateQueries({ queryKey: ['project', projectId] });
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to update project');
        },
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const addTech = (tech) => {
        const trimmedTech = tech.trim();
        if (trimmedTech && !formData.techStack.includes(trimmedTech)) {
            setFormData((prev) => ({
                ...prev,
                techStack: [...prev.techStack, trimmedTech],
            }));
        }
        setTechInput('');
    };

    const removeTech = (techToRemove) => {
        setFormData((prev) => ({
            ...prev,
            techStack: prev.techStack.filter((tech) => tech !== techToRemove),
        }));
    };

    const handleTechKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addTech(techInput);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title.trim()) return toast.error('Title is required');
        if (!formData.description.trim()) return toast.error('Description is required');
        if (formData.techStack.length === 0) return toast.error('Add at least one technology');

        const payload = {
            title: formData.title.trim(),
            description: formData.description.trim(),
            techStack: formData.techStack,
            githubUrl: formData.githubUrl.trim(),
            demoUrl: formData.demoUrl.trim(),
        };

        try {
            let targetProjectId = projectId;

            if (isEditing) {
                await updateMutation.mutateAsync(payload);
                toast.success('Project updated successfully');
            } else {
                const response = await createMutation.mutateAsync(payload);
                targetProjectId = response.data.project.id;
                toast.success('Project created successfully!');
            }

            // Handle File Uploads
            if (files.length > 0) {
                for (const file of files) {
                    try {
                        const { data } = await assetsAPI.getUploadUrl({
                            projectId: targetProjectId,
                            filename: file.name,
                            contentType: file.type
                        });

                        await axios.put(data.uploadUrl, file, {
                            headers: { 'Content-Type': file.type },
                            onUploadProgress: (progressEvent) => {
                                const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                                setUploadProgress(prev => ({ ...prev, [file.name]: percent }));
                            }
                        });
                    } catch (err) {
                        console.error('Upload failed', err);
                        toast.error(`Failed to upload ${file.name}`);
                    }
                }
            }

            // Redirect: admin stays in admin, members go to project detail
            if (isAdmin) {
                navigate('/admin/projects');
            } else {
                navigate(`/projects/${targetProjectId}`);
            }
        } catch (error) {
            // Handled by mutation
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files) {
            setFiles(prev => [...prev, ...Array.from(e.target.files)]);
        }
    };

    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    if (!mounted) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-acm-blue" />
            </div>
        );
    }

    return (
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm rounded-[2rem] overflow-hidden">
            <CardHeader className="bg-gradient-to-br from-acm-blue/10 to-transparent p-8 sm:p-12">
                <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-acm-blue/20">
                        {isEditing ? <Edit className="h-5 w-5 text-acm-blue" /> : <Plus className="h-5 w-5 text-acm-blue" />}
                    </div>
                    <Badge variant="outline" className="border-acm-blue/30 text-acm-blue bg-white/5">
                        {isEditing ? 'REVISION MODE' : 'SUBMISSION PORTAL'}
                    </Badge>
                </div>
                <CardTitle className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-2">
                    {isEditing ? 'Update Project' : 'Submit your Work'}
                </CardTitle>
                <CardDescription className="text-balance text-lg">
                    {isEditing
                        ? 'Refine your project details and media to keep the community updated.'
                        : 'Fill out the details below to showcase your innovation in the ACM digital archive.'}
                </CardDescription>
            </CardHeader>

            <CardContent className="p-8 sm:p-12 space-y-12">
                <form onSubmit={handleSubmit} className="space-y-10">

                    {/* section 1: Basic Info */}
                    <div className="space-y-6">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-acm-blue text-[10px] text-white">1</span>
                            Core Information
                        </h3>

                        <div className="grid gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-foreground">Project Title <span className="text-red-500">*</span></label>
                                <Input
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="e.g. ACM Member Dashboard"
                                    className="h-12 rounded-2xl border-border/50 bg-muted/20 text-lg focus-visible:ring-acm-blue"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-foreground">Detailed Description <span className="text-red-500">*</span></label>
                                <Textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={6}
                                    placeholder="Provide a comprehensive overview of your project's goals, tech stack, and impact..."
                                    className="rounded-2xl border-border/50 bg-muted/20 text-base leading-relaxed focus-visible:ring-acm-blue"
                                />
                            </div>
                        </div>
                    </div>

                    {/* section 2: Technologies */}
                    <div className="space-y-6">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-acm-blue text-[10px] text-white">2</span>
                            Tech Stack & Integration
                        </h3>

                        <div className="space-y-4">
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Input
                                        value={techInput}
                                        onChange={(e) => setTechInput(e.target.value)}
                                        onKeyDown={handleTechKeyDown}
                                        placeholder="Add technology (e.g. Next.js, OpenAI)"
                                        className="h-12 rounded-2xl border-border/50 bg-muted/20 pl-4"
                                    />
                                </div>
                                <Button
                                    type="button"
                                    onClick={() => addTech(techInput)}
                                    className="h-12 w-12 rounded-2xl bg-acm-blue hover:bg-acm-blue-dark"
                                >
                                    <Plus className="h-5 w-5" />
                                </Button>
                            </div>

                            {/* Tag Selection Display */}
                            <div className="min-h-[60px] rounded-3xl border border-dashed border-border/50 p-4 flex flex-wrap gap-2 items-center bg-muted/5">
                                {formData.techStack.length === 0 ? (
                                    <span className="text-xs text-muted-foreground uppercase font-black tracking-widest pl-2">No tags selected yet</span>
                                ) : (
                                    formData.techStack.map((tech) => (
                                        <Badge
                                            key={tech}
                                            className="bg-acm-blue text-white hover:bg-acm-blue-dark gap-1.5 px-3 py-1.5 rounded-xl border-none shadow-sm animate-in zoom-in-50 duration-200"
                                        >
                                            {tech}
                                            <button type="button" onClick={() => removeTech(tech)} className="hover:text-black">
                                                <X className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    ))
                                )}
                            </div>

                            {/* Suggestions */}
                            {availableTags.length > 0 && (
                                <div className="p-4 rounded-2xl bg-muted/10 border border-border/30">
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                        <Info className="h-3 w-3" /> Recommended Stack
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {availableTags
                                            .filter(tag => !formData.techStack.includes(tag.name))
                                            .slice(0, 10)
                                            .map(tag => (
                                                <button
                                                    key={tag.id}
                                                    type="button"
                                                    onClick={() => addTech(tag.name)}
                                                    className="px-3 py-1 text-xs rounded-full border border-border/50 text-muted-foreground hover:border-acm-blue hover:text-acm-blue hover:bg-acm-blue/5 transition-all"
                                                >
                                                    + {tag.name}
                                                </button>
                                            ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* section 3: Links & Media */}
                    <div className="space-y-6">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-acm-blue text-[10px] text-white">3</span>
                            Assets & Links
                        </h3>

                        <div className="grid gap-6 sm:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">GitHub Repository</label>
                                <div className="relative">
                                    <Input
                                        name="githubUrl"
                                        value={formData.githubUrl}
                                        onChange={handleChange}
                                        placeholder="https://github.com/..."
                                        className="h-11 rounded-xl border-border/50 bg-muted/20"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Live Demo / Production</label>
                                <div className="relative">
                                    <Input
                                        name="demoUrl"
                                        value={formData.demoUrl}
                                        onChange={handleChange}
                                        placeholder="https://..."
                                        className="h-11 rounded-xl border-border/50 bg-muted/20"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <div className="relative rounded-3xl border-2 border-dashed border-border/50 p-10 text-center transition-all hover:border-acm-blue/50 hover:bg-acm-blue/5 group">
                                <input
                                    type="file"
                                    id="file-upload"
                                    multiple
                                    onChange={handleFileChange}
                                    className="hidden"
                                    accept="image/*,application/pdf"
                                />
                                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-3">
                                    <div className="h-16 w-16 items-center justify-center flex rounded-[1.5rem] bg-muted group-hover:bg-acm-blue/10 transition-colors">
                                        <Upload className="h-8 w-8 text-muted-foreground group-hover:text-acm-blue transition-colors" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold">Media Repository</h4>
                                        <p className="text-sm text-muted-foreground">Upload screenshots, diagrams, or project docs (Max 10MB)</p>
                                    </div>
                                </label>
                            </div>

                            {/* Uploading List */}
                            {files.length > 0 && (
                                <div className="mt-6 space-y-3">
                                    {files.map((file, index) => (
                                        <div key={index} className="flex flex-col gap-2 p-4 rounded-2xl bg-muted/30 border border-border/50">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <CheckCircle2 className={`h-4 w-4 ${uploadProgress[file.name] === 100 ? 'text-emerald-500' : 'text-muted-foreground'}`} />
                                                    <span className="text-sm font-bold truncate max-w-[200px]">{file.name}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[10px] text-muted-foreground font-black">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                                                    <button type="button" onClick={() => removeFile(index)} className="text-muted-foreground hover:text-red-500">
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                            {uploadProgress[file.name] !== undefined && (
                                                <Progress value={uploadProgress[file.name]} className="h-1 bg-muted" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* section 4: submission */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-8 border-t border-border/50">
                        <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium">
                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            All progress is saved locally
                        </div>

                        <div className="flex gap-4 w-full sm:w-auto">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate(-1)}
                                className="flex-1 sm:flex-none rounded-2xl h-14 px-8 font-bold border-border/50"
                            >
                                CANCEL
                            </Button>
                            <Button
                                type="submit"
                                disabled={createMutation.isPending || updateMutation.isPending}
                                className="flex-1 sm:flex-none rounded-2xl h-14 px-10 font-black tracking-widest bg-acm-blue hover:bg-acm-blue-dark shadow-acm-glow text-white"
                            >
                                {createMutation.isPending || updateMutation.isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        PROCESSING
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-5 w-5" />
                                        {isEditing ? 'COMMIT UPDATES' : 'LAUNCH PROJECT'}
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
