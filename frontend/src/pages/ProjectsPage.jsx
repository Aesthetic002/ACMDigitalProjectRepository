import { Suspense } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { projectsAPI, tagsAPI } from "@/services/api";
import ProjectCard from "@/components/ProjectCard";
import Layout from "@/components/Layout";
import Loader from "@/components/common/Loader";
import { X, FolderOpen, Loader2 } from "lucide-react";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const PREDEFINED_DOMAINS = ["Web Development", "App Development", "Machine Learning / AI", "Cybersecurity", "Blockchain", "Cloud Computing", "Hardware / IoT", "UI/UX Design", "Other"];

function ProjectsContent() {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const status = searchParams.get("status") || "";
    const techStack = searchParams.get("tech") || "";
    const domain = searchParams.get("domain") || "";
    const limit = parseInt(searchParams.get("limit")) || 20;

    const { data: projectsData, isLoading, isError, refetch } = useQuery({
        queryKey: ["projects", { status, techStack, domain, limit }],
        queryFn: () => projectsAPI.getAll({ status: status || undefined, techStack: techStack || undefined, domain: domain || undefined, limit }),
    });

    const { data: tagsData } = useQuery({
        queryKey: ["tags"],
        queryFn: () => tagsAPI.getAll(),
    });

    const projects = projectsData?.data?.projects || [];
    const tags = tagsData?.data?.tags || [];

    const handleFilterChange = (key, value) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value && value !== "all") params.set(key, value);
        else params.delete(key);
        setSearchParams(params);
    };

    const clearFilters = () => setSearchParams({});
    const hasActiveFilters = status || techStack || domain;

    return (
        <div className="min-h-screen bg-background/50">
            <section className="relative overflow-hidden bg-slate-950 py-20 lg:py-32">
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
                <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-primary/10 to-transparent" />
                <div className="container relative mx-auto px-4">
                    <div className="max-w-3xl">
                        <Badge variant="outline" className="mb-4 border-acm-blue/20 bg-acm-blue/10 text-acm-blue font-black uppercase tracking-widest text-[10px] italic">REPOS ARCHIVE</Badge>
                        <h1 className="mb-6 text-4xl font-black tracking-tighter text-white sm:text-6xl uppercase italic">
                            Innovation <span className="text-acm-blue">Archived.</span>
                        </h1>
                        <p className="text-lg text-slate-400 font-medium">
                            Explore the repository of projects built by ACM members. From web apps to AI models, discover what's happening in our digital creative space.
                        </p>
                    </div>
                </div>
            </section>

            <div className="container mx-auto px-4 py-12">
                <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between border-b border-border/50 pb-8">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="w-full sm:w-64">
                            <Select value={status || "all"} onValueChange={(v) => handleFilterChange("status", v)}>
                                <SelectTrigger className="w-full bg-card/50 backdrop-blur-md border-border/50 focus:ring-acm-blue h-12 rounded-xl font-bold text-xs uppercase tracking-widest italic">
                                    <SelectValue placeholder="STATUS BUFFER" />
                                </SelectTrigger>
                                <SelectContent className="bg-card border-border/50 backdrop-blur-xl">
                                    <SelectItem value="all">ALL ENTITIES</SelectItem>
                                    <SelectItem value="approved">APPROVED</SelectItem>
                                    <SelectItem value="pending">PENDING</SelectItem>
                                    <SelectItem value="rejected">REJECTED</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="w-full sm:w-64">
                            <Select value={techStack || "all"} onValueChange={(v) => handleFilterChange("tech", v)}>
                                <SelectTrigger className="w-full bg-card/50 backdrop-blur-md border-border/50 focus:ring-acm-blue h-12 rounded-xl font-bold text-xs uppercase tracking-widest italic">
                                    <SelectValue placeholder="STACK FILTER" />
                                </SelectTrigger>
                                <SelectContent className="bg-card border-border/50 backdrop-blur-xl">
                                    <SelectItem value="all">ALL TECHNOLOGIES</SelectItem>
                                    {tags.map((tag) => (
                                        <SelectItem key={tag.id} value={tag.name}>{tag.name.toUpperCase()}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="w-full sm:w-64">
                            <Select value={domain || "all"} onValueChange={(v) => handleFilterChange("domain", v)}>
                                <SelectTrigger className="w-full bg-card/50 backdrop-blur-md border-border/50 focus:ring-acm-blue h-12 rounded-xl font-bold text-xs uppercase tracking-widest italic">
                                    <SelectValue placeholder="DOMAIN FILTER" />
                                </SelectTrigger>
                                <SelectContent className="bg-card border-border/50 backdrop-blur-xl">
                                    <SelectItem value="all">ALL DOMAINS</SelectItem>
                                    {PREDEFINED_DOMAINS.map((d) => (
                                        <SelectItem key={d} value={d}>{d.toUpperCase()}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {hasActiveFilters && (
                            <Button variant="ghost" onClick={clearFilters} className="text-muted-foreground hover:text-red-500 font-black uppercase tracking-widest text-[10px] italic">
                                <X className="mr-2 h-4 w-4" /> RESET FILTERS
                            </Button>
                        )}
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground italic">
                        DISPLAYING <span className="text-white text-base ml-1 mr-1">{projects.length}</span> {projectsData?.data?.total ? `OF ${projectsData.data.total}` : ''} PROJECTS
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex min-h-[400px] flex-col items-center justify-center">
                        <Loader size={1.2} />
                        <p className="mt-8 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground animate-pulse italic">Initializing Buffer...</p>
                    </div>
                ) : (isError || projects.length === 0) ? (
                    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-[3rem] border border-dashed border-border/30 p-12 text-center bg-white/2">
                        <div className="mb-4 rounded-3xl bg-muted/50 p-6 shadow-inner"><FolderOpen className="h-10 w-10 text-muted-foreground" /></div>
                        <h3 className="text-2xl font-black tracking-tight text-white uppercase italic">No valid matches found.</h3>
                        <p className="mt-2 text-muted-foreground font-medium max-w-sm mx-auto">
                            {isError
                                ? "The repository node is currently offline. Please attempt reconnection."
                                : hasActiveFilters
                                    ? "Your filter parameters returned no matching entities."
                                    : "The archive is currently empty. Be the first to initialize a project."}
                        </p>
                        {(hasActiveFilters || isError) && (
                            <Button
                                onClick={isError ? () => refetch() : clearFilters}
                                variant="outline"
                                className="mt-10 rounded-xl px-10 font-black uppercase tracking-widest text-xs italic"
                            >
                                {isError ? "RETRY CONNECTION" : "RESET PARAMETERS"}
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        {projects.map((project) => <ProjectCard key={project.id} project={project} />)}
                    </div>
                )}

                {projectsData?.data?.nextPageToken && (
                    <div className="mt-16 flex justify-center">
                        <Button size="lg" className="rounded-2xl px-12 h-14 bg-white text-slate-950 hover:bg-slate-200 font-black uppercase tracking-widest italic shadow-2xl">LOAD MORE DATA</Button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function ProjectsPage() {
    return (
        <Layout>
            <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-slate-950"><div className="w-12 h-12 border-4 border-acm-blue border-t-transparent rounded-full animate-spin"></div></div>}>
                <ProjectsContent />
            </Suspense>
        </Layout>
    );
}
