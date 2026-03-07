import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminAPI, usersAPI, projectsAPI } from "@/services/api";
import {
    User, Mail, GraduationCap, Calendar, Shield,
    ShieldCheck, UserMinus, UserCheck, ArrowLeft,
    ExternalLink, FolderGit2, BadgeCheck, Github,
    Trophy, MessageSquare, AlertCircle, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { format } from "date-fns";

export default function AdminMemberProfilePage() {
    const { uid } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: userData, isLoading: userLoading } = useQuery({
        queryKey: ["admin-user", uid],
        queryFn: () => usersAPI.getById(uid),
        enabled: !!uid,
    });

    const { data: projectsData, isLoading: projectsLoading } = useQuery({
        queryKey: ["admin-user-projects", uid],
        queryFn: () => projectsAPI.getAll({ ownerId: uid, limit: 100 }),
        enabled: !!uid,
    });

    const user = userData?.data?.user;
    const projects = projectsData?.data?.projects || [];

    const updateMutation = useMutation({
        mutationFn: (data) => adminAPI.updateUser(uid, data),
        onSuccess: () => {
            queryClient.invalidateQueries(["admin-user", uid]);
            queryClient.invalidateQueries(["admin-users"]);
            toast.success("Member record synchronized");
        },
        onError: () => toast.error("Failed to update member record"),
    });

    if (userLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-acm-blue" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="text-center py-20">
                <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-2xl font-black uppercase italic">Member Not Found</h2>
                <Button variant="link" onClick={() => navigate("/admin/members")} className="text-acm-blue font-bold">
                    Return to Directory
                </Button>
            </div>
        );
    }

    const toggleStatus = () => {
        updateMutation.mutate({ disabled: !user.disabled });
    };

    const toggleRole = () => {
        updateMutation.mutate({ role: user.role === "admin" ? "member" : "admin" });
    };

    return (
        <div className="p-4 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header / Breadcrumb */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate("/admin/members")} className="rounded-xl hover:bg-white/10">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-black tracking-tight uppercase italic flex items-center gap-2">
                        Member Profile <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest border-border/50 bg-white/5">{uid.substring(0, 8)}</Badge>
                    </h1>
                    <p className="text-sm text-muted-foreground">Detailed administrative view of chapter personnel.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Core Info */}
                <div className="space-y-6 lg:col-span-1">
                    <Card className="rounded-[2.5rem] border-border/50 bg-card/30 backdrop-blur-xl overflow-hidden shadow-2xl relative">
                        <div className={`absolute top-0 left-0 w-full h-2 ${user.role === 'admin' ? 'bg-amber-500' : 'bg-acm-blue'}`} />
                        <CardHeader className="pt-12 items-center text-center">
                            <Avatar className="h-32 w-32 rounded-[2.5rem] border-4 border-background shadow-xl mb-4">
                                <AvatarImage src={user.photoURL} />
                                <AvatarFallback className={`${user.role === 'admin' ? 'bg-amber-500' : 'bg-acm-blue'} text-white font-black text-4xl italic`}>
                                    {user.name?.charAt(0) || "U"}
                                </AvatarFallback>
                            </Avatar>
                            <CardTitle className="text-2xl font-black uppercase italic tracking-tight">{user.name}</CardTitle>
                            <CardDescription className="font-medium text-acm-blue">{user.email}</CardDescription>

                            <div className="flex flex-wrap gap-2 justify-center mt-4">
                                <Badge variant="outline" className={`font-black tracking-widest text-[9px] uppercase italic ${user.role === 'admin' ? 'border-amber-500/30 text-amber-500 bg-amber-500/5' : 'border-acm-blue/30 text-acm-blue bg-acm-blue/5'}`}>
                                    {user.role === 'admin' ? <ShieldCheck className="h-3 w-3 mr-1" /> : <User className="h-3 w-3 mr-1" />}
                                    {user.role}
                                </Badge>
                                <Badge variant="outline" className={`font-black tracking-widest text-[9px] uppercase italic ${user.disabled ? 'border-red-500/30 text-red-500 bg-red-500/5' : 'border-emerald-500/30 text-emerald-500 bg-emerald-500/5'}`}>
                                    {user.disabled ? "Suspended" : "Active Service"}
                                </Badge>
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-6 px-8 pb-10">
                            <Separator className="bg-border/30" />

                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Technical Attributes</h3>
                                <div className="grid grid-cols-1 gap-3">
                                    <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/5">
                                        <GraduationCap className="h-4 w-4 text-acm-blue" />
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase leading-none">Class Of</span>
                                            <span className="text-sm font-black">{user.graduationYear || "Not Specified"}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/5">
                                        <Calendar className="h-4 w-4 text-acm-blue" />
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase leading-none">Enlistment Date</span>
                                            <span className="text-sm font-black">{user.joinedDate ? format(new Date(user.joinedDate), "MMMM dd, yyyy") : "Archive Default"}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Separator className="bg-border/30" />

                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Privilege Escalation</h3>
                                <div className="grid grid-cols-1 gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={toggleRole}
                                        className={`w-full justify-start rounded-xl font-bold text-xs h-11 border-border/50 gap-2 ${user.role === 'admin' ? 'hover:bg-amber-500/10 hover:text-amber-500' : 'hover:bg-acm-blue/10 hover:text-acm-blue'}`}
                                    >
                                        {user.role === 'admin' ? <Shield className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                                        {user.role === 'admin' ? "Restrict to Member" : "Grant Admin Access"}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={toggleStatus}
                                        className={`w-full justify-start rounded-xl font-bold text-xs h-11 border-border/50 gap-2 ${user.disabled ? 'hover:bg-emerald-500/10 hover:text-emerald-500' : 'hover:bg-red-500/10 hover:text-red-500'}`}
                                    >
                                        {user.disabled ? <UserCheck className="h-4 w-4" /> : <UserMinus className="h-4 w-4" />}
                                        {user.disabled ? "Restore Account" : "Suspend Account"}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Bio & Contributions */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Bio Card */}
                    <Card className="rounded-[2.5rem] border-border/50 bg-card/30 backdrop-blur-xl shadow-xl overflow-hidden">
                        <CardHeader>
                            <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                                <MessageSquare className="h-4 w-4 text-acm-blue" /> Member Bio & Skills
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-8 pb-8 space-y-6">
                            <p className="text-slate-300 leading-relaxed font-medium italic">
                                "{user.bio || "No tactical biography provided for this member."}"
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {user.skills?.map(skill => (
                                    <Badge key={skill} variant="secondary" className="rounded-lg bg-acm-blue/10 text-acm-blue border-none font-bold uppercase text-[9px] tracking-widest px-3 py-1">
                                        {skill}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Contributions Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <h2 className="text-xl font-black uppercase italic tracking-tight flex items-center gap-2">
                                <FolderGit2 className="h-5 w-5 text-acm-blue" /> Technical Contributions
                            </h2>
                            <Badge className="bg-black/40 text-acm-blue border border-acm-blue/20 font-black">{projects.length}</Badge>
                        </div>

                        {projectsLoading ? (
                            <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-acm-blue" /></div>
                        ) : projects.length === 0 ? (
                            <div className="p-12 rounded-[2.5rem] border-2 border-dashed border-border/50 text-center bg-white/5">
                                <FolderGit2 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                                <p className="text-muted-foreground font-bold italic uppercase tracking-widest text-[10px]">No documented contributions yet</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {projects.map(project => (
                                    <Card key={project.id} className="rounded-3xl border-border/50 bg-card/40 backdrop-blur-sm group hover:border-acm-blue/30 transition-all">
                                        <CardContent className="p-5">
                                            <div className="flex items-start justify-between mb-2">
                                                <Badge variant="outline" className={`text-[8px] font-black uppercase tracking-widest py-0 h-4 border-none ${project.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500' :
                                                        project.status === 'pending' ? 'bg-amber-500/10 text-amber-500' :
                                                            'bg-red-500/10 text-red-500'
                                                    }`}>
                                                    {project.status}
                                                </Badge>
                                                <Button variant="ghost" size="icon" asChild className="h-7 w-7 rounded-lg hover:bg-acm-blue/10">
                                                    <a href={project.githubUrl} target="_blank" rel="noopener noreferrer"><Github className="h-3.5 w-3.5" /></a>
                                                </Button>
                                            </div>
                                            <h4 className="font-black text-sm uppercase italic truncate group-hover:text-acm-blue transition-colors">{project.title}</h4>
                                            <p className="text-[10px] text-muted-foreground line-clamp-2 mt-1 mb-3">{project.description}</p>
                                            <div className="flex flex-wrap gap-1">
                                                {project.techStack?.slice(0, 3).map(tech => (
                                                    <span key={tech} className="text-[8px] font-black text-acm-blue/70 uppercase">{tech}</span>
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
