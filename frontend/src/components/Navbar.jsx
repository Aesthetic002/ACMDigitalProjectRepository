import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useTheme } from "@/hooks/useTheme";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
    Sun, Moon, Menu, X, FolderOpen, Shield, Search,
    PlusCircle, LogIn, User as UserIcon, Users, Home,
    FolderGit2, Calendar
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Archive", href: "/projects", icon: FolderOpen },
    { label: "Members", href: "/members", icon: Users },
    { label: "Domains", href: "/domains", icon: Shield },
    { label: "Events", href: "/events", icon: Calendar },
    { label: "Search", href: "/search", icon: Search },
];

export default function Navbar() {
    const { theme, toggleTheme } = useTheme();
    const { user, logout, isAuthenticated } = useAuthStore();
    const navigate = useNavigate();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleLogout = async () => {
        await logout();
        navigate("/");
    };

    return (
        <>
            <motion.header
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.6 }}
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                    ? "bg-background/80 backdrop-blur-xl border-b border-border shadow-sm"
                    : "bg-transparent"
                    }`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link to="/" className="flex items-center gap-2.5 group">
                            <div className="w-10 h-10 rounded-2xl bg-acm-blue flex items-center justify-center group-hover:scale-105 transition-transform shadow-lg shadow-acm-blue/20">
                                <span className="text-white font-black text-sm tracking-tighter">ACM</span>
                            </div>
                            <div className="flex flex-col leading-none">
                                <span className="font-black text-white text-base tracking-tight uppercase italic">Digital</span>
                                <span className="text-[10px] font-bold text-acm-blue uppercase tracking-widest">Repository</span>
                            </div>
                        </Link>

                        <nav className="hidden md:flex items-center gap-1">
                            {navItems.map((item) => {
                                // Home is always visible, others require authentication
                                if (item.label !== "Home" && !isAuthenticated) return null;
                                return (
                                    <Link
                                        key={item.label}
                                        to={item.href}
                                        className="px-4 py-2 rounded-xl text-sm font-bold text-muted-foreground hover:text-white hover:bg-white/5 transition-all"
                                    >
                                        {item.label}
                                    </Link>
                                );
                            })}
                            {user?.role === 'admin' && (
                                <Link to="/admin" className="px-4 py-2 rounded-xl text-sm font-bold text-acm-blue hover:bg-acm-blue/10 transition-all flex items-center gap-2">
                                    <Shield className="h-4 w-4" /> ADMIN
                                </Link>
                            )}
                        </nav>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={toggleTheme}
                                className="w-10 h-10 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-border/50"
                            >
                                {theme === "dark" ? <Moon className="h-4 w-4 text-acm-blue" /> : <Sun className="h-4 w-4 text-amber-500" />}
                            </Button>

                            <Separator orientation="vertical" className="h-6 bg-border/50 mx-2 hidden md:block" />

                            {user ? (
                                <div className="flex items-center gap-4">
                                    <div className="hidden lg:flex flex-col items-end mr-2">
                                        <span className="text-[10px] font-black uppercase tracking-tighter text-white italic truncate max-w-[120px]">
                                            {user?.name || "Member"}
                                        </span>
                                        {user?.role === 'admin' && (
                                            <Badge variant="outline" className="h-4 px-1.5 border-amber-500/50 text-amber-500 bg-amber-500/10 text-[8px] font-black uppercase italic tracking-widest whitespace-nowrap">
                                                ADMIN CONSOLE
                                            </Badge>
                                        )}
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className={`relative h-10 w-10 rounded-xl bg-white/5 border transition-all ${user?.role === 'admin' ? 'border-amber-500/50 p-0.5 shadow-[0_0_10px_rgba(245,158,11,0.2)]' : 'border-white/10 hover:bg-white/10'}`}>
                                                <Avatar className="h-full w-full rounded-lg">
                                                    <AvatarImage src={user?.photoURL} />
                                                    <AvatarFallback className={`${user?.role === 'admin' ? 'bg-amber-500' : 'bg-acm-blue'} text-white font-black text-xs italic`}>
                                                        {(user?.name || user?.email || "?").charAt(0).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="w-56 rounded-2xl bg-card/95 backdrop-blur-xl border-border/50" align="end" forceMount>
                                            <DropdownMenuLabel className="font-normal">
                                                <div className="flex flex-col space-y-1">
                                                    <p className="text-sm font-bold leading-none">{user.name}</p>
                                                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                                                </div>
                                            </DropdownMenuLabel>
                                            <DropdownMenuSeparator className="bg-border/50" />
                                            <DropdownMenuItem asChild className="rounded-xl focus:bg-acm-blue/10 cursor-pointer">
                                                <Link to="/profile" className="w-full flex items-center"><UserIcon className="mr-2 h-4 w-4" /> Profile</Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild className="rounded-xl focus:bg-acm-blue/10 cursor-pointer">
                                                <Link to="/submit" className="w-full flex items-center"><PlusCircle className="mr-2 h-4 w-4" /> Submit Project</Link>
                                            </DropdownMenuItem>
                                            {user?.role === 'admin' && (
                                                <>
                                                    <DropdownMenuSeparator className="bg-border/50" />
                                                    <DropdownMenuItem asChild className="rounded-xl focus:bg-amber-500/10 cursor-pointer text-amber-500">
                                                        <Link to="/admin" className="w-full flex items-center font-bold tracking-tight"><Shield className="mr-2 h-4 w-4" /> ADMIN CONSOLE</Link>
                                                    </DropdownMenuItem>
                                                </>
                                            )}
                                            <DropdownMenuSeparator className="bg-border/50" />
                                            <DropdownMenuItem onClick={handleLogout} className="rounded-xl focus:bg-red-500/10 text-red-500 cursor-pointer font-bold">
                                                Log out
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            ) : (
                                <Button asChild className="h-10 px-6 rounded-xl bg-acm-blue hover:bg-acm-blue-dark text-white font-black tracking-widest text-xs hidden sm:flex">
                                    <Link to="/login">SIGN IN</Link>
                                </Button>
                            )}

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="md:hidden w-9 h-9 rounded-lg hover:bg-muted transition-colors ml-2"
                                aria-label="Toggle menu"
                            >
                                <AnimatePresence mode="wait">
                                    {isMobileMenuOpen ? (
                                        <motion.div key="close" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ duration: 0.2 }}>
                                            <X className="h-5 w-5" />
                                        </motion.div>
                                    ) : (
                                        <motion.div key="menu" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ duration: 0.2 }}>
                                            <Menu className="h-5 w-5" />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </Button>
                        </div>
                    </div>
                </div>
            </motion.header>

            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-x-0 top-16 z-40 md:hidden"
                    >
                        <div className="mx-4 mt-2 p-4 rounded-2xl bg-card/95 backdrop-blur-xl border border-border shadow-xl">
                            <nav className="space-y-1">
                                {navItems.map((item) => (
                                    <Link
                                        key={item.label}
                                        to={item.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-foreground hover:bg-muted transition-colors font-bold text-sm"
                                    >
                                        <item.icon className="h-5 w-5 text-acm-blue" />
                                        {item.label}
                                    </Link>
                                ))}
                                {!user && (
                                    <Link
                                        to="/login"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-acm-blue bg-acm-blue/5 hover:bg-acm-blue/10 transition-colors font-black text-sm uppercase tracking-widest mt-2"
                                    >
                                        <LogIn className="h-5 w-5" /> Sign In
                                    </Link>
                                )}
                            </nav>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
