import { useState, useMemo } from "react";
import { MOCK_PROJECTS } from "@/services/mockData";
import { Link } from "react-router-dom";
import {
    FolderPlus, Search, ExternalLink, Trash2,
    CheckCircle2, XCircle, Clock, FolderGit2,
    RotateCcw, Filter
} from "lucide-react";
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
    const [projects, setProjects] = useState(MOCK_PROJECTS);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const filteredProjects = useMemo(() => {
        return projects.filter(p => {
            const matchesSearch = !searchTerm ||
                p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.author?.name?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === "all" || p.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [projects, searchTerm, statusFilter]);

    const updateStatus = (id, newStatus) => {
        setProjects(prev => prev.map(p => {
            if (p.id !== id) return p;
            toast.success(`Project ${newStatus}`);
            return { ...p, status: newStatus };
        }));
    };

    const deleteProject = (id) => {
        const project = projects.find(p => p.id === id);
        setProjects(prev => prev.filter(p => p.id !== id));
        toast.success(`"${project?.title}" permanently removed`);
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight uppercase italic text-white underline decoration-amber-500 decoration-4 underline-offset-8">Global Repository</h1>
                    <p className="text-muted-foreground mt-1">Oversee all community contributions and project lifecycles.</p>
                </div>
                <Button asChild className="bg-amber-500 hover:bg-amber-600 rounded-xl font-bold tracking-tight px-6 transition-all shadow-lg shadow-amber-500/20 text-white">
                    <Link to="/admin/pre-add" className="flex items-center gap-2">
                        <FolderPlus className="h-4 w-4" /> ADD PROJECT
                    </Link>
                </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Filter by project title or author..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 rounded-xl border-border/50 bg-muted/20"
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-48 rounded-xl border-border/50 bg-muted/20 font-bold uppercase tracking-widest text-[10px]">
                        <Filter className="h-3.5 w-3.5 mr-2 opacity-50" />
                        <SelectValue placeholder="Status Filter" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-border/50">
                        <SelectItem value="all">ALL ENTRIES</SelectItem>
                        <SelectItem value="approved">APPROVED</SelectItem>
                        <SelectItem value="pending">PENDING</SelectItem>
                        <SelectItem value="rejected">REJECTED</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Stats Row */}
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
            <div className="rounded-2xl border border-border/50 bg-card/20 backdrop-blur-sm overflow-hidden overflow-x-auto shadow-xl">
                {filteredProjects.length === 0 ? (
                    <div className="text-center py-20">
                        <FolderGit2 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                        <p className="font-bold text-muted-foreground italic">No projects match your filter</p>
                        <Button variant="link" onClick={() => { setSearchTerm(""); setStatusFilter("all"); }} className="text-acm-blue font-bold mt-2">
                            <RotateCcw className="h-3.5 w-3.5 mr-2" /> Clear filters
                        </Button>
                    </div>
                ) : (
                    <Table>
                        <TableHeader className="bg-white/5 uppercase tracking-tighter italic">
                            <TableRow className="border-border/50">
                                <TableHead className="font-black text-xs">Project Title</TableHead>
                                <TableHead className="font-black text-xs">Lead Developer</TableHead>
                                <TableHead className="font-black text-xs">Status</TableHead>
                                <TableHead className="font-black text-xs">Date Logged</TableHead>
                                <TableHead className="text-right font-black text-xs">Operations</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredProjects.map((project) => {
                                const cfg = STATUS_CONFIG[project.status] || STATUS_CONFIG.pending;
                                const StatusIcon = cfg.icon;
                                return (
                                    <TableRow key={project.id} className="hover:bg-white/5 border-border/50 transition-colors group">
                                        <TableCell className="font-bold">
                                            <div className="flex flex-col">
                                                <span className="text-white group-hover:text-acm-blue transition-colors">{project.title}</span>
                                                <span className="text-[10px] text-muted-foreground font-medium">{project.techStack?.join(", ")}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded bg-muted flex items-center justify-center text-[10px] font-black uppercase">
                                                    {project.author?.name?.charAt(0)}
                                                </div>
                                                <span className="text-xs font-semibold">{project.author?.name || "Member"}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={`flex items-center gap-1.5 border rounded-lg font-black text-[9px] uppercase tracking-wider py-1 w-fit ${cfg.bg} ${cfg.color}`}>
                                                <StatusIcon className="h-3 w-3" />
                                                {cfg.label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {new Date(project.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                {project.status !== 'approved' && (
                                                    <Button onClick={() => updateStatus(project.id, 'approved')}
                                                        size="icon" variant="ghost"
                                                        className="h-8 w-8 text-emerald-500 hover:bg-emerald-500/10 rounded-lg"
                                                        title="Approve">
                                                        <CheckCircle2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                {project.status !== 'rejected' && (
                                                    <Button onClick={() => updateStatus(project.id, 'rejected')}
                                                        size="icon" variant="ghost"
                                                        className="h-8 w-8 text-red-500 hover:bg-red-500/10 rounded-lg"
                                                        title="Reject">
                                                        <XCircle className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                {project.status !== 'pending' && (
                                                    <Button onClick={() => updateStatus(project.id, 'pending')}
                                                        size="icon" variant="ghost"
                                                        className="h-8 w-8 text-amber-500 hover:bg-amber-500/10 rounded-lg"
                                                        title="Reset to Pending">
                                                        <Clock className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button size="icon" variant="ghost"
                                                            className="h-8 w-8 text-slate-500 hover:bg-red-500/10 hover:text-red-500 rounded-lg"
                                                            title="Delete">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent className="rounded-2xl bg-card/95 border-border/50 backdrop-blur">
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle className="font-black uppercase italic">Confirm Deletion</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Remove <strong>{project.title}</strong> permanently? This action cannot be undone.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => deleteProject(project.id)} className="bg-red-500 hover:bg-red-600 rounded-xl font-bold">
                                                                Delete
                                                            </AlertDialogAction>
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
