import { useNavigate, useLocation, Link, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import {
    LayoutDashboard,
    ShieldCheck,
    PlusCircle,
    Calendar,
    Layers,
    LogOut,
    ChevronRight,
    Search,
    Home,
    Users,
    FolderGit2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const sidebarItems = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Members", href: "/admin/members", icon: Users },
    { label: "Projects", href: "/admin/projects", icon: FolderGit2 },
    { label: "Moderation", href: "/admin/moderation", icon: ShieldCheck },
    { label: "Pre-add Project", href: "/admin/pre-add", icon: PlusCircle },
    { label: "Events", href: "/admin/events/new", icon: Calendar },
    { label: "Domains", href: "/admin/domains", icon: Layers },
];

export default function AdminLayout() {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        await logout();
        navigate("/");
    };

    return (
        <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden">
            {/* Sidebar */}
            <aside className="w-72 border-r border-border/50 bg-card/30 backdrop-blur-xl flex flex-col relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-acm-blue to-cyan-400" />

                <div className="p-8">
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-2xl bg-amber-500 flex items-center justify-center group-hover:scale-105 transition-transform shadow-lg shadow-amber-500/20">
                            <ShieldCheck className="text-white h-5 w-5" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-black text-white text-sm tracking-tight uppercase italic underline decoration-amber-500 decoration-2 underline-offset-4">Console</span>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Management</span>
                        </div>
                    </Link>
                </div>

                <ScrollArea className="flex-1 px-4">
                    <div className="space-y-1.5">
                        <p className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-[0.2em] mb-4 pl-4">Operations Control</p>
                        {sidebarItems.map((item) => (
                            <Link
                                key={item.label}
                                to={item.href}
                                className={`flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 group ${location.pathname === item.href
                                    ? "bg-amber-500/10 text-amber-500 shadow-inner"
                                    : "hover:bg-white/5 text-slate-400 hover:text-white"
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <item.icon className={`h-5 w-5 ${location.pathname === item.href ? "text-amber-500" : "text-slate-500 group-hover:text-slate-300"}`} />
                                    <span className="text-sm font-bold tracking-tight">{item.label}</span>
                                </div>
                                {location.pathname === item.href && <ChevronRight className="h-4 w-4" />}
                            </Link>
                        ))}
                    </div>

                    <div className="mt-12 space-y-1.5">
                        <p className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-[0.2em] mb-4 pl-4">Public View</p>
                        <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                            <Home className="h-5 w-5 text-slate-500" />
                            <span className="text-sm font-bold">Back to Site</span>
                        </Link>
                    </div>
                </ScrollArea>

                <div className="p-6 border-t border-border/50 bg-black/20">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-acm-blue to-cyan-500 flex items-center justify-center font-black text-white shadow-lg">
                            {user?.name?.charAt(0) || 'A'}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <p className="text-sm font-black text-white truncate">{user?.name}</p>
                            <p className="text-[10px] text-acm-blue font-bold uppercase tracking-wider">{user?.role}</p>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        onClick={handleLogout}
                        className="w-full h-11 rounded-xl border-red-500/20 bg-red-500/5 text-red-500 hover:bg-red-500 hover:text-white transition-all gap-2 font-bold text-xs"
                    >
                        <LogOut className="h-4 w-4" /> TERMINATE SESSION
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto bg-slate-950">
                <div className="min-h-screen p-8 lg:p-12">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
