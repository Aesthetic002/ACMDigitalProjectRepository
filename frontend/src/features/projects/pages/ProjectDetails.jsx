'use client';

import { use, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow, format } from 'date-fns';
import { projectsAPI } from '@/api/projects.api';
import { useAuthStore } from '@/store/auth.store';
import { toast } from 'sonner';
import {
    ArrowLeft, Calendar, Users, Github, ExternalLink,
    Edit, Trash2, Star, Clock, CheckCircle, XCircle,
    AlertCircle, Loader2, Share2, Globe, Code2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

/**
 * Feature-based Project Details Page
 * Displays comprehensive information about a specific project.
 */
export default function ProjectDetails({ projectId }) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { user, isAuthenticated } = useAuthStore();

    // Fetch project
    const { data, isLoading, isError } = useQuery({
        queryKey: ['project', projectId],
        queryFn: () => projectsAPI.getById(projectId),
        enabled: !!projectId,
    });

    const project = data?.data?.project;

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: () => projectsAPI.delete(projectId),
        onSuccess: () => {
            toast.success('Project archived successfully');
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            router.push('/projects');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to delete project');
        },
    });

    const isOwner = isAuthenticated && user?.uid === project?.ownerId;
    const isContributor = isAuthenticated && project?.contributors?.includes(user?.uid);
    const canEdit = isOwner || isContributor || user?.role === 'admin';

    const handleDelete = () => {
        if (window.confirm('Are you sure you want to archive this project? This can be undone by an admin.')) {
            deleteMutation.mutate();
        }
    };

    const handleShare = () => {
        if (typeof window !== 'undefined') {
            navigator.clipboard.writeText(window.location.href);
            toast.success('Link copied to clipboard!');
        }
    };

    const statusConfig = {
        pending: { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', label: 'Pending Review' },
        approved: { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', label: 'Approved' },
        rejected: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20', label: 'Rejected' },
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <Loader2 className="h-12 w-12 animate-spin text-acm-blue" />
            </div>
        );
    }

    if (isError || !project) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
                <div className="mb-6 rounded-full bg-red-500/10 p-4">
                    <AlertCircle className="h-12 w-12 text-red-500" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight">Project Not Found</h1>
                <p className="mt-2 text-muted-foreground max-sm:text-sm max-w-sm">
                    The project you're looking for doesn't exist or has been removed from the repository.
                </p>
                <Button onClick={() => router.push('/projects')} className="mt-8 bg-acm-blue hover:bg-acm-blue-dark">
                    Back to Projects
                </Button>
            </div>
        );
    }

    const StatusIcon = statusConfig[project.status]?.icon || AlertCircle;
    const statusInfo = statusConfig[project.status] || { color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20', label: project.status };

    return (
        <div className="min-h-screen bg-background/50 pb-20">
            {/* Top Navigation Bar */}
            <div className="border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-30">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push('/projects')}
                        className="text-muted-foreground hover:text-foreground -ml-2"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Collection
                    </Button>

                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" onClick={handleShare} className="h-9 w-9 rounded-xl border-border/50">
                            <Share2 className="h-4 w-4" />
                        </Button>
                        {canEdit && (
                            <>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => router.push(`/projects/${projectId}/edit`)}
                                    className="h-9 w-9 rounded-xl border-border/50"
                                >
                                    <Edit className="h-4 w-4" />
                                </Button>
                                {isOwner && (
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={handleDelete}
                                        disabled={deleteMutation.isPending}
                                        className="h-9 w-9 rounded-xl border-red-500/20 text-red-500 hover:bg-red-500/10"
                                    >
                                        {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                    </Button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Main Content Area */}
                    <div className="lg:col-span-2 space-y-10">
                        {/* Project Header Card */}
                        <div className="space-y-6">
                            <div className="flex flex-wrap items-center gap-3">
                                {project.isFeatured && (
                                    <Badge className="bg-amber-500 text-amber-950 hover:bg-amber-500/90 gap-1 border-none font-bold">
                                        <Star className="h-3 w-3 fill-current" />
                                        FEATURED
                                    </Badge>
                                )}
                                <Badge variant="outline" className={`${statusInfo.bg} ${statusInfo.color} ${statusInfo.border} gap-1.5 capitalize font-semibold px-3`}>
                                    <StatusIcon className="h-3.5 w-3.5" />
                                    {statusInfo.label}
                                </Badge>
                            </div>

                            <div>
                                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6">
                                    {project.title}
                                </h1>

                                <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground font-medium">
                                    <div className="flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-full">
                                        <Calendar className="h-4 w-4 text-acm-blue/70" />
                                        <span>Created {project.createdAt ? format(new Date(project.createdAt), 'MMMM d, yyyy') : 'Recently'}</span>
                                    </div>
                                    {project.contributors?.length > 0 && (
                                        <div className="flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-full">
                                            <Users className="h-4 w-4 text-acm-blue/70" />
                                            <span>{project.contributors.length} Member{project.contributors.length !== 1 ? 's' : ''}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <Separator className="bg-border/50" />

                            <div className="prose prose-invert max-w-none">
                                <h3 className="text-xl font-bold text-foreground mb-4">Project Overview</h3>
                                <p className="text-muted-foreground whitespace-pre-wrap leading-loose text-lg">
                                    {project.description}
                                </p>
                            </div>
                        </div>

                        {/* Screenshots / Media Section */}
                        {project.assets?.length > 0 && (
                            <div className="space-y-6">
                                <h3 className="text-2xl font-bold tracking-tight">Project Media</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {project.assets.map((asset) => (
                                        <a
                                            key={asset.id}
                                            href={asset.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group relative aspect-video overflow-hidden rounded-3xl border border-border/50 bg-muted transition-all hover:border-acm-blue/50 hover:shadow-acm-glow"
                                        >
                                            {asset.contentType?.startsWith('image/') ? (
                                                <>
                                                    <img
                                                        src={asset.url}
                                                        alt={asset.filename}
                                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                    />
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                                        <div className="rounded-full bg-white/10 p-4 backdrop-blur-md">
                                                            <ExternalLink className="h-6 w-6 text-white" />
                                                        </div>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center">
                                                    <ExternalLink className="mb-3 h-10 w-10 text-muted-foreground" />
                                                    <span className="max-w-[200px] truncate text-sm font-bold">{asset.filename}</span>
                                                </div>
                                            )}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar Area */}
                    <div className="space-y-8">
                        {/* Tech Stack Card */}
                        {project.techStack?.length > 0 && (
                            <Card className="border-border/50 bg-card/50 backdrop-blur-sm rounded-3xl">
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Code2 className="h-5 w-5 text-acm-blue" />
                                        Built With
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-2">
                                        {project.techStack.map((tech, index) => (
                                            <Badge
                                                key={index}
                                                variant="secondary"
                                                className="bg-acm-blue/10 text-acm-blue border-none px-3 py-1 rounded-xl text-xs font-bold"
                                            >
                                                {tech}
                                            </Badge>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Quick Links Card */}
                        <Card className="border-border/50 bg-card/50 backdrop-blur-sm rounded-3xl">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Globe className="h-5 w-5 text-acm-blue" />
                                    Resources
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {(project.githubUrl || project.repoUrl) && (
                                    <Button asChild variant="secondary" className="w-full justify-start gap-3 rounded-2xl h-12 font-bold bg-muted/50 hover:bg-acm-blue/10 hover:text-acm-blue transition-all border border-transparent hover:border-acm-blue/20">
                                        <a href={project.githubUrl || project.repoUrl} target="_blank" rel="noopener noreferrer">
                                            <Github className="h-5 w-5" />
                                            Source Code
                                        </a>
                                    </Button>
                                )}
                                {project.demoUrl && (
                                    <Button asChild className="w-full justify-start gap-3 rounded-2xl h-12 font-bold bg-acm-blue hover:bg-acm-blue-dark transition-all">
                                        <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                                            <ExternalLink className="h-5 w-5" />
                                            Live Preview
                                        </a>
                                    </Button>
                                )}
                                {!project.githubUrl && !project.demoUrl && (
                                    <div className="py-4 text-center">
                                        <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">No public links</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Stats/Details Card */}
                        <Card className="border-border/50 bg-muted/20 rounded-3xl">
                            <CardContent className="p-6">
                                <dl className="space-y-4">
                                    <div className="flex items-center justify-between text-sm">
                                        <dt className="text-muted-foreground font-medium">Visibility</dt>
                                        <dd className="font-bold uppercase tracking-tighter flex items-center gap-1.5">
                                            <div className={`h-1.5 w-1.5 rounded-full ${project.status === 'approved' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                            {project.status === 'approved' ? 'Public' : 'Pending'}
                                        </dd>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <dt className="text-muted-foreground font-medium">Last Updated</dt>
                                        <dd className="font-bold">
                                            {project.updatedAt
                                                ? format(new Date(project.updatedAt), 'MMM d, yyyy')
                                                : 'Recent'}
                                        </dd>
                                    </div>
                                    <div className="pt-4 border-t border-border/50">
                                        <dt className="text-[10px] uppercase font-black text-muted-foreground tracking-[0.2em] mb-2 leading-none">Internal ID</dt>
                                        <dd className="font-mono text-[10px] break-all text-muted-foreground/50">{project.id}</dd>
                                    </div>
                                </dl>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
