import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersAPI, projectsAPI, adminAPI } from "@/services/api";
import { VALID_ROLES, DEFAULT_ROLE } from "@/store/authStore";
import Loader from "@/components/common/Loader";
import {
    GraduationCap, Calendar, Shield, ShieldCheck,
    UserMinus, UserCheck, ArrowLeft, FolderGit2,
    Github, MessageSquare, AlertCircle, Eye, Edit3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { format } from "date-fns";

// Role styling configurations
const ROLE_STYLES = {
    admin: {
        color: "amber",
        accentBar: "bg-gradient-to-r from-amber-500 via-orange-400 to-amber-500",
        border: "border-amber-500/30",
        shadow: "shadow-amber-500/20",
        bg: "bg-amber-500",
        bgLight: "bg-amber-500/10",
        text: "text-amber-500",
        textLight: "text-amber-400",
        icon: ShieldCheck,
        label: "Administrator"
    },
    contributor: {
        color: "green",
        accentBar: "bg-gradient-to-r from-green-500 via-emerald-400 to-green-500",
        border: "border-green-500/30",
        shadow: "shadow-green-500/20",
        bg: "bg-green-500",
        bgLight: "bg-green-500/10",
        text: "text-green-500",
        textLight: "text-green-400",
        icon: Edit3,
        label: "Contributor"
    },
    viewer: {
        color: "blue",
        accentBar: "bg-gradient-to-r from-acm-blue via-cyan-400 to-acm-blue",
        border: "border-acm-blue/30",
        shadow: "shadow-acm-blue/20",
        bg: "bg-acm-blue",
        bgLight: "bg-acm-blue/10",
        text: "text-acm-blue",
        textLight: "text-acm-blue",
        icon: Eye,
        label: "Viewer"
    }
};

export default function AdminMemberProfilePage() {
    const { uid } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // Fetch user details
    const { data: userData, isLoading: isUserLoading } = useQuery({
        queryKey: ["member", uid],
        queryFn: () => usersAPI.getById(uid),
    });

    const user = userData?.data?.user;

    // Fetch user projects
    const { data: projectsData, isLoading: isProjectsLoading } = useQuery({
        queryKey: ["member-projects", uid],
        queryFn: () => projectsAPI.getAll({ authorUid: uid }),
    });

    const projects = projectsData?.data?.projects || [];

    // Mutation for role/status update
    const updateMutation = useMutation({
        mutationFn: (data) => usersAPI.update(uid, data),
        onSuccess: () => {
            queryClient.invalidateQueries(["member", uid]);
            toast.success("Profile updated successfully");
        }
    });

    if (isUserLoading || isProjectsLoading) {
        return <div className="flex items-center justify-center py-20"><Loader /></div>;
    }

    if (!user) {
        return (
            <div className="text-center py-20 space-y-4">
                <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto" />
                <h2 className="text-2xl font-black uppercase italic">Member Not Found</h2>
                <Button variant="link" onClick={() => navigate("/admin/members")} className="text-acm-blue font-bold">
                    Return to Directory
                </Button>
            </div>
        );
    }

    const handleRoleChange = (newRole) => {
        updateMutation.mutate({ role: newRole });
    };

    const toggleStatus = () => {
        const newDisabled = !user.disabled;
        updateMutation.mutate({ disabled: newDisabled });
    };

    // Get current role style (fallback to viewer if unknown role)
    const roleStyle = ROLE_STYLES[user.role] || ROLE_STYLES.viewer;
    const RoleIcon = roleStyle.icon;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Breadcrumb Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate("/admin/members")} className="rounded-xl hover:bg-white/10">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-black tracking-tight uppercase italic">Member Profile</h1>
                    <p className="text-sm text-muted-foreground">Detailed administrative view · <code className="text-acm-blue text-xs">{uid}</code></p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* ─── Left: Identity Card ─── */}
                <div className="lg:col-span-1 space-y-4">
                    <Card className="rounded-[2.5rem] border-border/50 bg-card/30 backdrop-blur-xl overflow-hidden shadow-2xl relative">
                        {/* Top accent bar */}
                        <div className={`absolute top-0 left-0 w-full h-2 ${roleStyle.accentBar}`} />

                        <CardHeader className="pt-12 items-center text-center space-y-4">
                            <Avatar className={`h-32 w-32 rounded-[2.5rem] border-4 shadow-xl ${roleStyle.border} ${roleStyle.shadow}`}>
                                <AvatarImage src={user.photoURL} />
                                <AvatarFallback className={`${roleStyle.bg} text-white font-black text-4xl italic`}>
                                    {user.name?.charAt(0) || "U"}
                                </AvatarFallback>
                            </Avatar>

                            <div className="space-y-1">
                                <CardTitle className="text-2xl font-black uppercase italic tracking-tight">{user.name}</CardTitle>
                                <CardDescription className={`font-bold ${roleStyle.textLight}`}>{user.email}</CardDescription>
                            </div>

                            {/* ROLE — prominently displayed with dropdown */}
                            <div className={`w-full py-3 px-4 rounded-2xl border flex items-center justify-center gap-3 ${roleStyle.bgLight} ${roleStyle.border}`}>
                                <RoleIcon className={`h-5 w-5 ${roleStyle.text}`} />
                                <span className={`text-lg font-black uppercase tracking-widest italic ${roleStyle.textLight}`}>
                                    {user.role?.toUpperCase() || 'VIEWER'}
                                </span>
                            </div>

                            {/* Status badge */}
                            <Badge variant="outline" className={`font-black tracking-widest text-[9px] uppercase italic ${user.disabled ? 'border-red-500/30 text-red-500 bg-red-500/5' : 'border-emerald-500/30 text-emerald-500 bg-emerald-500/5'}`}>
                                {user.disabled ? "● Suspended" : "● Active Service"}
                            </Badge>
                        </CardHeader>

                        <CardContent className="space-y-6 px-8 pb-10">
                            <Separator className="bg-border/30" />

                            {/* Attributes */}
                            <div className="space-y-3">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Attributes</h3>
                                <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/5">
                                    <GraduationCap className={`h-4 w-4 ${roleStyle.text}`} />
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase leading-none">Class Of</span>
                                        <span className="text-sm font-black">{user.graduationYear || "Not Specified"}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/5">
                                    <Calendar className={`h-4 w-4 ${roleStyle.text}`} />
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase leading-none">Joined</span>
                                        <span className="text-sm font-black">
                                            {user.joinedDate ? format(new Date(user.joinedDate), "MMM dd, yyyy") : "Unknown"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <Separator className="bg-border/30" />

                            {/* Role Selection */}
                            <div className="space-y-3">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Role Management</h3>
                                <Select 
                                    value={user.role || DEFAULT_ROLE} 
                                    onValueChange={handleRoleChange}
                                    disabled={updateMutation.isPending}
                                >
                                    <SelectTrigger className="h-12 rounded-xl border-border/50 bg-muted/20 font-bold">
                                        <SelectValue placeholder="Select Role" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-border/50 bg-card/95 backdrop-blur-xl">
                                        <SelectItem value="viewer" className="font-bold py-3">
                                            <span className="flex items-center gap-2">
                                                <Eye className="h-4 w-4 text-acm-blue" />
                                                <span>Viewer</span>
                                                <span className="text-[9px] text-muted-foreground ml-2">Can only view projects</span>
                                            </span>
                                        </SelectItem>
                                        <SelectItem value="contributor" className="font-bold py-3">
                                            <span className="flex items-center gap-2">
                                                <Edit3 className="h-4 w-4 text-green-500" />
                                                <span>Contributor</span>
                                                <span className="text-[9px] text-muted-foreground ml-2">Can create projects</span>
                                            </span>
                                        </SelectItem>
                                        <SelectItem value="admin" className="font-bold py-3">
                                            <span className="flex items-center gap-2">
                                                <ShieldCheck className="h-4 w-4 text-amber-500" />
                                                <span>Admin</span>
                                                <span className="text-[9px] text-muted-foreground ml-2">Full access</span>
                                            </span>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <Separator className="bg-border/30" />

                            {/* Status Control */}
                            <div className="space-y-3">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Account Status</h3>
                                <Button
                                    variant="outline"
                                    onClick={toggleStatus}
                                    disabled={updateMutation.isPending}
                                    className={`w-full justify-start rounded-xl font-bold text-xs h-11 border-border/50 gap-2 transition-all ${user.disabled ? 'hover:bg-emerald-500/10 hover:text-emerald-500 hover:border-emerald-500/30' : 'hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30'}`}
                                >
                                    {user.disabled ? <UserCheck className="h-4 w-4" /> : <UserMinus className="h-4 w-4" />}
                                    {user.disabled ? "Restore Account" : "Suspend Account"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* ─── Right: Bio + Contributions ─── */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Bio */}
                    <Card className="rounded-[2.5rem] border-border/50 bg-card/30 backdrop-blur-xl shadow-xl overflow-hidden">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                                <MessageSquare className={`h-4 w-4 ${roleStyle.text}`} /> Bio & Skills
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-8 pb-8 space-y-5">
                            <p className="text-slate-300 leading-relaxed font-medium italic">
                                "{user.bio || "No biography provided."}"
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {user.skills?.map(skill => (
                                    <Badge key={skill} variant="secondary" className={`rounded-lg border-none font-bold uppercase text-[9px] tracking-widest px-3 py-1 ${roleStyle.bgLight} ${roleStyle.textLight}`}>
                                        {skill}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Contributions */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <h2 className="text-xl font-black uppercase italic tracking-tight flex items-center gap-2">
                                <FolderGit2 className="h-5 w-5 text-acm-blue" /> Contributions
                            </h2>
                            <Badge className="bg-black/40 text-acm-blue border border-acm-blue/20 font-black">{projects.length}</Badge>
                        </div>

                        {projects.length === 0 ? (
                            <div className="p-12 rounded-[2.5rem] border-2 border-dashed border-border/50 text-center bg-white/5">
                                <FolderGit2 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                                <p className="text-muted-foreground font-bold italic uppercase text-[10px]">No documented contributions yet</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {projects.map(project => (
                                    <Card key={project.id} className="rounded-3xl border-border/50 bg-card/40 backdrop-blur-sm group hover:border-acm-blue/30 transition-all">
                                        <CardContent className="p-5">
                                            <div className="flex items-start justify-between mb-3">
                                                <Badge variant="outline" className={`text-[8px] font-black uppercase tracking-widest py-0.5 h-4 border-none ${project.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500' :
                                                        project.status === 'pending' ? 'bg-amber-500/10 text-amber-500' :
                                                            'bg-red-500/10 text-red-500'
                                                    }`}>
                                                    {project.status}
                                                </Badge>
                                                <Button variant="ghost" size="icon" asChild className="h-7 w-7 rounded-lg hover:bg-acm-blue/10">
                                                    <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                                                        <Github className="h-3.5 w-3.5" />
                                                    </a>
                                                </Button>
                                            </div>
                                            <h4 className="font-black text-sm uppercase italic truncate group-hover:text-acm-blue transition-colors mb-1">{project.title}</h4>
                                            <p className="text-[10px] text-muted-foreground line-clamp-2 mb-3">{project.description}</p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {project.techStack?.slice(0, 4).map(tech => (
                                                    <span key={tech} className="text-[8px] font-black text-acm-blue/70 uppercase bg-acm-blue/5 px-1.5 py-0.5 rounded-md">{tech}</span>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
