import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import { Mail, Lock, Eye, EyeOff, Github, Chrome, ArrowRight, ShieldCheck, Zap, User } from "lucide-react";
import Loader from "@/components/common/Loader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";

export default function LoginPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { login, loginWithGoogle, loginWithGithub, loginAsDemo } = useAuthStore();

    const [formData, setFormData] = useState({ email: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [isEmailLoading, setIsEmailLoading] = useState(false);
    const [oauthLoading, setOauthLoading] = useState(null);

    const [loginRole, setLoginRole] = useState("member"); // "member" or "admin"

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleEmailLogin = async (e) => {
        e.preventDefault();
        if (!formData.email || !formData.password) return toast.error("Please fill in all fields");
        setIsEmailLoading(true);
        const result = await login(formData.email, formData.password, loginRole);
        setIsEmailLoading(false);
        if (result.success) {
            const destination = loginRole === "admin" ? "/admin" : (searchParams.get("from") || "/");
            navigate(destination);
        }
    };

    const handleOAuth = async (method) => {
        setOauthLoading(method);
        const result = method === "google" ? await loginWithGoogle() : await loginWithGithub();
        setOauthLoading(null);
        if (result.success) {
            const destination = loginRole === "admin" ? "/admin" : (searchParams.get("from") || "/");
            navigate(destination);
        }
    };

    const handleDemoLogin = (role) => {
        loginAsDemo(role);
        navigate(role === 'admin' ? "/admin" : "/");
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 px-4 py-12 relative overflow-hidden text-white">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-acm-blue/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="w-full max-w-md relative z-10">
                <Card className="border-border/50 bg-card/40 backdrop-blur-xl rounded-[2.5rem] shadow-2xl overflow-hidden border-t-2 border-t-white/5">
                    <CardHeader className="text-center pt-12 pb-6">
                        <Link to="/" className="inline-block mx-auto mb-6 transition-transform hover:scale-110 duration-300">
                            <div className={`w-20 h-20 bg-gradient-to-tr ${loginRole === 'admin' ? 'from-amber-500 to-orange-400 shadow-amber-500/20' : 'from-acm-blue to-cyan-400 shadow-acm-glow'} rounded-3xl flex items-center justify-center shadow-2xl transition-all duration-500`}>
                                {loginRole === 'admin' ? <ShieldCheck className="w-10 h-10 text-white" /> : <Lock className="w-10 h-10 text-white" />}
                            </div>
                        </Link>

                        <div className="flex bg-white/5 p-1 rounded-2xl w-fit mx-auto mb-6 border border-white/10 backdrop-blur-md">
                            <button
                                onClick={() => setLoginRole("member")}
                                className={`px-6 py-2 rounded-xl text-xs font-black tracking-widest uppercase italic transition-all duration-300 ${loginRole === "member" ? "bg-white text-slate-950 shadow-lg" : "text-white/40 hover:text-white"}`}
                            >
                                Member
                            </button>
                            <button
                                onClick={() => setLoginRole("admin")}
                                className={`px-6 py-2 rounded-xl text-xs font-black tracking-widest uppercase italic transition-all duration-300 ${loginRole === "admin" ? "bg-white text-slate-950 shadow-lg" : "text-white/40 hover:text-white"}`}
                            >
                                Admin
                            </button>
                        </div>

                        <CardTitle className="text-3xl font-black tracking-tight text-white uppercase italic">
                            {loginRole === 'admin' ? "Console Access" : "Welcome Back"}
                        </CardTitle>
                        <CardDescription className="text-slate-400 text-sm mt-2 font-medium">
                            {loginRole === 'admin' ? "Administrative credentials required" : "Access your member repository profile"}
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="px-8 sm:px-10 space-y-6">
                        {/* Demo Access — only for Admin */}
                        {loginRole === 'admin' && (
                            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5 space-y-3">
                                <div className="flex items-center gap-2 text-primary mb-1">
                                    <Zap className="h-4 w-4 fill-amber-400 text-amber-400" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">Demo Access Available</span>
                                </div>
                                <p className="text-[11px] text-muted-foreground leading-relaxed">
                                    Backend is offline or restricted. Access the Admin Console with full CRUD capabilities using pre-loaded data.
                                </p>
                                <Button onClick={() => handleDemoLogin('admin')}
                                    className="w-full h-12 bg-amber-500 hover:bg-amber-600 shadow-amber-500/20 text-white font-black tracking-widest uppercase italic rounded-xl transition-all hover:scale-[1.02] gap-2">
                                    <ShieldCheck className="h-4 w-4" />
                                    ENTER DEMO ADMIN CONSOLE
                                </Button>
                            </div>
                        )}

                        {loginRole === 'member' && (
                            <>
                                <div className="grid grid-cols-2 gap-4">
                                    <Button variant="outline" onClick={() => handleOAuth("google")} disabled={!!oauthLoading}
                                        className="h-14 rounded-2xl border-border/50 bg-white/5 hover:bg-white/10 text-white gap-3 transition-all">
                                        {oauthLoading === "google" ? <Loader size={0.4} /> : <Chrome className="h-5 w-5" />}
                                        <span className="font-bold">Google</span>
                                    </Button>
                                    <Button variant="outline" onClick={() => handleOAuth("github")} disabled={!!oauthLoading}
                                        className="h-14 rounded-2xl border-border/50 bg-white/5 hover:bg-white/10 text-white gap-3 transition-all">
                                        {oauthLoading === "github" ? <Loader size={0.4} /> : <Github className="h-5 w-5" />}
                                        <span className="font-bold">GitHub</span>
                                    </Button>
                                </div>

                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border/30" /></div>
                                    <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest leading-none">
                                        <span className="bg-slate-950 px-4 text-muted-foreground/60 italic">OR USE CREDENTIALS</span>
                                    </div>
                                </div>
                            </>
                        )}

                        {loginRole === 'admin' && (
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border/30" /></div>
                                <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest leading-none">
                                    <span className="bg-slate-950 px-4 text-muted-foreground/60 italic">OR USE REAL CREDENTIALS</span>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleEmailLogin} className="space-y-5">
                            <div className="relative group">
                                <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors ${loginRole === 'admin' ? 'group-focus-within:text-amber-500' : 'group-focus-within:text-acm-blue'}`} />
                                <Input name="email" type="email" value={formData.email} onChange={handleChange}
                                    placeholder={loginRole === 'admin' ? "Admin Identifier" : "Member Email"}
                                    className={`h-14 rounded-2xl border-border/50 bg-muted/20 pl-12 transition-all ${loginRole === 'admin' ? 'focus-visible:ring-amber-500' : 'focus-visible:ring-acm-blue'}`} />
                            </div>
                            <div className="relative group">
                                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors ${loginRole === 'admin' ? 'group-focus-within:text-amber-500' : 'group-focus-within:text-acm-blue'}`} />
                                <Input name="password" type={showPassword ? "text" : "password"} value={formData.password} onChange={handleChange}
                                    placeholder="Security Key" className={`h-14 rounded-2xl border-border/50 bg-muted/20 pl-12 pr-12 transition-all ${loginRole === 'admin' ? 'focus-visible:ring-amber-500' : 'focus-visible:ring-acm-blue'}`} />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors">
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                            <Button type="submit" disabled={isEmailLoading}
                                className={`w-full h-14 rounded-2xl shadow-acm-glow text-lg font-black tracking-[0.2em] transition-all uppercase italic ${loginRole === 'admin' ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20' : 'bg-acm-blue hover:bg-acm-blue-dark shadow-acm-glow'}`}>
                                {isEmailLoading ? <Loader size={0.5} /> : (
                                    <div className="flex items-center gap-2 tracking-widest">{loginRole === 'admin' ? "INITIALIZE CONSOLE" : "SIGN IN"} <ArrowRight className="h-5 w-5" /></div>
                                )}
                            </Button>
                        </form>
                    </CardContent>

                    <CardFooter className="flex flex-col gap-6 px-8 sm:px-10 pb-12 pt-6">
                        <p className="text-center text-xs font-bold text-muted-foreground italic tracking-wide">
                            {loginRole === 'admin' ? "Restricted administrative access zone." : "New to the community?"}{" "}
                            {loginRole === 'member' && (
                                <Link to="/register" className="text-white font-black hover:text-acm-blue transition-colors decoration-acm-blue/30 underline underline-offset-4">
                                    Join the Repository
                                </Link>
                            )}
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
