import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { projectsAPI } from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";

// Helper to parse dates (handles Firestore timestamps and ISO strings)
const parseDate = (date) => {
    if (!date) return null;
    if (date._seconds) return new Date(date._seconds * 1000);
    return new Date(date);
};
import {
    ArrowLeft, Calendar, Users, Github, ExternalLink,
    Edit, Trash2, Star, Clock, CheckCircle, XCircle,
    AlertCircle, Share2, Globe, Code2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Layout from "@/components/Layout";
import Loader from "@/components/common/Loader";

export function ProjectDetailContent({ backUrl = "/projects" }) {
    const { id: projectId } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { user, isAuthenticated } = useAuthStore();

    const { data, isLoading, isError } = useQuery({
        queryKey: ["project", projectId],
        queryFn: () => projectsAPI.getById(projectId),
        enabled: !!projectId,
    });

    const project = data?.data?.project;

    const deleteMutation = useMutation({
        mutationFn: () => projectsAPI.delete(projectId),
        onSuccess: () => {
            toast.success("Project archived successfully");
            queryClient.invalidateQueries({ queryKey: ["projects"] });
            navigate("/projects");
        },
        onError: (error) => toast.error(error.response?.data?.message || "Failed to delete project"),
    });

    const isOwner = isAuthenticated && user?.uid === project?.ownerId;
    const canEdit = isOwner || project?.contributors?.includes(user?.uid) || user?.role === "admin";

    const handleDelete = () => {
        if (window.confirm("Are you sure you want to archive this project?")) deleteMutation.mutate();
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard!");
    };

    const statusConfig = {
        pending: { icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20", label: "Pending Review" },
        approved: { icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20", label: "Approved" },
        rejected: { icon: XCircle, color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20", label: "Rejected" },
    };

    if (isLoading) return <div className="flex min-h-screen items-center justify-center bg-slate-950"><Loader size={1.5} /></div>;

    if (isError || !project) return (
        <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center bg-slate-950">
            <div className="mb-6 rounded-full bg-red-500/10 p-4 shadow-inner border border-red-500/20"><AlertCircle className="h-12 w-12 text-red-500" /></div>
            <h1 className="text-4xl font-black tracking-tight text-white uppercase italic">Project Not Found</h1>
            <p className="mt-2 text-muted-foreground max-w-sm font-medium">The project you're looking for doesn't exist or has been removed from the archive.</p>
            <Button onClick={() => navigate(backUrl)} className="mt-10 bg-white text-slate-950 hover:bg-slate-200 font-black px-8 py-6 rounded-xl uppercase italic tracking-widest transition-all shadow-xl">Back to Collection</Button>
        </div>
    );

    const StatusIcon = statusConfig[project.status]?.icon || AlertCircle;
    const statusInfo = statusConfig[project.status] || { color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20", label: project.status };

    return (
        <div className="min-h-screen bg-background/50 pb-20">
            <div className="border-b border-border/50 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-30 border-t border-t-white/5">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <Button variant="ghost" size="sm" onClick={() => navigate(backUrl)} className="text-muted-foreground hover:text-white font-black uppercase tracking-widest text-[10px] italic -ml-2">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Collection
                    </Button>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" onClick={handleShare} className="h-10 w-10 rounded-xl border-border/50 bg-white/5 hover:bg-white/10 transition-all">
                            <Share2 className="h-4 w-4" />
                        </Button>
                        {canEdit && (
                            <>
                                <Button variant="outline" size="icon" onClick={() => navigate(`/projects/${projectId}/edit`)} className="h-10 w-10 rounded-xl border-border/50 bg-white/5 hover:bg-white/10 transition-all">
                                    <Edit className="h-4 w-4" />
                                </Button>
                                {isOwner && (
                                    <Button variant="outline" size="icon" onClick={handleDelete} disabled={deleteMutation.isPending}
                                        className="h-10 w-10 rounded-xl border-red-500/20 text-red-500 bg-red-500/5 hover:bg-red-500/10 transition-all">
                                        {deleteMutation.isPending ? <div className="h-4 w-4 animate-spin border-2 border-red-500 border-t-transparent rounded-full"></div> : <Trash2 className="h-4 w-4" />}
                                    </Button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 space-y-12">
                        <div className="space-y-8">
                            <div className="flex flex-wrap items-center gap-3">
                                {project.isFeatured && (
                                    <Badge className="bg-amber-500 text-amber-950 hover:bg-amber-500/90 gap-1.5 border-none font-black text-[9px] tracking-widest px-3 py-1 shadow-lg shadow-amber-500/20 uppercase italic">
                                        <Star className="h-3 w-3 fill-current" /> FEATURED REPO
                                    </Badge>
                                )}
                                <Badge variant="outline" className={`${statusInfo.bg} ${statusInfo.color} ${statusInfo.border} gap-1.5 uppercase font-black tracking-widest text-[9px] px-3 py-1 italic bg-white/5`}>
                                    <StatusIcon className="h-3.5 w-3.5" /> {statusInfo.label}
                                </Badge>
                            </div>
                            <div>
                                <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tighter text-white uppercase italic mb-8 leading-none">{project.title}</h1>
                                <div className="flex flex-wrap items-center gap-4 text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] italic">
                                    <div className="flex items-center gap-2 bg-white/5 border border-white/5 px-4 py-2 rounded-xl backdrop-blur-md">
                                        <Calendar className="h-3.5 w-3.5 text-acm-blue" />
                                        <span>INITIALIZED {parseDate(project.createdAt) ? format(parseDate(project.createdAt), "MMM d, yyyy") : "RECENTLY"}</span>
                                    </div>
                                    {project.contributors?.length > 0 && (
                                        <div className="flex items-center gap-2 bg-white/5 border border-white/5 px-4 py-2 rounded-xl backdrop-blur-md">
                                            <Users className="h-3.5 w-3.5 text-acm-blue" />
                                            <span>{project.contributors.length} ACTIVE MEMBER{project.contributors.length !== 1 ? "S" : ""}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <Separator className="bg-border/50" />
                            <div className="space-y-6">
                                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-acm-blue italic">Technical Brief</h3>
                                <p className="text-slate-300 whitespace-pre-wrap leading-relaxed text-lg font-medium tracking-tight bg-white/2 p-8 rounded-[2rem] border border-white/5 shadow-inner">
                                    {project.description}
                                </p>
                            </div>
                        </div>

                        {project.assets?.length > 0 && (
                            <div className="space-y-8">
                                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-acm-blue italic">Visual Documentation</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {project.assets.map((asset) => (
                                        <a key={asset.id} href={asset.url} target="_blank" rel="noopener noreferrer"
                                            className="group relative aspect-video overflow-hidden rounded-[2.5rem] border border-border/50 bg-card/40 transition-all hover:border-acm-blue/50 hover:shadow-acm-glow">
                                            {asset.contentType?.startsWith("image/") ? (
                                                <>
                                                    <img src={asset.url} alt={asset.filename} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale-[50%] group-hover:grayscale-0" />
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100 backdrop-blur-sm">
                                                        <div className="rounded-2xl bg-white/10 p-5 backdrop-blur-md border border-white/20 shadow-2xl transition-transform duration-300 group-hover:scale-110"><ExternalLink className="h-8 w-8 text-white" /></div>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="flex h-full w-full flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-white/5 to-transparent">
                                                    <div className="w-16 h-16 rounded-2xl bg-acm-blue/10 flex items-center justify-center mb-4 transition-transform group-hover:scale-110 group-hover:bg-acm-blue/20">
                                                        <ExternalLink className="h-8 w-8 text-acm-blue" />
                                                    </div>
                                                    <span className="max-w-[180px] truncate text-[10px] font-black uppercase tracking-widest text-slate-400 italic mb-1">{asset.filename}</span>
                                                    <span className="text-[9px] font-black text-white/20 uppercase tracking-tighter italic">External Resource</span>
                                                </div>
                                            )}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-8 lg:sticky lg:top-24 h-fit">
                        {project.techStack?.length > 0 && (
                            <Card className="border-border/50 bg-card/40 backdrop-blur-xl rounded-[2.5rem] shadow-2xl overflow-hidden border-t-2 border-t-white/5">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-xs font-black uppercase tracking-[0.3em] text-acm-blue italic flex items-center gap-3">
                                        <Code2 className="h-4 w-4" /> Core Architecture
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-2.5">
                                        {project.techStack.map((tech, index) => (
                                            <Badge key={index} variant="secondary" className="bg-white/5 text-white/70 border border-white/5 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wide hover:bg-acm-blue/10 hover:text-acm-blue hover:border-acm-blue/20 transition-all italic">{tech}</Badge>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        <Card className="border-border/50 bg-card/40 backdrop-blur-xl rounded-[2.5rem] shadow-2xl overflow-hidden border-t-2 border-t-white/5">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-xs font-black uppercase tracking-[0.3em] text-acm-blue italic flex items-center gap-3"><Globe className="h-4 w-4" /> Endpoint Links</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {(project.githubUrl || project.repoUrl) && (
                                    <Button asChild variant="outline" className="w-full justify-between gap-3 rounded-2xl h-14 font-black uppercase tracking-widest text-[10px] italic bg-white/2 border-white/5 hover:border-acm-blue/50 hover:bg-acm-blue/5 hover:text-acm-blue transition-all group px-6">
                                        <a href={project.githubUrl || project.repoUrl} target="_blank" rel="noopener noreferrer">
                                            <div className="flex items-center gap-3">
                                                <Github className="h-5 w-5 opacity-40 group-hover:opacity-100 transition-opacity" /> Source Code
                                            </div>
                                            <ArrowLeft className="h-4 w-4 rotate-180 opacity-20 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
                                        </a>
                                    </Button>
                                )}
                                {project.demoUrl && (
                                    <Button asChild className="w-full justify-between gap-3 rounded-2xl h-14 font-black uppercase tracking-widest text-[10px] italic bg-acm-blue hover:bg-acm-blue-dark shadow-acm-glow transition-all group px-6 shadow-xl text-white">
                                        <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                                            <div className="flex items-center gap-3">
                                                <ExternalLink className="h-5 w-5" /> Live Preview
                                            </div>
                                            <ArrowLeft className="h-4 w-4 rotate-180 transition-all group-hover:translate-x-1" />
                                        </a>
                                    </Button>
                                )}
                                {!project.githubUrl && !project.repoUrl && !project.demoUrl && (
                                    <div className="py-6 text-center bg-white/2 rounded-2xl border border-dashed border-white/10">
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black italic">No Public Endpoints</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="border-border/50 bg-card/20 backdrop-blur-xl rounded-[2.5rem] overflow-hidden border border-white/5">
                            <CardContent className="p-8">
                                <dl className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <dt className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic">Repository Status</dt>
                                        <dd className="font-black uppercase tracking-tighter text-[11px] flex items-center gap-2">
                                            <div className={`h-2 w-2 rounded-full shadow-lg ${project.status === "approved" ? "bg-emerald-500 shadow-emerald-500/20" : "bg-amber-500 shadow-amber-500/20"}`} />
                                            <span className={project.status === "approved" ? "text-emerald-500" : "text-amber-500"}>{project.status === "approved" ? "Public Domain" : "Internal Sync"}</span>
                                        </dd>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <dt className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic">Last Manifest Update</dt>
                                        <dd className="font-black text-[11px] text-white italic">{parseDate(project.updatedAt) ? format(parseDate(project.updatedAt), "MMM d, yyyy") : "RECENT"}</dd>
                                    </div>
                                    <div className="pt-6 border-t border-white/5">
                                        <dt className="text-[9px] uppercase font-black text-muted-foreground/40 tracking-[0.3em] mb-3 leading-none italic">Archive Identifier</dt>
                                        <dd className="font-mono text-[9px] break-all text-muted-foreground/30 bg-black/20 p-3 rounded-lg border border-white/2 select-all">{project.id}</dd>
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

export default function ProjectDetailPage() {
    return (
        <Layout>
            <ProjectDetailContent />
        </Layout>
    );
}
