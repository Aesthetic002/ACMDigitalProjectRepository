import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { projectsAPI, adminAPI } from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import {
    FolderPlus, Search, Trash2, CheckCircle2, XCircle,
    Clock, FolderGit2, RotateCcw, Filter, Loader2, Eye
} from "lucide-react";
import Loader from "@/components/common/Loader";
import {
    Table, TableBody, TableCell, TableHead,
    TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

const STATUS_CONFIG = {
    approved: { label: "APPROVED", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/30" },
    pending: { label: "PENDING", icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10  border-amber-500/30" },
    rejected: { label: "REJECTED", icon: XCircle, color: "text-red-500", bg: "bg-red-500/10    border-red-500/30" },
};

export default function AdminProjectsPage() {
    const [projects, setProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const { user } = useAuthStore();

    const demoProjects = [
        { id: 'dp1', title: 'Neural Link API', author: { name: 'Alice Smith' }, status: 'approved', techStack: ['Python', 'PyTorch'], createdAt: new Date('2026-03-01') },
        { id: 'dp2', title: 'Quantum Encryption', author: { name: 'Bob Johnson' }, status: 'pending', techStack: ['Rust', 'Wasm'], createdAt: new Date('2026-03-05') },
        { id: 'dp3', title: 'Autonomous Drone Fleet', author: { name: 'Charlie Davis' }, status: 'approved', techStack: ['C++', 'ROS'], createdAt: new Date('2026-03-08') },
        { id: 'dp4', title: 'Smart Agriculture IoT', author: { name: 'Diana Prince' }, status: 'rejected', techStack: ['Arduino', 'LoRa'], createdAt: new Date('2026-03-10') },
        { id: 'dp5', title: 'Blockchain Voting System', author: { name: 'Edward Nigma' }, status: 'pending', techStack: ['Solidity', 'React'], createdAt: new Date('2026-03-12') },
        { id: 'dp6', title: 'Cyber Threat Detector', author: { name: 'Frank Castle' }, status: 'approved', techStack: ['Go', 'ElasticSearch'], createdAt: new Date('2026-03-14') },
        { id: 'dp7', title: 'AR Campus Navigation', author: { name: 'Gwen Stacy' }, status: 'approved', techStack: ['Swift', 'Unity'], createdAt: new Date('2026-03-15') },
        { id: 'dp8', title: 'Sustainable Energy Grid', author: { name: 'Hank Pym' }, status: 'pending', techStack: ['Python', 'Pandas'], createdAt: new Date('2026-03-16') },
        { id: 'dp9', title: 'Medical Image Classifier', author: { name: 'Iris West' }, status: 'rejected', techStack: ['TensorFlow', 'Keras'], createdAt: new Date('2026-03-17') },
        { id: 'dp10', title: 'Multilingual Translator', author: { name: 'James Gordon' }, status: 'approved', techStack: ['TypeScript', 'OpenAI'], createdAt: new Date('2026-03-18') },
        { id: 'dp11', title: 'Gesture Control Interface', author: { name: 'Kara Danvers' }, status: 'pending', techStack: ['Python', 'OpenCV'], createdAt: new Date('2026-03-19') },
        { id: 'dp12', title: 'Real-time Traffic Monitor', author: { name: 'Lex Luthor' }, status: 'approved', techStack: ['Node.js', 'Socket.io'], createdAt: new Date('2026-03-20') },
    ];

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const res = await projectsAPI.getAll({ limit: 100 });
                if (user?.isDemoUser) {
                    // Combine real projects with demo ones for a "full" look
                    const realProjects = res?.data?.projects || [];
                    const combined = [...realProjects];
                    
                    // Only add demo projects if they don't overlap by title
                    demoProjects.forEach(dp => {
                        if (!combined.some(p => p.title === dp.title)) {
                            combined.push(dp);
                        }
                    });
                    setProjects(combined);
                } else if (res?.data?.projects) {
                    setProjects(res.data.projects);
                } else {
                    toast.error("No projects found in repository");
                }
            } catch (error) {
                console.error("Failed to fetch projects:", error);
                if (user?.isDemoUser) {
                    setProjects(demoProjects);
                } else {
                    toast.error("Could not reach backend server");
                }
            } finally {
                setIsLoading(false);
            }
        };
        fetchProjects();
    }, []);

    const filteredProjects = useMemo(() => {
        return projects.filter(p => {
            const matchSearch = !searchTerm ||
                p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (p.author?.name || "Member").toLowerCase().includes(searchTerm.toLowerCase()) ||
                (p.ownerId || "").toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === "all" || p.status === statusFilter;
            return matchSearch && matchesStatus;
        });
    }, [projects, searchTerm, statusFilter]);

    const updateStatus = async (id, newStatus) => {
        const prevProject = projects.find(p => p.id === id);
        // Optimistic update
        setProjects(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
        
        try {
            let res;
            if (newStatus === 'approved') res = await adminAPI.approveProject(id);
            else if (newStatus === 'rejected') res = await adminAPI.rejectProject(id);
            else res = await adminAPI.resetProject(id);

            if (res.data?.success || res === true) {
                toast.success(`Project ${newStatus}`);
            }
        } catch (error) {
            console.error("Failed to update status:", error);
            // Rollback on failure
            setProjects(prev => prev.map(p => p.id === id ? { ...p, status: prevProject.status } : p));
            toast.error(error.response?.data?.message || "Failed to update project status");
        }
    };

    const deleteProject = async (id) => {
        const project = projects.find(p => p.id === id);
        // Optimistic delete
        setProjects(prev => prev.filter(p => p.id !== id));
        
        try {
            const res = await projectsAPI.delete(id);
            if (res.data?.success || res === true) {
                toast.success(`"${project?.title || id}" archived`);
            }
        } catch (error) {
            console.error("Failed to delete project:", error);
            // Rollback on failure
            setProjects(prev => [...prev, project]);
            toast.error(error.response?.data?.message || "Failed to archive project");
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight uppercase italic text-white underline decoration-amber-500 decoration-4 underline-offset-8">Global Repository</h1>
                    <p className="text-muted-foreground mt-1">Management console for all submitted projects.</p>
                </div>
                <Button asChild className="bg-amber-500 hover:bg-amber-600 rounded-xl font-bold px-6 shadow-lg shadow-amber-500/20 text-white">
                    <Link to="/admin/pre-add" className="flex items-center gap-2">
                        <FolderPlus className="h-4 w-4" /> ADD PROJECT
                    </Link>
                </Button>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Filter projects by title or author..." 
                        value={searchTerm} 
                        onChange={e => setSearchTerm(e.target.value)} 
                        className="pl-10 rounded-xl border-border/50 bg-muted/20" 
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-48 rounded-xl border-border/50 bg-muted/20 font-bold uppercase text-[10px]">
                        <Filter className="h-3.5 w-3.5 mr-2 opacity-50" />
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-border/50">
                        <SelectItem value="all">ALL ENTRIES</SelectItem>
                        <SelectItem value="approved">APPROVED</SelectItem>
                        <SelectItem value="pending">PENDING</SelectItem>
                        <SelectItem value="rejected">REJECTED</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-3 gap-4">
                {["approved", "pending", "rejected"].map(s => {
                    const cfg = STATUS_CONFIG[s];
                    const count = projects.filter(p => p.status === s).length;
                    return (
                        <div key={s} onClick={() => setStatusFilter(s === statusFilter ? "all" : s)}
                            className={`p-4 rounded-2xl border cursor-pointer transition-all ${statusFilter === s ? cfg.bg : 'bg-white/5 border-border/50 hover:bg-white/10'}`}>
                            <p className={`text-2xl font-black ${statusFilter === s ? cfg.color : 'text-white'}`}>{count}</p>
                            <p className={`text-[9px] font-black uppercase tracking-widest mt-1 ${statusFilter === s ? cfg.color : 'text-muted-foreground'}`}>{s}</p>
                        </div>
                    );
                })}
            </div>

            {/* Table */}
            <div className="rounded-2xl border border-border/50 bg-card/20 backdrop-blur-sm shadow-xl overflow-x-auto">
                {isLoading ? (
                    <div className="text-center py-20">
                        <Loader size={0.8} className="mx-auto mb-3" />
                        <p className="font-bold text-muted-foreground italic">Loading projects...</p>
                    </div>
                ) : filteredProjects.length === 0 ? (
                    <div className="text-center py-20">
                        <FolderGit2 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                        <p className="font-bold text-muted-foreground italic">No projects match your search</p>
                        <Button variant="link" onClick={() => { setSearchTerm(""); setStatusFilter("all"); }} className="text-acm-blue font-bold mt-2">
                            <RotateCcw className="h-3.5 w-3.5 mr-2" /> Clear filters
                        </Button>
                    </div>
                ) : (
                    <Table>
                        <TableHeader className="bg-white/5 uppercase tracking-tighter italic">
                            <TableRow className="border-border/50">
                                <TableHead className="font-black text-xs">Project</TableHead>
                                <TableHead className="font-black text-xs">Author</TableHead>
                                <TableHead className="font-black text-xs">Status</TableHead>
                                <TableHead className="font-black text-xs">Date</TableHead>
                                <TableHead className="text-right font-black text-xs">Operations</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredProjects.map(project => {
                                const cfg = STATUS_CONFIG[project.status] || STATUS_CONFIG.pending;
                                const StatusIcon = cfg.icon;
                                return (
                                    <TableRow key={project.id} className="hover:bg-white/5 border-border/50 group">
                                        <TableCell className="font-bold">
                                            <p className="text-white group-hover:text-acm-blue transition-colors">{project.title}</p>
                                            <p className="text-[10px] text-muted-foreground line-clamp-1">{project.techStack?.join(", ")}</p>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded bg-muted flex items-center justify-center text-[10px] font-black">{(project.author?.name || "M").charAt(0)}</div>
                                                <span className="text-xs font-semibold">{project.author?.name || "Member"}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={`flex items-center gap-1.5 border rounded-lg font-black text-[9px] uppercase py-1 w-fit ${cfg.bg} ${cfg.color}`}>
                                                <StatusIcon className="h-3 w-3" />{cfg.label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {project.createdAt?.seconds
                                                ? new Date(project.createdAt.seconds * 1000).toLocaleDateString()
                                                : project.createdAt ? new Date(project.createdAt).toLocaleDateString() : "—"}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <Button asChild size="icon" variant="ghost" className="h-8 w-8 text-acm-blue hover:bg-acm-blue/10 rounded-lg" title="View Project">
                                                    <Link to={`/admin/projects/${project.id}`}>
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                {project.status !== 'approved' && (
                                                    <Button onClick={() => updateStatus(project.id, 'approved')} size="icon" variant="ghost" className="h-8 w-8 text-emerald-500 hover:bg-emerald-500/10 rounded-lg" title="Approve">
                                                        <CheckCircle2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                {project.status !== 'rejected' && (
                                                    <Button onClick={() => updateStatus(project.id, 'rejected')} size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:bg-red-500/10 rounded-lg" title="Reject">
                                                        <XCircle className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                {project.status !== 'pending' && (
                                                    <Button onClick={() => updateStatus(project.id, 'pending')} size="icon" variant="ghost" className="h-8 w-8 text-amber-500 hover:bg-amber-500/10 rounded-lg" title="Reset to Pending">
                                                        <Clock className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-500 hover:bg-red-500/10 hover:text-red-500 rounded-lg" title="Delete">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent className="rounded-2xl bg-card/95 border-border/50 backdrop-blur shadow-2xl">
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle className="font-black uppercase italic">Confirm Deletion</AlertDialogTitle>
                                                            <AlertDialogDescription>Remove <strong>{project.title}</strong> permenantly? This action cannot be undone.</AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => deleteProject(project.id)} className="bg-red-500 hover:bg-red-600 rounded-xl font-bold">Delete</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                )}
            </div>
        </div>
    );
}
