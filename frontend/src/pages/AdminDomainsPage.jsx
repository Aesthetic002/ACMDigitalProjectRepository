import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tagsAPI } from "@/services/api";
import {
    Layers,
    Plus,
    Trash2,
    Edit3,
    Search,
    Loader2,
    Hash,
    MoreHorizontal
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
import { toast } from "sonner";

export default function AdminDomainsPage() {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState("");
    const [newTagName, setNewTagName] = useState("");

    const { data: tagsData, isLoading } = useQuery({
        queryKey: ["admin-tags"],
        queryFn: () => tagsAPI.getAll(),
    });

    const createTagMutation = useMutation({
        mutationFn: (name) => tagsAPI.create({ name }),
        onSuccess: () => {
            queryClient.invalidateQueries(["admin-tags"]);
            setNewTagName("");
            toast.success("Technical domain added");
        },
        onError: () => toast.error("Failed to add domain"),
    });

    const tags = tagsData?.data?.tags || [];
    const filteredTags = tags.filter(t =>
        t.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAddTag = (e) => {
        e.preventDefault();
        if (!newTagName.trim()) return;
        createTagMutation.mutate(newTagName.trim());
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight uppercase italic text-white underline decoration-acm-blue decoration-4 underline-offset-8">Domain Taxonomy</h1>
                    <p className="text-muted-foreground mt-2">Classify and manage technical specializations and technology tags.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Add New Domain */}
                <div className="lg:col-span-1">
                    <div className="p-6 rounded-2xl border border-border/50 bg-card/20 backdrop-blur-md shadow-xl">
                        <h2 className="text-lg font-black uppercase italic mb-6 flex items-center gap-2">
                            <Plus className="h-5 w-5 text-acm-blue" /> Register Domain
                        </h2>
                        <form onSubmit={handleAddTag} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Domain Name</label>
                                <Input
                                    placeholder="e.g. Artificial Intelligence"
                                    value={newTagName}
                                    onChange={(e) => setNewTagName(e.target.value)}
                                    className="rounded-xl border-border/50 bg-black/20 focus-visible:ring-acm-blue"
                                />
                            </div>
                            <Button
                                type="submit"
                                disabled={createTagMutation.isPending}
                                className="w-full bg-acm-blue hover:bg-acm-blue/90 rounded-xl font-black tracking-widest uppercase transition-all shadow-lg shadow-acm-blue/20 h-11"
                            >
                                {createTagMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "AUTHENTICATE TAG"}
                            </Button>
                        </form>
                    </div>
                </div>

                {/* Domains List */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Find specific domain..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 rounded-xl border-border/50 bg-muted/20"
                        />
                    </div>

                    <div className="rounded-2xl border border-border/50 bg-card/20 backdrop-blur-sm overflow-hidden shadow-xl">
                        {isLoading ? (
                            <div className="flex h-64 items-center justify-center">
                                <Loader2 className="h-8 w-8 animate-spin text-acm-blue" />
                            </div>
                        ) : (
                            <Table>
                                <TableHeader className="bg-white/5 uppercase tracking-tighter italic">
                                    <TableRow className="border-border/50">
                                        <TableHead className="font-black text-xs">Technical Identifier</TableHead>
                                        <TableHead className="font-black text-xs">Usage Count</TableHead>
                                        <TableHead className="text-right font-black text-xs">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredTags.map((tag) => (
                                        <TableRow key={tag.id} className="hover:bg-white/5 border-border/50 transition-colors group">
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-acm-blue/10 flex items-center justify-center">
                                                        <Hash className="h-4 w-4 text-acm-blue" />
                                                    </div>
                                                    <span className="font-bold text-white group-hover:text-acm-blue transition-colors">{tag.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="border-border/50 rounded-lg bg-black/20 font-black text-[10px] py-0.5">
                                                    {tag.projectCount || 0} Projects
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-500 hover:bg-white/10 rounded-lg">
                                                        <Edit3 className="h-4 w-4" />
                                                    </Button>
                                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-500 hover:bg-red-500/10 hover:text-red-500 rounded-lg">
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
            </div>
        </div>
    );
}
