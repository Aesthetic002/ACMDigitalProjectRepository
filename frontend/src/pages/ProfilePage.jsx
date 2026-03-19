import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersAPI, projectsAPI } from "@/services/api";
import { useAuthStore } from "@/store/authStore";
// Mock updateProfile - actual profile updates handled by API
const mockUpdateProfile = async () => {};
import { toast } from "sonner";
import { format } from "date-fns";
import {
    Mail, Calendar, Edit3, Save, X, Loader2, ExternalLink,
    FolderOpen, CheckCircle, Clock, XCircle, BarChart3, LogOut, Plus, Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Layout from "@/components/Layout";
import Loader from "@/components/common/Loader";

function ProfileContent() {
    const { user, setUser, logout } = useAuthStore();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [isEditing, setIsEditing] = useState(false);
    const [displayName, setDisplayName] = useState(user?.name || "");

    const { data: profileData, isLoading: profileLoading } = useQuery({
        queryKey: ["profile"],
        queryFn: () => usersAPI.getById(user?.uid),
        enabled: !!user?.uid,
    });

    const { data: projectsData, isLoading: projectsLoading } = useQuery({
        queryKey: ["my-projects", user?.uid],
        queryFn: () => projectsAPI.getAll({ ownerId: user?.uid, limit: 50 }),
        enabled: !!user?.uid,
    });

    const profile = profileData?.data?.user || user;
    const projects = projectsData?.data?.projects || [];

    const updateMutation = useMutation({
        mutationFn: async (newName) => {
            // Profile updates handled by API only in mock mode
            return usersAPI.update(user.uid, { name: newName });
        },
        onSuccess: () => {
            setUser({ ...user, name: displayName, displayName });
            queryClient.invalidateQueries({ queryKey: ["profile"] });
            toast.success("Identity protocols updated");
            setIsEditing(false);
        },
        onError: (error) => toast.error(error.response?.data?.message || "Update failed"),
    });

    const handleSave = () => {
        if (!displayName.trim()) return toast.error("Name cannot be null");
        updateMutation.mutate(displayName);
    };

    const deleteMutation = useMutation({
        mutationFn: (projectId) => projectsAPI.delete(projectId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-projects', user?.uid] });
            toast.success('Project deleted successfully');
        },
        onError: (error) => toast.error(error.response?.data?.message || 'Failed to delete project'),
    });

    const getStatusConfig = (status) => {
        switch (status) {
            case "approved": return { icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-500/10", label: "Verified" };
            case "pending": return { icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10", label: "Processing" };
            case "rejected": return { icon: XCircle, color: "text-red-500", bg: "bg-red-500/10", label: "Rejected" };
            default: return { icon: Clock, color: "text-muted-foreground", bg: "bg-muted", label: status };
        }
    };

    const stats = {
        total: projects.length,
        approved: projects.filter(p => p.status === "approved").length,
        pending: projects.filter(p => p.status === "pending").length,
    };

    const handleLogout = async () => { await logout(); navigate("/"); };

    if (profileLoading) return <div className="flex min-h-[400px] items-center justify-center bg-slate-950"><Loader size={1.5} /></div>;

    return (
        <div className="pb-20">
            <section className="relative overflow-hidden bg-slate-950/50 py-20 border-b border-border/50 rounded-[3rem] mb-12 border-t border-t-white/5">
                <div className="absolute inset-0 bg-acm-blue/5 [mask-image:radial-gradient(circle_at_center,white,transparent)]" />
                <div className="container relative mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center gap-8 md:items-end">
                        <Avatar className="h-32 w-32 rounded-[2.5rem] border-4 border-background shadow-2xl">
                            <AvatarImage src={user?.photoURL} />
                            <AvatarFallback className="bg-acm-blue text-white text-4xl font-black rounded-[2.5rem]">{displayName?.charAt(0) || "U"}</AvatarFallback>
                        </Avatar>

                        <div className="flex-1 text-center md:text-left space-y-4">
                            <div className="space-y-1">
                                <div className="flex items-center gap-3 justify-center md:justify-start">
                                    {isEditing ? (
                                        <div className="flex items-center gap-2">
                                            <input value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                                                className="bg-muted px-4 py-2 rounded-xl border border-acm-blue font-black text-2xl uppercase italic focus:outline-none focus:ring-2 focus:ring-acm-blue/20" autoFocus />
                                            <Button size="icon" onClick={handleSave} className="rounded-xl h-10 w-10 bg-emerald-500 hover:bg-emerald-600">
                                                {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                            </Button>
                                            <Button size="icon" variant="destructive" onClick={() => setIsEditing(false)} className="rounded-xl h-10 w-10">
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <>
                                            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white uppercase italic">{displayName || "Community Member"}</h1>
                                            <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)} className="h-10 w-10 rounded-xl hover:bg-white/10">
                                                <Edit3 className="h-4 w-4 text-acm-blue" />
                                            </Button>
                                        </>
                                    )}
                                </div>
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] italic">
                                    <span className="flex items-center gap-2 bg-white/5 border border-white/5 px-3 py-1 rounded-full"><Mail className="h-3 w-3 text-acm-blue" />{user?.email}</span>
                                    <span className="flex items-center gap-2 bg-white/5 border border-white/5 px-3 py-1 rounded-full">
                                        <Calendar className="h-3 w-3 text-acm-blue" />
                                        {profile?.createdAt ? `MEMBER SINCE ${format(new Date(profile.createdAt._seconds ? profile.createdAt._seconds * 1000 : profile.createdAt), "MMM yyyy")}` : "ACTIVE MEMBER"}
                                    </span>
                                    <Badge variant="outline" className="border-acm-blue/30 text-acm-blue bg-white/5 h-6 font-black uppercase tracking-widest text-[9px] italic">
                                        {user?.role || "MEMBER"}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button variant="outline" onClick={handleLogout} className="rounded-2xl border-red-500/20 text-red-500 hover:bg-red-500/10 font-black uppercase tracking-widest text-xs italic h-12 px-6">
                                <LogOut className="mr-2 h-4 w-4" /> SIGN OUT
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                <div className="space-y-6">
                    <Card className="rounded-[2.5rem] border-border/50 bg-card/30 backdrop-blur-xl overflow-hidden shadow-2xl border-t-2 border-t-white/5">
                        <CardHeader className="p-8 pb-4">
                            <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-acm-blue flex items-center gap-2 italic">
                                <BarChart3 className="h-3.5 w-3.5" /> METRICS
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-8">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-3xl font-black text-white italic">{stats.total}</p>
                                    <p className="text-[9px] uppercase font-black text-muted-foreground leading-none tracking-widest">TOTAL</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-3xl font-black text-emerald-500 italic">{stats.approved}</p>
                                    <p className="text-[9px] uppercase font-black text-muted-foreground leading-none tracking-widest">LIVE</p>
                                </div>
                            </div>
                            <Separator className="bg-border/30" />
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground italic">PROCESSING</span>
                                <Badge variant="secondary" className="bg-amber-500/10 text-amber-500 border-none font-black italic">{stats.pending}</Badge>
                            </div>
                        </CardContent>
                    </Card>

                    <Button asChild className="w-full h-16 rounded-[1.5rem] bg-acm-blue hover:bg-acm-blue-dark shadow-acm-glow font-black tracking-[0.2em] transition-all hover:scale-[1.02] uppercase italic">
                        <Link to="/submit"><Plus className="mr-2 h-5 w-5" /> NEW SUBMISSION</Link>
                    </Button>
                </div>

                <div className="lg:col-span-3">
                    <h2 className="text-3xl font-black tracking-tighter mb-10 flex items-center gap-3 italic text-white uppercase">
                        <FolderOpen className="h-8 w-8 text-acm-blue" /> MY REPOSITORY
                    </h2>

                    {projectsLoading ? (
                        <div className="grid gap-8 sm:grid-cols-2">
                            {[1, 2].map(i => <div key={i} className="h-64 rounded-[2.5rem] bg-card/30 border border-white/5 animate-pulse" />)}
                        </div>
                    ) : projects.length === 0 ? (
                        <Card className="rounded-[3rem] border-dashed-2 border-border/30 bg-white/2 p-24 text-center border-2">
                            <div className="mb-6 rounded-[2rem] bg-muted/50 p-6 inline-flex shadow-inner"><FolderOpen className="h-16 w-16 text-muted-foreground/30" /></div>
                            <h3 className="text-3xl font-black tracking-tight text-white uppercase italic mb-3">Void Detected.</h3>
                            <p className="text-muted-foreground mb-10 max-w-xs mx-auto text-sm font-medium">Your contribution archive is currently uninitialized.</p>
                            <Button asChild className="rounded-xl h-14 px-10 bg-white text-slate-950 hover:bg-slate-200 font-black uppercase tracking-widest italic">
                                <Link to="/submit">Initialize First Record</Link>
                            </Button>
                        </Card>
                    ) : (
                        <div className="grid gap-10 sm:grid-cols-2">
                            {projects.map((project) => {
                                const status = getStatusConfig(project.status);
                                const StatusIcon = status.icon;
                                return (
                                    <Card key={project.id} className="group rounded-[2.5rem] border-border/50 bg-card/40 backdrop-blur-xl transition-all hover:border-acm-blue/50 hover:shadow-acm-glow overflow-hidden border-t border-t-white/5 shadow-2xl">
                                        <CardContent className="p-8">
                                            <div className="flex items-start justify-between gap-4 mb-6">
                                                <Badge variant="outline" className={`${status.bg} ${status.color} border-none font-black text-[9px] tracking-[0.2em] px-3 py-1 uppercase italic bg-white/5`}>
                                                    <StatusIcon className="mr-1.5 h-3 w-3" /> {status.label}
                                                </Badge>
                                                <div className="flex gap-2.5 translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                                                    <Button variant="ghost" size="icon" asChild className="h-9 w-9 rounded-xl border border-white/5 hover:bg-acm-blue/10 bg-white/5">
                                                        <Link to={`/projects/${project.id}`}><ExternalLink className="h-4 w-4 text-acm-blue" /></Link>
                                                    </Button>
                                                    <Button variant="ghost" size="icon" asChild className="h-9 w-9 rounded-xl border border-white/5 hover:bg-amber-500/10 bg-white/5 text-muted-foreground hover:text-amber-500">
                                                        <Link to={`/projects/${project.id}/edit`}><Edit3 className="h-4 w-4" /></Link>
                                                    </Button>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl border border-white/5 hover:bg-red-500/10 bg-white/5 text-muted-foreground hover:text-red-500">
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent className="rounded-[2rem] bg-slate-950 border-border/50 backdrop-blur-xl border-t-2 border-t-white/5">
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle className="font-black uppercase italic text-2xl tracking-tighter">Deprecate Record</AlertDialogTitle>
                                                                <AlertDialogDescription className="text-slate-400 font-medium pt-2">
                                                                    Are you certain you wish to permanently deprecate <strong>{project.title}</strong>? This action is non-reversible.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter className="pt-6">
                                                                <AlertDialogCancel className="rounded-xl font-black uppercase italic text-xs tracking-widest border-white/5 hover:bg-white/5">ABORT</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={() => deleteMutation.mutate(project.id)}
                                                                    className="bg-red-500 hover:bg-red-600 rounded-xl font-black uppercase italic text-xs tracking-widest text-white px-8"
                                                                >
                                                                    {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'DEPRECATE'}
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </div>
                                            <h4 className="text-xl font-black truncate group-hover:text-acm-blue transition-colors mb-4 uppercase tracking-tight italic text-white">{project.title}</h4>
                                            <p className="text-sm font-medium text-slate-400 line-clamp-2 leading-relaxed h-10 mb-6">{project.description}</p>
                                            <Separator className="mb-6 bg-white/5" />
                                            <div className="flex items-center justify-between">
                                                <div className="flex flex-wrap gap-2">
                                                    {project.techStack?.slice(0, 3).map(t => (
                                                        <Badge key={t} variant="secondary" className="text-[8px] h-5 leading-none bg-white/5 border border-white/5 font-black uppercase tracking-widest italic text-white/40">{t}</Badge>
                                                    ))}
                                                </div>
                                                <span className="text-[10px] font-black text-muted-foreground/30 italic uppercase tracking-widest">{format(new Date(project.createdAt), "MMM d")}</span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function ProfilePage() {
    return (
        <Layout>
            <div className="container mx-auto px-4 py-8">
                <ProfileContent />
            </div>
        </Layout>
    );
}
