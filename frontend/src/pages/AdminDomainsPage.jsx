import { useState, useMemo } from "react";
import { MOCK_TAGS } from "@/services/mockData";
import {
    Plus, Trash2, Edit3, Search, Hash, Layers, Check, X
} from "lucide-react";
import {
    Table, TableBody, TableCell, TableHead,
    TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

let nextId = 100;

export default function AdminDomainsPage() {
    const [tags, setTags] = useState(MOCK_TAGS);
    const [searchTerm, setSearchTerm] = useState("");
    const [newTagName, setNewTagName] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [editValue, setEditValue] = useState("");

    const filteredTags = useMemo(() =>
        tags.filter(t => t.name?.toLowerCase().includes(searchTerm.toLowerCase())),
        [tags, searchTerm]);

    const addTag = (e) => {
        e.preventDefault();
        const name = newTagName.trim();
        if (!name) return;
        if (tags.some(t => t.name.toLowerCase() === name.toLowerCase())) {
            toast.error("Domain already exists");
            return;
        }
        setTags(prev => [...prev, { id: `tag${nextId++}`, name, projectCount: 0 }]);
        setNewTagName("");
        toast.success(`Domain "${name}" registered`);
    };

    const startEdit = (tag) => {
        setEditingId(tag.id);
        setEditValue(tag.name);
    };

    const saveEdit = (id) => {
        const name = editValue.trim();
        if (!name) return;
        setTags(prev => prev.map(t => t.id === id ? { ...t, name } : t));
        setEditingId(null);
        toast.success("Domain updated");
    };

    const cancelEdit = () => setEditingId(null);

    const deleteTag = (id) => {
        const tag = tags.find(t => t.id === id);
        setTags(prev => prev.filter(t => t.id !== id));
        toast.success(`Domain "${tag?.name}" removed`);
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-black tracking-tight uppercase italic text-white underline decoration-amber-500 decoration-4 underline-offset-8">Domain Taxonomy</h1>
                <p className="text-muted-foreground mt-1">Classify and manage technical specializations and technology tags.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Add New Domain */}
                <div className="lg:col-span-1">
                    <div className="p-6 rounded-2xl border border-amber-500/20 bg-amber-500/5 backdrop-blur-md shadow-xl">
                        <h2 className="text-lg font-black uppercase italic mb-6 flex items-center gap-2 text-amber-400">
                            <Plus className="h-5 w-5" /> Register Domain
                        </h2>
                        <form onSubmit={addTag} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Domain Name</label>
                                <Input
                                    placeholder="e.g. Artificial Intelligence"
                                    value={newTagName}
                                    onChange={(e) => setNewTagName(e.target.value)}
                                    className="rounded-xl border-border/50 bg-black/20 focus-visible:ring-amber-500"
                                />
                            </div>
                            <Button
                                type="submit"
                                disabled={!newTagName.trim()}
                                className="w-full bg-amber-500 hover:bg-amber-600 rounded-xl font-black tracking-widest uppercase transition-all shadow-lg shadow-amber-500/20 h-11 text-white"
                            >
                                ADD DOMAIN
                            </Button>
                        </form>
                    </div>

                    {/* Summary Widget */}
                    <div className="mt-4 p-5 rounded-2xl border border-border/50 bg-card/30 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-acm-blue/10 flex items-center justify-center">
                            <Layers className="h-6 w-6 text-acm-blue" />
                        </div>
                        <div>
                            <p className="text-3xl font-black text-white">{tags.length}</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Domains</p>
                        </div>
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
                        {filteredTags.length === 0 ? (
                            <div className="text-center py-16">
                                <Hash className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                                <p className="font-bold text-muted-foreground italic text-sm">No domains found</p>
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
                                                {editingId === tag.id ? (
                                                    <div className="flex items-center gap-2">
                                                        <Input
                                                            value={editValue}
                                                            onChange={(e) => setEditValue(e.target.value)}
                                                            className="h-8 rounded-lg border-amber-500/50 bg-black/30 text-sm focus-visible:ring-amber-500"
                                                            autoFocus
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') saveEdit(tag.id);
                                                                if (e.key === 'Escape') cancelEdit();
                                                            }}
                                                        />
                                                        <Button size="icon" variant="ghost" onClick={() => saveEdit(tag.id)} className="h-7 w-7 text-emerald-500 hover:bg-emerald-500/10 rounded-lg">
                                                            <Check className="h-4 w-4" />
                                                        </Button>
                                                        <Button size="icon" variant="ghost" onClick={cancelEdit} className="h-7 w-7 text-red-500 hover:bg-red-500/10 rounded-lg">
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-acm-blue/10 flex items-center justify-center">
                                                            <Hash className="h-4 w-4 text-acm-blue" />
                                                        </div>
                                                        <span className="font-bold text-white group-hover:text-acm-blue transition-colors">{tag.name}</span>
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="border-border/50 rounded-lg bg-black/20 font-black text-[10px] py-0.5">
                                                    {tag.projectCount} Projects
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {editingId !== tag.id && (
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <Button size="icon" variant="ghost"
                                                            onClick={() => startEdit(tag)}
                                                            className="h-8 w-8 text-slate-500 hover:bg-amber-500/10 hover:text-amber-500 rounded-lg"
                                                            title="Edit domain name">
                                                            <Edit3 className="h-4 w-4" />
                                                        </Button>
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button size="icon" variant="ghost"
                                                                    className="h-8 w-8 text-slate-500 hover:bg-red-500/10 hover:text-red-500 rounded-lg"
                                                                    title="Delete domain">
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent className="rounded-2xl bg-card/95 border-border/50 backdrop-blur">
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle className="font-black uppercase italic">Remove Domain</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        Remove domain <strong>"{tag.name}"</strong>? Projects using this tag won't be affected.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction onClick={() => deleteTag(tag.id)} className="bg-red-500 hover:bg-red-600 rounded-xl font-bold">
                                                                        Remove
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </div>
                                                )}
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
