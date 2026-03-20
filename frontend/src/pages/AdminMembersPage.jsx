import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersAPI, adminAPI, assetsAPI } from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import {
    Plus, Search, MoreVertical, Shield, ShieldCheck,
    UserMinus, UserCheck, ExternalLink, GraduationCap, Loader2,
    Mail, Lock, User, Users
} from "lucide-react";
import Loader from "@/components/common/Loader";
import {
    Table, TableBody, TableCell, TableHead,
    TableHeader, TableRow,
} from "@/components/ui/table";
import {
    Dialog, DialogContent, DialogDescription,
    DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Select, SelectContent,SelectItem,
    SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';

// Secondary Firebase app to create users without logging out the admin
const secondaryApp = initializeApp({
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
}, 'SecondaryApp');
const secondaryAuth = getAuth(secondaryApp);

export default function AdminMembersPage() {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState("");
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [newMember, setNewMember] = useState({
        name: "",
        email: "",
        password: "",
        role: "member",
        graduationYear: new Date().getFullYear().toString()
    });
    const [avatarFile, setAvatarFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    // Fetch members using react-query
    const { data: membersRes, isLoading, error } = useQuery({
        queryKey: ["admin-users"],
        queryFn: () => adminAPI.getUsers({ limit: 100 }),
    });

    const { user } = useAuthStore();
    
    const demoMembers = [
        { uid: 'demo-1', name: 'Alice Smith', email: 'alice@example.com', role: 'member', createdAt: new Date(), graduationYear: '2025', disabled: false },
        { uid: 'demo-2', name: 'Bob Johnson', email: 'bob@example.com', role: 'admin', createdAt: new Date(), graduationYear: '2024', disabled: false },
        { uid: 'demo-3', name: 'Charlie Davis', email: 'charlie@acm.org', role: 'member', createdAt: new Date(), graduationYear: '2026', disabled: false },
    ];

    const members = (membersRes?.data?.users?.length > 0) ? membersRes.data.users : (user?.isDemoUser ? demoMembers : []);

    const filteredMembers = useMemo(() =>
        members.filter(m =>
            (m.name || "Member").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (m.email || "").toLowerCase().includes(searchTerm.toLowerCase())
        ), [members, searchTerm]);

    // Mutations
    const toggleRoleMutation = useMutation({
        mutationFn: async ({ uid, newRole }) => adminAPI.updateUser(uid, { role: newRole }),
        onSuccess: (_, variables) => {
            toast.success(`Role updated successfully`);
            queryClient.invalidateQueries(["admin-users"]);
        },
        onError: (err) => toast.error(err.response?.data?.message || "Failed to update role")
    });

    const toggleStatusMutation = useMutation({
        mutationFn: async ({ uid, disabled }) => adminAPI.updateUser(uid, { disabled }),
        onSuccess: (_, variables) => {
            toast.success(`Status updated successfully`);
            queryClient.invalidateQueries(["admin-users"]);
        },
        onError: (err) => toast.error(err.response?.data?.message || "Failed to update status")
    });

    const deleteMutation = useMutation({
        mutationFn: (uid) => usersAPI.delete(uid),
        onSuccess: () => {
            toast.success("Member profile removed");
            queryClient.invalidateQueries(["admin-users"]);
        },
        onError: (err) => toast.error(err.response?.data?.message || "Failed to delete member")
    });

    const createMemberMutation = useMutation({
        mutationFn: async (data) => {
            setUploading(true);
            try {
                // 1. Create in Firebase Auth using secondary instance
                const userCredential = await createUserWithEmailAndPassword(
                    secondaryAuth,
                    data.email,
                    data.password
                );
                const { user } = userCredential;

                // 2. Update display name
                await updateProfile(user, { displayName: data.name });

                // 3. Handle Avatar Upload if provided
                let photoURL = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(data.name)}`;
                if (avatarFile) {
                    try {
                        const formData = new FormData();
                        formData.append('userId', user.uid);
                        formData.append('type', 'avatar');
                        formData.append('file', avatarFile);
                        
                        const uploadRes = await assetsAPI.uploadAsset(formData);
                        if (uploadRes.data?.url) {
                            photoURL = uploadRes.data.url;
                        }
                    } catch (uploadErr) {
                        console.error("Avatar upload failed, falling back to Dicebear:", uploadErr);
                    }
                }

                // 4. Create document in Firestore
                // We no longer suppress errors here; if the Firestore write fails, 
                // the member won't appear in the directory, so we should report it.
                await adminAPI.createUser(user.uid, {
                    uid: user.uid,
                    name: data.name,
                    email: data.email,
                    role: data.role,
                    graduationYear: data.graduationYear,
                    photoURL,
                    joinedDate: new Date().toISOString()
                });
                
                return user;
            } finally {
                setUploading(false);
            }
        },
        onSuccess: (user) => {
            toast.success(`${newMember.name} added successfully`);
            setIsAddDialogOpen(false);
            setNewMember({ name: "", email: "", password: "", role: "member", graduationYear: new Date().getFullYear().toString() });
            setAvatarFile(null);
            queryClient.invalidateQueries(["admin-users"]);
        },
        onError: (err) => {
            console.error("Failed to add member:", err);
            toast.error(err.message || "Failed to create member account");
        }
    });

    const handleAddMember = (e) => {
        e.preventDefault();
        if (!newMember.name || !newMember.email || !newMember.password) {
            return toast.error("Please fill in name, email and initial password");
        }
        createMemberMutation.mutate(newMember);
    };

    const deleteMember = (uid) => {
        const member = members.find(m => m.uid === uid);
        if (!window.confirm(`Are you sure you want to PERMANENTLY delete ${member?.name || 'this member'}? This action cannot be undone.`)) return;
        deleteMutation.mutate(uid);
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight uppercase italic text-white underline decoration-acm-blue decoration-4 underline-offset-8">Member Directory</h1>
                    <p className="text-muted-foreground mt-1">Manage global chapter members and permissions.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="rounded-xl bg-acm-blue hover:bg-acm-blue-dark shadow-acm-glow font-black uppercase italic tracking-wider gap-2">
                                <Plus className="h-4 w-4" /> Add Member
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px] rounded-[2rem] border-border/50 bg-card/90 backdrop-blur-xl">
                            <form onSubmit={handleAddMember}>
                                <DialogHeader>
                                    <DialogTitle className="text-2xl font-black uppercase italic text-white">Initialize New Member</DialogTitle>
                                    <DialogDescription className="text-slate-400 font-bold">
                                        Create a profile and authentication credentials.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-6">
                                    <div className="grid gap-2">
                                        <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Full Identification</Label>
                                        <div className="relative group">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-acm-blue transition-colors" />
                                            <Input
                                                id="name"
                                                value={newMember.name}
                                                onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                                                placeholder="e.g. Alan Turing"
                                                className="pl-10 h-11 rounded-xl border-border/50 bg-muted/20 focus-visible:ring-acm-blue"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Member Email</Label>
                                        <div className="relative group">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-acm-blue transition-colors" />
                                            <Input
                                                id="email"
                                                type="email"
                                                value={newMember.email}
                                                onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                                                placeholder="member@university.edu"
                                                className="pl-10 h-11 rounded-xl border-border/50 bg-muted/20 focus-visible:ring-acm-blue"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="pass" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Initial Security Key</Label>
                                        <div className="relative group">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-acm-blue transition-colors" />
                                            <Input
                                                id="pass"
                                                type="password"
                                                value={newMember.password}
                                                onChange={(e) => setNewMember({ ...newMember, password: e.target.value })}
                                                placeholder="Assign temporary password"
                                                className="pl-10 h-11 rounded-xl border-border/50 bg-muted/20 focus-visible:ring-acm-blue"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Assigned Role</Label>
                                            <Select 
                                                value={newMember.role} 
                                                onValueChange={(val) => setNewMember({ ...newMember, role: val })}
                                            >
                                                <SelectTrigger className="h-11 rounded-xl border-border/50 bg-muted/20">
                                                    <SelectValue placeholder="Role" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl border-border/50 bg-card/95 backdrop-blur-xl">
                                                    <SelectItem value="member" className="font-bold">MEMBER</SelectItem>
                                                    <SelectItem value="admin" className="font-bold">ADMIN</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="year" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Graduation</Label>
                                            <Input
                                                id="year"
                                                type="text"
                                                value={newMember.graduationYear}
                                                onChange={(e) => setNewMember({ ...newMember, graduationYear: e.target.value })}
                                                placeholder="2025"
                                                className="h-11 rounded-xl border-border/50 bg-muted/20 focus-visible:ring-acm-blue"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="avatar" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Profile Visual (Optional)</Label>
                                        <div className="flex items-center gap-3">
                                            <Input 
                                                id="avatar" 
                                                type="file" 
                                                accept="image/*" 
                                                onChange={(e) => setAvatarFile(e.target.files[0])}
                                                className="h-11 rounded-xl border-dashed border-2 border-border/50 bg-muted/10 py-2" 
                                            />
                                            {avatarFile && (
                                                <div className="h-11 w-11 min-w-[2.75rem] rounded-xl overflow-hidden border border-acm-blue/30 shadow-lg shadow-acm-blue/10">
                                                    <img src={URL.createObjectURL(avatarFile)} alt="Preview" className="h-full w-full object-cover" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button 
                                        type="submit" 
                                        disabled={createMemberMutation.isPending || uploading}
                                        className="w-full h-12 rounded-2xl bg-acm-blue hover:bg-acm-blue-dark shadow-acm-glow font-black uppercase italic tracking-widest text-white"
                                    >
                                        {(createMemberMutation.isPending || uploading) ? <Loader2 className="h-4 w-4 animate-spin text-white" /> : "DEPLOY MEMBER ACCOUNT"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>

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
            </div>

            <div className="rounded-2xl border border-border/50 bg-card/20 backdrop-blur-sm overflow-hidden shadow-xl">
                {isLoading ? (
                    <div className="text-center py-20">
                        <Loader size={0.8} className="mx-auto mb-3" />
                        <p className="font-bold text-muted-foreground italic">Loading members...</p>
                    </div>
                ) : filteredMembers.length === 0 ? (
                    <div className="text-center py-20">
                        <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                        <p className="font-bold text-muted-foreground italic">No members found</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader className="bg-muted/30">
                            <TableRow className="hover:bg-transparent border-border/50 uppercase tracking-tighter italic">
                                <TableHead className="w-[260px] font-black text-xs">Member</TableHead>
                                <TableHead className="font-black text-xs">Graduated</TableHead>
                                <TableHead className="font-black text-xs">Role</TableHead>
                                <TableHead className="font-black text-xs">Status</TableHead>
                                <TableHead className="text-right font-black text-xs">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredMembers.map((member) => (
                                <TableRow key={member.uid} className="hover:bg-white/5 border-border/50 transition-colors">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9 rounded-lg border border-border/50 group-hover/member:border-amber-500/50 transition-colors">
                                                <AvatarImage src={member.photoURL} />
                                                <AvatarFallback className={`${member.role === 'admin' ? 'bg-amber-500/20 text-amber-500' : 'bg-acm-blue/10 text-acm-blue'} font-bold text-xs uppercase italic`}>
                                                    {(member.name || "?").charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col min-w-0">
                                                <span className="font-bold text-sm truncate">{member.name || "Unknown"}</span>
                                                <span className="text-[10px] text-muted-foreground truncate">{member.email}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-xs font-medium">
                                            <GraduationCap className="h-3.5 w-3.5 text-muted-foreground" />
                                            <span>{member.graduationYear || member.batch || "—"}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={`font-black uppercase italic text-[9px] tracking-widest ${member.role === 'admin' ? "border-amber-500/30 text-amber-500 bg-amber-500/5" : "border-acm-blue/30 text-acm-blue bg-acm-blue/5"}`}>
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
                                            <DropdownMenuContent align="end" className="w-52 rounded-xl border-border/50 bg-card/90 backdrop-blur-xl shadow-2xl">
                                                <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Management Options</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => toggleRoleMutation.mutate({ uid: member.uid, newRole: member.role === 'admin' ? 'member' : 'admin' })} 
                                                    className="gap-2 focus:bg-amber-500/10 focus:text-amber-500 cursor-pointer font-bold text-xs py-2.5"
                                                    disabled={toggleRoleMutation.isPending}
                                                >
                                                    {member.role === 'admin' ? <Shield className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                                                    {member.role === 'admin' ? "Demote to Member" : "Promote to Admin"}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => toggleStatusMutation.mutate({ uid: member.uid, disabled: !member.disabled })} 
                                                    className={`gap-2 cursor-pointer font-bold text-xs py-2.5 ${member.disabled ? 'focus:bg-emerald-500/10 focus:text-emerald-500' : 'focus:bg-orange-500/10 focus:text-orange-500'}`}
                                                    disabled={toggleStatusMutation.isPending}
                                                >
                                                    {member.disabled ? <UserCheck className="h-3.5 w-3.5" /> : <UserMinus className="h-3.5 w-3.5" />}
                                                    {member.disabled ? "Reactivate Profile" : "Suspend Access"}
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator className="bg-border/50" />
                                                <DropdownMenuItem onClick={() => deleteMember(member.uid)} 
                                                    className="gap-2 focus:bg-red-500/10 focus:text-red-500 cursor-pointer text-red-500 font-bold text-xs py-2.5"
                                                    disabled={deleteMutation.isPending}
                                                >
                                                    <UserMinus className="h-3.5 w-3.5" /> Delete Permanently
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
