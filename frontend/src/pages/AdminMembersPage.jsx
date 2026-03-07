import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminAPI } from "@/services/api";
import { Link } from "react-router-dom";
import {
    Users,
    Search,
    MoreVertical,
    Shield,
    ShieldCheck,
    UserMinus,
    Edit,
    Loader2,
    Calendar,
    GraduationCap,
    ExternalLink
} from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

export default function AdminMembersPage() {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState("");

    const { data: usersData, isLoading } = useQuery({
        queryKey: ["admin-users"],
        queryFn: () => adminAPI.getUsers({ limit: 100 }),
    });

    const updateUserMutation = useMutation({
        mutationFn: ({ uid, data }) => adminAPI.updateUser(uid, data),
        onSuccess: () => {
            queryClient.invalidateQueries(["admin-users"]);
            toast.success("Member updated successfully");
        },
        onError: () => toast.error("Failed to update member"),
    });

    const members = usersData?.data?.users || [];
    const filteredMembers = members.filter(m =>
        m.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handlePromote = (member) => {
        const newRole = member.role === 'admin' ? 'member' : 'admin';
        updateUserMutation.mutate({ uid: member.uid, data: { role: newRole } });
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight uppercase italic">Member Directory</h1>
                    <p className="text-muted-foreground">Manage chapter members, their roles, and graduation years.</p>
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
                    <div className="flex h-64 items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-acm-blue" />
                    </div>
                ) : (
                    <Table>
                        <TableHeader className="bg-muted/30">
                            <TableRow className="hover:bg-transparent border-border/50">
                                <TableHead className="w-[300px] font-bold uppercase tracking-wider text-[10px]">Member</TableHead>
                                <TableHead className="font-bold uppercase tracking-wider text-[10px]">Graduation/Year</TableHead>
                                <TableHead className="font-bold uppercase tracking-wider text-[10px]">Role</TableHead>
                                <TableHead className="font-bold uppercase tracking-wider text-[10px]">Status</TableHead>
                                <TableHead className="text-right font-bold uppercase tracking-wider text-[10px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredMembers.map((member) => (
                                <TableRow key={member.uid} className="hover:bg-white/5 border-border/50 transition-colors">
                                    <TableCell>
                                        <Link to={`/admin/members/${member.uid}`} className="flex items-center gap-3 group/member hover:opacity-80 transition-opacity">
                                            <Avatar className="h-9 w-9 rounded-lg border border-border/50 group-hover/member:border-acm-blue/50 transition-colors">
                                                <AvatarImage src={member.photoURL} />
                                                <AvatarFallback className="bg-acm-blue/10 text-acm-blue font-bold text-xs uppercase italic">
                                                    {(member.name || member.email || "?").charAt(0)}
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
                                            <span>{member.graduationYear || member.year || "Not Set"}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={`font-bold tracking-widest text-[9px] uppercase italic ${member.role === 'admin'
                                            ? "border-amber-500/30 text-amber-500 bg-amber-500/5"
                                            : "border-acm-blue/30 text-acm-blue bg-acm-blue/5"
                                            }`}>
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
                                            <DropdownMenuContent align="end" className="w-48 rounded-xl border-border/50 bg-card/80 backdrop-blur-xl">
                                                <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Management</DropdownMenuLabel>
                                                <DropdownMenuItem asChild className="gap-2 focus:bg-acm-blue/10 focus:text-acm-blue cursor-pointer font-bold text-xs py-2.5">
                                                    <Link to={`/admin/members/${member.uid}`} className="flex items-center">
                                                        <ExternalLink className="h-3.5 w-3.5 mr-2" /> View Full Profile
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handlePromote(member)}
                                                    className="gap-2 focus:bg-amber-500/10 focus:text-amber-500 cursor-pointer font-bold text-xs py-2.5"
                                                >
                                                    {member.role === 'admin' ? <Shield className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                                                    {member.role === 'admin' ? "Demote to Member" : "Promote to Admin"}
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator className="bg-border/50" />
                                                <DropdownMenuItem className="gap-2 focus:bg-red-500/10 focus:text-red-500 cursor-pointer text-red-500 font-bold text-xs py-2.5">
                                                    <UserMinus className="h-3.5 w-3.5" /> {member.disabled ? "Activate" : "Suspend"} Member
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
