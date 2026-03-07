import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersAPI, projectsAPI } from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { updateProfile } from "firebase/auth";
import { auth } from "@/config/firebase";
import { toast } from "sonner";
import { format } from "date-fns";
import {
    User, Mail, Calendar, Edit3, Save, X, Loader2, ExternalLink,
    FolderOpen, CheckCircle, Clock, XCircle, BarChart3, LogOut, Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import Layout from "@/components/Layout";

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
            if (auth.currentUser) await updateProfile(auth.currentUser, { displayName: newName });
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

    if (profileLoading) return <div className="flex min-h-[400px] items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-acm-blue" /></div>;

    return (
        <div className="pb-20">
            <section className="relative overflow-hidden bg-slate-950/50 py-20 border-b border-border/50 rounded-[3rem] mb-12">
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
                                                className="bg-muted px-4 py-2 rounded-xl border border-acm-blue font-bold text-2xl focus:outline-none focus:ring-2 focus:ring-acm-blue/20" autoFocus />
                                            <Button size="icon" onClick={handleSave} className="rounded-xl h-10 w-10 bg-emerald-500 hover:bg-emerald-600">
                                                {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                            </Button>
                                            <Button size="icon" variant="destructive" onClick={() => setIsEditing(false)} className="rounded-xl h-10 w-10">
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <>
                                            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">{displayName || "Community Member"}</h1>
                                            <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)} className="h-10 w-10 rounded-xl hover:bg-white/10">
                                                <Edit3 className="h-4 w-4 text-acm-blue" />
                                            </Button>
                                        </>
                                    )}
                                </div>
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-slate-400 text-sm font-medium">
                                    <span className="flex items-center gap-2"><Mail className="h-4 w-4 text-acm-blue/50" />{user?.email}</span>
                                    <span className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-acm-blue/50" />
                                        {profile?.createdAt ? `Member since ${format(new Date(profile.createdAt._seconds ? profile.createdAt._seconds * 1000 : profile.createdAt), "MMM yyyy")}` : "Active Member"}
                                    </span>
                                    <Badge variant="outline" className="border-acm-blue/30 text-acm-blue bg-acm-blue/5 h-6 font-bold uppercase tracking-widest text-[10px]">
                                        {user?.role || "MEMBER"}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button variant="outline" onClick={handleLogout} className="rounded-2xl border-red-500/20 text-red-500 hover:bg-red-500/10 font-bold h-12 px-6">
                                <LogOut className="mr-2 h-4 w-4" /> SIGN OUT
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="space-y-6">
                    <Card className="rounded-[2.5rem] border-border/50 bg-card/30 backdrop-blur-xl overflow-hidden shadow-xl">
                        <CardHeader className="p-6 pb-2">
                            <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                                <BarChart3 className="h-3 w-3 text-acm-blue" /> Contribution Metrics
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-2xl font-black text-white">{stats.total}</p>
                                    <p className="text-[10px] uppercase font-bold text-muted-foreground leading-none">Total</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-2xl font-black text-emerald-500">{stats.approved}</p>
                                    <p className="text-[10px] uppercase font-bold text-muted-foreground leading-none">Live</p>
                                </div>
                            </div>
                            <Separator className="bg-border/30" />
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-muted-foreground">Pending Review</span>
                                <Badge variant="secondary" className="bg-amber-500/10 text-amber-500 border-none font-bold">{stats.pending}</Badge>
                            </div>
                        </CardContent>
                    </Card>

                    <Button asChild className="w-full h-14 rounded-2xl bg-acm-blue hover:bg-acm-blue-dark shadow-acm-glow font-black tracking-widest transition-all hover:scale-[1.02]">
                        <Link to="/submit"><Plus className="mr-2 h-5 w-5" /> NEW SUBMISSION</Link>
                    </Button>
                </div>

                <div className="lg:col-span-3">
                    <h2 className="text-2xl font-black tracking-tighter mb-8 flex items-center gap-3 italic">
                        <FolderOpen className="h-6 w-6 text-acm-blue" /> MY PROJECTS
                    </h2>

                    {projectsLoading ? (
                        <div className="grid gap-4 sm:grid-cols-2">
                            {[1, 2].map(i => <div key={i} className="h-48 rounded-3xl bg-muted animate-pulse" />)}
                        </div>
                    ) : projects.length === 0 ? (
                        <Card className="rounded-[3rem] border-dashed border-2 border-border/50 bg-muted/5 p-20 text-center">
                            <div className="mb-6 rounded-full bg-muted p-4 inline-flex"><FolderOpen className="h-12 w-12 text-muted-foreground" /></div>
                            <h3 className="text-xl font-bold mb-2">No active projects found.</h3>
                            <p className="text-muted-foreground mb-8 max-w-xs mx-auto text-sm">You haven't submitted any projects yet.</p>
                            <Button asChild className="rounded-2xl h-12 px-8 bg-acm-blue hover:bg-acm-blue-dark">
                                <Link to="/submit">Start your first contribution</Link>
                            </Button>
                        </Card>
                    ) : (
                        <div className="grid gap-6 sm:grid-cols-2">
                            {projects.map((project) => {
                                const status = getStatusConfig(project.status);
                                const StatusIcon = status.icon;
                                return (
                                    <Card key={project.id} className="group rounded-[2rem] border-border/50 bg-card/40 backdrop-blur-sm transition-all hover:border-acm-blue/50 hover:shadow-acm-glow overflow-hidden">
                                        <CardContent className="p-6">
                                            <div className="flex items-start justify-between gap-4 mb-4">
                                                <Badge variant="outline" className={`${status.bg} ${status.color} border-none font-bold text-[10px] tracking-widest px-2.5`}>
                                                    <StatusIcon className="mr-1 h-3 w-3" /> {status.label.toUpperCase()}
                                                </Badge>
                                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button variant="ghost" size="icon" asChild className="h-8 w-8 rounded-lg hover:bg-acm-blue/10">
                                                        <Link to={`/projects/${project.id}`}><ExternalLink className="h-4 w-4 text-acm-blue" /></Link>
                                                    </Button>
                                                </div>
                                            </div>
                                            <h4 className="text-lg font-bold truncate group-hover:text-acm-blue transition-colors mb-2 uppercase tracking-tight">{project.title}</h4>
                                            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed h-8">{project.description}</p>
                                            <Separator className="my-4 bg-border/30" />
                                            <div className="flex items-center justify-between">
                                                <div className="flex flex-wrap gap-1.5">
                                                    {project.techStack?.slice(0, 3).map(t => (
                                                        <Badge key={t} variant="secondary" className="text-[9px] h-4 leading-none bg-muted/50 border-none font-medium">{t}</Badge>
                                                    ))}
                                                </div>
                                                <span className="text-[10px] font-black text-muted-foreground/50">{format(new Date(project.createdAt), "MMM d")}</span>
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
