'use client';

import { Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams, useRouter } from 'next/navigation';
import { projectsAPI } from '@/api/projects.api';
import { tagsAPI } from '@/api/tags.api';
import ProjectCard from '../components/ProjectCard';
import { X, FolderOpen, Loader2 } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

/**
 * Feature-based Project Archive Page
 * Handles fetching real projects and tags from the backend.
 */
function ProjectsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const status = searchParams.get('status') || '';
    const techStack = searchParams.get('tech') || '';
    const limit = parseInt(searchParams.get('limit')) || 20;

    // Fetch projects
    const { data: projectsData, isLoading, isError, refetch } = useQuery({
        queryKey: ['projects', { status, techStack, limit }],
        queryFn: () => projectsAPI.getAll({
            status: status || undefined,
            techStack: techStack || undefined,
            limit
        }),
    });

    // Fetch tags for filter
    const { data: tagsData } = useQuery({
        queryKey: ['tags'],
        queryFn: () => tagsAPI.getAll(),
    });

    const projects = projectsData?.data?.projects || [];
    const tags = tagsData?.data?.tags || [];

    const handleFilterChange = (key, value) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value && value !== 'all') {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        router.push(`/projects?${params.toString()}`);
    };

    const clearFilters = () => {
        router.push('/projects');
    };

    const hasActiveFilters = status || techStack;

    return (
        <div className="min-h-screen bg-background/50">
            {/* Header Section */}
            <section className="relative overflow-hidden bg-slate-950 py-20 lg:py-32">
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
                <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-primary/10 to-transparent" />

                <div className="container relative mx-auto px-4">
                    <div className="max-w-3xl">
                        <Badge variant="outline" className="mb-4 border-primary/20 bg-primary/10 text-primary">
                            ACM PROJECTS
                        </Badge>
                        <h1 className="mb-6 text-4xl font-bold tracking-tight text-white sm:text-6xl">
                            Innovation <span className="text-acm-blue">Archived.</span>
                        </h1>
                        <p className="text-lg text-slate-400">
                            Explore the repository of projects built by ACM members. From web apps to AI models,
                            discover what's happening in our digital creative space.
                        </p>
                    </div>
                </div>
            </section>

            <div className="container mx-auto px-4 py-12">
                {/* Filter Bar */}
                <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="w-full sm:w-64">
                            <Select
                                value={status || 'all'}
                                onValueChange={(v) => handleFilterChange('status', v)}
                            >
                                <SelectTrigger className="w-full bg-card border-border/50 focus:ring-acm-blue">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="approved">Approved</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="w-full sm:w-64">
                            <Select
                                value={techStack || 'all'}
                                onValueChange={(v) => handleFilterChange('tech', v)}
                            >
                                <SelectTrigger className="w-full bg-card border-border/50 focus:ring-acm-blue">
                                    <SelectValue placeholder="Technology" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Technologies</SelectItem>
                                    {tags.map((tag) => (
                                        <SelectItem key={tag.id} value={tag.name}>
                                            {tag.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {hasActiveFilters && (
                            <Button
                                variant="ghost"
                                onClick={clearFilters}
                                className="text-muted-foreground hover:text-foreground"
                            >
                                <X className="mr-2 h-4 w-4" />
                                Clear Filters
                            </Button>
                        )}
                    </div>

                    <div className="text-sm font-medium text-muted-foreground">
                        Showing <span className="text-foreground">{projects.length}</span> projects
                    </div>
                </div>

                {/* Results Grid */}
                {isLoading ? (
                    <div className="flex min-h-[400px] flex-col items-center justify-center">
                        <Loader2 className="h-12 w-12 animate-spin text-acm-blue" />
                        <p className="mt-4 text-muted-foreground animate-pulse">Fetching projects...</p>
                    </div>
                ) : isError ? (
                    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border border-dashed border-red-500/20 bg-red-500/5 p-12 text-center">
                        <div className="mb-4 rounded-full bg-red-500/10 p-3">
                            <X className="h-8 w-8 text-red-500" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground">Failed to load projects</h3>
                        <p className="mt-2 text-muted-foreground">There was an error communicating with the server.</p>
                        <Button variant="outline" onClick={() => refetch()} className="mt-6 border-red-500/20 hover:bg-red-500/10">
                            Try Again
                        </Button>
                    </div>
                ) : projects.length > 0 ? (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {projects.map((project) => (
                            <ProjectCard key={project.id} project={project} />
                        ))}
                    </div>
                ) : (
                    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border border-dashed border-border p-12 text-center">
                        <div className="mb-4 rounded-full bg-muted p-3">
                            <FolderOpen className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-bold">No projects found</h3>
                        <p className="mt-2 text-muted-foreground">
                            {hasActiveFilters
                                ? "Try adjusting your filters or search terms."
                                : "The repository is empty. Be the first to contribute!"}
                        </p>
                        {hasActiveFilters && (
                            <Button onClick={clearFilters} variant="outline" className="mt-6">
                                Clear all filters
                            </Button>
                        )}
                    </div>
                )}

                {/* Pagination placeholder */}
                {projectsData?.data?.nextPageToken && (
                    <div className="mt-16 flex justify-center">
                        <Button size="lg" variant="outline" className="border-acm-blue/20 text-acm-blue hover:bg-acm-blue/10">
                            Load More Projects
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function ProjectArchive() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center bg-slate-950">
                <Loader2 className="h-12 w-12 animate-spin text-acm-blue" />
            </div>
        }>
            <ProjectsContent />
        </Suspense>
    );
}
