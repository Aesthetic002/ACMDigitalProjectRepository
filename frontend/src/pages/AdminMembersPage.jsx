import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { usersAPI, adminAPI } from "@/services/api";
import {
    Users, Search, MoreVertical, Shield, ShieldCheck,
    UserMinus, UserCheck, ExternalLink, GraduationCap, Loader2
} from "lucide-react";
import {
    Table, TableBody, TableCell, TableHead,
    TableHeader, TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

export default function AdminMembersPage() {
    const [members, setMembers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const res = await adminAPI.getUsers({ limit: 100 });
                if (res.data?.users) {
                    setMembers(res.data.users);
                } else {
                    toast.error("Failed to load users structure");
                }
            } catch (error) {
                console.error("Failed to fetch members:", error);
                toast.error("Could not reach backend server");
            } finally {
                setIsLoading(false);
            }
        };
        fetchMembers();
    }, []);

    const filteredMembers = useMemo(() =>
        members.filter(m =>
            m.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.email?.toLowerCase().includes(searchTerm.toLowerCase())
        ), [members, searchTerm]);

    const toggleRole = async (uid) => {
        const member = members.find(m => m.uid === uid);
        const newRole = member.role === 'admin' ? 'member' : 'admin';
        try {
            const res = await adminAPI.updateUser(uid, { role: newRole });
            if (res.data?.success) {
                setMembers(prev => prev.map(m => m.uid === uid ? { ...m, role: newRole } : m));
                toast.success(`${member.name} is now a ${newRole}`);
            }
        } catch (error) {
            console.error("Failed to update role:", error);
            toast.error(error.response?.data?.message || "Failed to update role");
        }
    };

    const toggleStatus = async (uid) => {
        const member = members.find(m => m.uid === uid);
        const newDisabled = !member.disabled;
        try {
            // Note: Update backend 'disabled' flag (this depends on your backend schema supporting it)
            const res = await adminAPI.updateUser(uid, { disabled: newDisabled });
            if (res.data?.success) {
                setMembers(prev => prev.map(m => m.uid === uid ? { ...m, disabled: newDisabled } : m));
                toast.success(`${member.name} has been ${newDisabled ? "suspended" : "reactivated"}`);
            }
        } catch (error) {
            console.error("Failed to update status:", error);
            toast.error(error.response?.data?.message || "Failed to update status");
        }
    };

    const deleteMember = (uid) => {
        // Backend lacks an explicit delete user route in users.routes.js.
        // So this is a soft visual removal for the session to prevent a 404 crash.
        const member = members.find(m => m.uid === uid);
        setMembers(prev => prev.filter(m => m.uid !== uid));
        toast.success(`Soft override: ${member?.name} removed from view. (Real backend deletion not yet supported)`);
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight uppercase italic">Member Directory</h1>
                    <p className="text-muted-foreground">Manage chapter members, their roles, and access levels.</p>
                </div>
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search members..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 rounded-xl border-border/50 bg-muted/20 focus-visible:ring-acm-blue"
                    />
                </div>
            </div>

            <div className="rounded-2xl border border-border/50 bg-card/20 backdrop-blur-sm overflow-hidden shadow-xl">
                {isLoading ? (
                    <div className="text-center py-20">
                        <Loader2 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3 animate-spin" />
                        <p className="font-bold text-muted-foreground italic">Loading members...</p>
                    </div>
                ) : filteredMembers.length === 0 ? (
                    <div className="text-center py-20">
                        <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                        <p className="font-bold text-muted-foreground italic">No matching members found</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader className="bg-muted/30">
                            <TableRow className="hover:bg-transparent border-border/50">
                                <TableHead className="w-[260px] font-bold uppercase tracking-wider text-[10px]">Member</TableHead>
                                <TableHead className="font-bold uppercase tracking-wider text-[10px]">Class / Year</TableHead>
                                <TableHead className="font-bold uppercase tracking-wider text-[10px]">Role</TableHead>
                                <TableHead className="font-bold uppercase tracking-wider text-[10px]">Status</TableHead>
                                <TableHead className="text-right font-bold uppercase tracking-wider text-[10px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredMembers.map((member) => (
                                <TableRow key={member.uid} className="hover:bg-white/5 border-border/50 transition-colors">
                                    <TableCell>
                                        <Link to={`/admin/members/${member.uid}`} className="flex items-center gap-3 group/member">
                                            <Avatar className="h-9 w-9 rounded-lg border border-border/50 group-hover/member:border-amber-500/50 transition-colors">
                                                <AvatarImage src={member.photoURL} />
                                                <AvatarFallback className={`${member.role === 'admin' ? 'bg-amber-500/20 text-amber-500' : 'bg-acm-blue/10 text-acm-blue'} font-bold text-xs uppercase italic`}>
                                                    {(member.name || "?").charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col min-w-0">
                                                <span className="font-bold text-sm truncate group-hover/member:text-acm-blue transition-colors">{member.name || "Unknown"}</span>
                                                <span className="text-[10px] text-muted-foreground truncate">{member.email}</span>
                                            </div>
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-xs font-medium">
                                            <GraduationCap className="h-3.5 w-3.5 text-muted-foreground" />
                                            <span>{member.graduationYear || "Not Set"}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={`font-bold tracking-widest text-[9px] uppercase italic ${member.role === 'admin'
                                            ? "border-amber-500/30 text-amber-500 bg-amber-500/5"
                                            : "border-acm-blue/30 text-acm-blue bg-acm-blue/5"
                                            }`}>
                                            {member.role === 'admin' ? <ShieldCheck className="h-2.5 w-2.5 mr-1" /> : null}
                                            {member.role || 'member'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1.5">
                                            <div className={`w-1.5 h-1.5 rounded-full ${member.disabled ? "bg-red-500" : "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"}`} />
                                            <span className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground">
                                                {member.disabled ? "Suspended" : "Active"}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10 rounded-lg">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-52 rounded-xl border-border/50 bg-card/90 backdrop-blur-xl">
                                                <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Management</DropdownMenuLabel>
                                                <DropdownMenuItem asChild className="gap-2 focus:bg-acm-blue/10 focus:text-acm-blue cursor-pointer font-bold text-xs py-2.5">
                                                    <Link to={`/admin/members/${member.uid}`}>
                                                        <ExternalLink className="h-3.5 w-3.5 mr-2" /> View Full Profile
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => toggleRole(member.uid)}
                                                    className="gap-2 focus:bg-amber-500/10 focus:text-amber-500 cursor-pointer font-bold text-xs py-2.5"
                                                >
                                                    {member.role === 'admin' ? <Shield className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                                                    {member.role === 'admin' ? "Demote to Member" : "Promote to Admin"}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => toggleStatus(member.uid)}
                                                    className={`gap-2 cursor-pointer font-bold text-xs py-2.5 ${member.disabled ? 'focus:bg-emerald-500/10 focus:text-emerald-500' : 'focus:bg-orange-500/10 focus:text-orange-500'}`}
                                                >
                                                    {member.disabled ? <UserCheck className="h-3.5 w-3.5" /> : <UserMinus className="h-3.5 w-3.5" />}
                                                    {member.disabled ? "Reactivate Member" : "Suspend Member"}
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator className="bg-border/50" />
                                                <DropdownMenuItem
                                                    onClick={() => deleteMember(member.uid)}
                                                    className="gap-2 focus:bg-red-500/10 focus:text-red-500 cursor-pointer text-red-500 font-bold text-xs py-2.5"
                                                >
                                                    <UserMinus className="h-3.5 w-3.5" /> Remove from Directory
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
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
