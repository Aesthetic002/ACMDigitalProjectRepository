'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI, projectsAPI } from '@/services/api';
import { toast } from 'sonner';
import Link from 'next/link';
import {
    Shield,
    Loader2,
    CheckCircle,
    XCircle,
    Clock,
    Users,
    FolderOpen,
    TrendingUp,
    AlertTriangle,
    Eye,
    ThumbsUp,
    ThumbsDown,
    ExternalLink,
    Star,
    Sparkles,
    BarChart3,
    Search,
    Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';

export default function AdminPage() {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('pending');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Fetch stats
    const { data: statsData, isLoading: statsLoading } = useQuery({
        queryKey: ['admin-stats'],
        queryFn: () => adminAPI.getStats(),
    });

    // Fetch pending projects
    const { data: pendingData, isLoading: pendingLoading } = useQuery({
        queryKey: ['pending-projects'],
        queryFn: () => adminAPI.getPendingProjects(),
    });

    // Fetch all projects
    const { data: allProjectsData, isLoading: allProjectsLoading } = useQuery({
        queryKey: ['all-projects'],
        queryFn: () => projectsAPI.getAll({ limit: 100 }),
    });

    const stats = statsData?.data?.stats || {};
    const pendingProjects = pendingData?.data?.projects || [];
    const allProjects = allProjectsData?.data?.projects || [];

    // Approve mutation
    const approveMutation = useMutation({
        mutationFn: (projectId) => adminAPI.approveProject(projectId),
        onSuccess: () => {
            toast.success('Project cleared for publication');
            queryClient.invalidateQueries({ queryKey: ['pending-projects'] });
            queryClient.invalidateQueries({ queryKey: ['all-projects'] });
            queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
        },
    });

    // Reject mutation
    const rejectMutation = useMutation({
        mutationFn: ({ projectId, reason }) => adminAPI.rejectProject(projectId, reason),
        onSuccess: () => {
            toast.error('Project submission blocked');
            queryClient.invalidateQueries({ queryKey: ['pending-projects'] });
            queryClient.invalidateQueries({ queryKey: ['all-projects'] });
            queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
        },
    });

    // Feature mutation
    const featureMutation = useMutation({
        mutationFn: ({ projectId, featured }) => adminAPI.featureProject(projectId, featured),
        onSuccess: (_, { featured }) => {
            toast.success(featured ? 'Project highlighted' : 'Project highlight removed');
            queryClient.invalidateQueries({ queryKey: ['all-projects'] });
        },
    });

    const handleReject = (projectId) => {
        const reason = prompt('Specify rejection protocol (Reason):');
        if (reason !== null) {
            rejectMutation.mutate({ projectId, reason });
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'approved':
                return <Badge className="bg-emerald-500/10 text-emerald-500 border-none font-bold">VERIFIED</Badge>;
            case 'pending':
                return <Badge className="bg-amber-500/10 text-amber-500 border-none font-bold">PENDING</Badge>;
            case 'rejected':
                return <Badge className="bg-red-500/10 text-red-500 border-none font-bold">REJECTED</Badge>;
            default:
                return <Badge variant="secondary">{status.toUpperCase()}</Badge>;
        }
    };

    if (!mounted || statsLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-950">
                <Loader2 className="h-10 w-10 animate-spin text-acm-blue" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background/50 pb-20">
            {/* Admin Header */}
            <section className="bg-slate-950 border-b border-border/50 py-16 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[600px] h-[300px] bg-acm-blue/5 blur-[120px]" />

                <div className="container relative mx-auto px-4">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="h-12 w-12 rounded-2xl bg-acm-blue/20 flex items-center justify-center border border-acm-blue/30 shadow-acm-glow">
                            <Shield className="h-6 w-6 text-acm-blue" />
                        </div>
                        <div className="space-y-1">
                            <h1 className="text-3xl font-black tracking-tight text-white uppercase italic">Command Center</h1>
                            <p className="text-slate-400 text-sm font-medium">Digital Project Repository Administrative Interface</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
                        {[
                            { label: 'Total Archives', value: stats.totalProjects || allProjects.length, icon: FolderOpen, color: 'text-acm-blue' },
                            { label: 'Awaiting Action', value: pendingProjects.length, icon: Clock, color: 'text-amber-500', alert: pendingProjects.length > 0 },
                            { label: 'Verified Works', value: allProjects.filter(p => p.status === 'approved').length, icon: CheckCircle, color: 'text-emerald-500' },
                            { label: 'Featured Nodes', value: allProjects.filter(p => p.featured).length, icon: Sparkles, color: 'text-purple-400' },
                        ].map((s, i) => (
                            <Card key={i} className="rounded-[1.5rem] border-border/50 bg-card/40 backdrop-blur-sm overflow-hidden">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <s.icon className={`h-5 w-5 ${s.color}`} />
                                        {s.alert && <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />}
                                    </div>
                                    <h3 className="text-3xl font-black text-white">{s.value}</h3>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{s.label}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            <div className="container mx-auto px-4 py-12">
                <Tabs defaultValue="pending" onValueChange={setActiveTab} className="space-y-8">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                        <TabsList className="bg-muted/10 border border-border/50 p-1 rounded-2xl h-14">
                            <TabsTrigger value="pending" className="rounded-xl px-8 h-full data-[state=active]:bg-acm-blue data-[state=active]:text-white font-bold transition-all">
                                QUEUE <Badge variant="secondary" className="ml-2 bg-white/10 text-white border-none">{pendingProjects.length}</Badge>
                            </TabsTrigger>
                            <TabsTrigger value="all" className="rounded-xl px-8 h-full data-[state=active]:bg-acm-blue data-[state=active]:text-white font-bold transition-all">
                                ALL PROJECTS
                            </TabsTrigger>
                        </TabsList>

                        <div className="flex gap-4 w-full sm:w-auto">
                            <div className="relative flex-1 sm:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Global search..." className="pl-10 h-12 bg-muted/20 border-border/50 rounded-xl" />
                            </div>
                            <Button variant="outline" className="h-12 w-12 rounded-xl border-border/50"><Filter className="h-4 w-4" /></Button>
                        </div>
                    </div>

                    <TabsContent value="pending" className="mt-0">
                        {pendingLoading ? (
                            <div className="py-20 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-acm-blue" /></div>
                        ) : pendingProjects.length === 0 ? (
                            <Card className="rounded-[2.5rem] border-dashed border-2 border-border/50 bg-muted/5 py-24 text-center">
                                <CheckCircle className="h-16 w-16 text-emerald-500/20 mx-auto mb-6" />
                                <h3 className="text-xl font-bold">Protocols Synchronized</h3>
                                <p className="text-muted-foreground text-sm">No submissions are currently awaiting administrative review.</p>
                            </Card>
                        ) : (
                            <div className="grid gap-6">
                                {pendingProjects.map((project) => (
                                    <Card key={project.id} className="rounded-3xl border-border/50 bg-card/40 backdrop-blur-sm overflow-hidden group">
                                        <CardContent className="p-6 md:p-8">
                                            <div className="flex flex-col lg:flex-row gap-8">
                                                <div className="flex-1 space-y-4">
                                                    <div className="flex items-center gap-3">
                                                        <h3 className="text-xl font-black text-white italic">{project.title}</h3>
                                                        <Badge variant="secondary" className="bg-amber-500/10 text-amber-500 border-none">AWAITING REVIEW</Badge>
                                                    </div>
                                                    <p className="text-sm text-slate-400 leading-relaxed line-clamp-2">{project.description}</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {project.techStack?.map(t => (
                                                            <Badge key={t} variant="outline" className="border-border/50 rounded-lg text-[10px] font-bold">{t}</Badge>
                                                        ))}
                                                    </div>
                                                    <div className="flex gap-6 pt-2">
                                                        <div className="space-y-1">
                                                            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Origin</p>
                                                            <p className="text-xs font-bold text-white">{project.ownerName || 'Unknown Member'}</p>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Timestamp</p>
                                                            <p className="text-xs font-bold text-white">{new Date(project.createdAt).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex flex-row lg:flex-col gap-3 justify-end items-end">
                                                    <Button variant="ghost" asChild className="h-12 w-12 rounded-xl hover:bg-white/10">
                                                        <Link href={`/projects/${project.id}`} target="_blank"><Eye className="h-5 w-5 text-acm-blue" /></Link>
                                                    </Button>
                                                    <div className="flex gap-3">
                                                        <Button
                                                            onClick={() => handleReject(project.id)}
                                                            disabled={rejectMutation.isPending}
                                                            className="h-12 px-6 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 border-none font-bold"
                                                        >
                                                            <ThumbsDown className="mr-2 h-4 w-4" /> REJECT
                                                        </Button>
                                                        <Button
                                                            onClick={() => approveMutation.mutate(project.id)}
                                                            disabled={approveMutation.isPending}
                                                            className="h-12 px-8 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black tracking-widest shadow-lg shadow-emerald-500/20"
                                                        >
                                                            <ThumbsUp className="mr-2 h-4 w-4" /> AUTHORIZE
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="all" className="mt-0">
                        <Card className="rounded-[2.5rem] border-border/50 bg-card/40 backdrop-blur-xl overflow-hidden">
                            <Table>
                                <TableHeader className="bg-muted/10">
                                    <TableRow className="border-border/50 hover:bg-transparent">
                                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground h-14 pl-8">Archive Node</TableHead>
                                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground h-14">Protocol Status</TableHead>
                                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground h-14">Highlight</TableHead>
                                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground h-14 text-right pr-8">Operations</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {allProjectsLoading ? (
                                        <TableRow><TableCell colSpan={4} className="h-40 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-acm-blue" /></TableCell></TableRow>
                                    ) : allProjects.map((project) => (
                                        <TableRow key={project.id} className="border-border/30 hover:bg-white/5 transition-colors group">
                                            <TableCell className="pl-8 py-5">
                                                <div className="space-y-1">
                                                    <p className="font-bold text-white group-hover:text-acm-blue transition-colors">{project.title}</p>
                                                    <p className="text-xs text-muted-foreground">{project.ownerName || 'Unknown Member'}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>{getStatusBadge(project.status)}</TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => featureMutation.mutate({ projectId: project.id, featured: !project.featured })}
                                                    className={`h-10 w-10 rounded-xl transition-all ${project.featured ? 'bg-purple-500/10 text-purple-400' : 'text-muted-foreground hover:text-white'}`}
                                                >
                                                    <Star className={`h-4 w-4 ${project.featured ? 'fill-current' : ''}`} />
                                                </Button>
                                            </TableCell>
                                            <TableCell className="text-right pr-8">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button variant="ghost" size="icon" asChild className="h-9 w-9 rounded-lg hover:bg-acm-blue/10">
                                                        <Link href={`/projects/${project.id}`} target="_blank"><ExternalLink className="h-4 w-4 text-acm-blue" /></Link>
                                                    </Button>
                                                    {project.status === 'pending' && (
                                                        <>
                                                            <Button variant="ghost" size="icon" onClick={() => approveMutation.mutate(project.id)} className="h-9 w-9 rounded-lg hover:bg-emerald-500/10 text-emerald-500">
                                                                <ThumbsUp className="h-4 w-4" />
                                                            </Button>
                                                            <Button variant="ghost" size="icon" onClick={() => handleReject(project.id)} className="h-9 w-9 rounded-lg hover:bg-red-500/10 text-red-500">
                                                                <ThumbsDown className="h-4 w-4" />
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
