import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projectsAPI, adminAPI } from "@/services/api";
import {
    FolderPlus,
    Search,
    Filter,
    ExternalLink,
    Edit2,
    Trash2,
    CheckCircle2,
    XCircle,
    Loader2,
    Clock
} from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Link } from "react-router-dom";

export default function AdminProjectsPage() {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const { data: projectsData, isLoading } = useQuery({
        queryKey: ["admin-projects", statusFilter],
        queryFn: () => projectsAPI.getAll({
            status: statusFilter === "all" ? undefined : statusFilter,
            limit: 100
        }),
    });

    const approveMutation = useMutation({
        mutationFn: (id) => adminAPI.approveProject(id),
        onSuccess: () => {
            queryClient.invalidateQueries(["admin-projects"]);
            toast.success("Project approved");
        },
    });

    const rejectMutation = useMutation({
        mutationFn: (id) => adminAPI.rejectProject(id),
        onSuccess: () => {
            queryClient.invalidateQueries(["admin-projects"]);
            toast.success("Project rejected");
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => projectsAPI.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries(["admin-projects"]);
            toast.success("Project permanently removed");
        },
    });

    const projects = projectsData?.data?.projects || [];
    const filteredProjects = projects.filter(p =>
        p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.author?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusIcon = (status) => {
        switch (status) {
            case 'approved': return <CheckCircle2 className="h-3 w-3 text-emerald-500" />;
            case 'pending': return <Clock className="h-3 w-3 text-amber-500" />;
            case 'rejected': return <XCircle className="h-3 w-3 text-red-500" />;
            default: return null;
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight uppercase italic text-white underline decoration-acm-blue decoration-4 underline-offset-8">Global Repository</h1>
                    <p className="text-muted-foreground mt-2">Oversee all community contributions and project lifecycles.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button asChild className="bg-acm-blue hover:bg-acm-blue/90 rounded-xl font-bold tracking-tight px-6 transition-all shadow-lg shadow-acm-blue/20">
                        <Link to="/admin/pre-add" className="flex items-center gap-2">
                            <FolderPlus className="h-4 w-4" /> NEW OVERRIDE
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center mb-6">
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

            <div className="rounded-2xl border border-border/50 bg-card/20 backdrop-blur-sm overflow-hidden overflow-x-auto shadow-xl">
                {isLoading ? (
                    <div className="flex h-64 items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-acm-blue" />
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
                            {filteredProjects.map((project) => (
                                <TableRow key={project.id} className="hover:bg-white/5 border-border/50 transition-colors group">
                                    <TableCell className="font-bold">
                                        <div className="flex flex-col">
                                            <span className="text-white group-hover:text-acm-blue transition-colors">{project.title}</span>
                                            <span className="text-[10px] text-muted-foreground font-medium">{project.techStack?.join(", ")}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded bg-muted flex items-center justify-center text-[10px] font-black">{project.author?.name?.charAt(0)}</div>
                                            <span className="text-xs font-semibold">{project.author?.name || "Member"}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="flex items-center gap-1.5 border-border/50 rounded-lg bg-black/20 font-black text-[9px] uppercase tracking-wider py-1">
                                            {getStatusIcon(project.status)}
                                            {project.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground">
                                        {new Date(project.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1.5">
                                            {project.status === 'pending' && (
                                                <>
                                                    <Button onClick={() => approveMutation.mutate(project.id)} size="icon" variant="ghost" className="h-8 w-8 text-emerald-500 hover:bg-emerald-500/10 rounded-lg">
                                                        <CheckCircle2 className="h-4 w-4" />
                                                    </Button>
                                                    <Button onClick={() => rejectMutation.mutate(project.id)} size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:bg-red-500/10 rounded-lg">
                                                        <XCircle className="h-4 w-4" />
                                                    </Button>
                                                </>
                                            )}
                                            <Button asChild size="icon" variant="ghost" className="h-8 w-8 text-acm-blue hover:bg-acm-blue/10 rounded-lg">
                                                <Link to={`/projects/${project.id}`}><ExternalLink className="h-4 w-4" /></Link>
                                            </Button>
                                            <Button onClick={() => deleteMutation.mutate(project.id)} size="icon" variant="ghost" className="h-8 w-8 text-slate-500 hover:bg-red-500/10 hover:text-red-500 rounded-lg">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>
        </div>
    );
}
