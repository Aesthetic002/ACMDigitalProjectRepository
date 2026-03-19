import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Mail, Lock, User, Eye, EyeOff, Github, Chrome, CheckCircle, ArrowRight, Sparkles, Shield, Key } from "lucide-react";
import Loader from "@/components/common/Loader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";

export default function RegisterPage() {
    const navigate = useNavigate();
    const { register, loginWithGoogle, loginWithGithub } = useAuthStore();

    const [formData, setFormData] = useState({ name: "", email: "", password: "", confirmPassword: "", isAdmin: false, secretCode: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [oauthLoading, setOauthLoading] = useState(null);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const passwordRequirements = [
        { label: "At least 8 characters", met: formData.password.length >= 8 },
        { label: "Contains a number", met: /\d/.test(formData.password) },
        { label: "Contains uppercase letter", met: /[A-Z]/.test(formData.password) },
    ];

    const isPasswordValid = passwordRequirements.every((req) => req.met);

    const handleEmailRegister = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.email || !formData.password) return toast.error("Please fill in all fields");
        if (!isPasswordValid) return toast.error("Password does not meet security requirements");
        if (formData.password !== formData.confirmPassword) return toast.error("Passwords do not match");

        if (formData.isAdmin) {
            if (formData.secretCode !== "ACM_SECRET_2024") {
                return toast.error("Invalid secret console code for administrative access");
            }
        }

        setIsLoading(true);
        const result = await register(formData.email, formData.password, formData.name, formData.isAdmin ? "admin" : "member");
        setIsLoading(false);
        if (result.success) navigate("/");
    };

    const handleOAuth = async (method) => {
        setOauthLoading(method);
        const result = method === "google" ? await loginWithGoogle() : await loginWithGithub();
        setOauthLoading(null);
        if (result.success) navigate("/");
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 px-4 py-20 relative overflow-hidden text-white">
            <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-acm-blue/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="w-full max-w-md relative z-10">
                <Card className="border-border/50 bg-card/40 backdrop-blur-xl rounded-[2.5rem] shadow-2xl overflow-hidden border-t-2 border-t-white/5">
                    <CardHeader className="text-center pt-12 pb-8 px-8 sm:px-10">
                        <Link to="/" className="inline-block mx-auto mb-6 transition-transform hover:scale-110 duration-300">
                            <div className="w-16 h-16 bg-gradient-to-tr from-acm-blue to-cyan-400 rounded-2xl flex items-center justify-center shadow-acm-glow">
                                <Sparkles className="w-8 h-8 text-white" />
                            </div>
                        </Link>
                        <CardTitle className="text-3xl font-black tracking-tight text-white italic uppercase">Level Up.</CardTitle>
                        <CardDescription className="text-slate-400 text-base mt-2 font-medium">Join the ACM community and start contributing</CardDescription>
                    </CardHeader>

                    <CardContent className="px-8 sm:px-10 space-y-8">
                        <form onSubmit={handleEmailRegister} className="space-y-4">
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-acm-blue transition-colors" />
                                <Input name="name" value={formData.name} onChange={handleChange} placeholder="Full Identification"
                                    className="h-12 rounded-xl border-border/50 bg-muted/20 pl-12 focus-visible:ring-acm-blue" />
                            </div>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-acm-blue transition-colors" />
                                <Input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Member Email"
                                    className="h-12 rounded-xl border-border/50 bg-muted/20 pl-12 focus-visible:ring-acm-blue" />
                            </div>
                            <div>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-acm-blue transition-colors" />
                                    <Input name="password" type={showPassword ? "text" : "password"} value={formData.password} onChange={handleChange}
                                        placeholder="Security Key" className="h-12 rounded-xl border-border/50 bg-muted/20 pl-12 pr-12 focus-visible:ring-acm-blue" />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors">
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                {formData.password && (
                                    <div className="flex flex-wrap gap-2 px-1 pt-2">
                                        {passwordRequirements.map((req, i) => (
                                            <div key={i} className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${req.met ? "text-emerald-500" : "text-muted-foreground/50"}`}>
                                                <CheckCircle className={`h-3 w-3 ${req.met ? "opacity-100" : "opacity-30"}`} />
                                                {req.label}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-acm-blue transition-colors" />
                                <Input name="confirmPassword" type={showPassword ? "text" : "password"} value={formData.confirmPassword} onChange={handleChange}
                                    placeholder="Verify Security Key"
                                    className={`h-12 rounded-xl border-border/50 bg-muted/20 pl-12 focus-visible:ring-acm-blue ${formData.confirmPassword && formData.password !== formData.confirmPassword ? "border-red-500/50" : ""}`} />
                            </div>

                            {/* Admin Registration Toggle */}
                            <div className="space-y-4 pt-2">
                                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-border/50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-acm-blue/10 flex items-center justify-center">
                                            <Shield className="h-5 w-5 text-acm-blue" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white uppercase italic">Admin Account</p>
                                            <p className="text-[10px] text-slate-400">Request administrative privileges</p>
                                        </div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        name="isAdmin"
                                        checked={formData.isAdmin}
                                        onChange={handleChange}
                                        className="w-5 h-5 rounded border-border/50 bg-muted/20 text-acm-blue focus:ring-acm-blue"
                                    />
                                </div>

                                {formData.isAdmin && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        className="relative group"
                                    >
                                        <Key className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-acm-blue transition-colors" />
                                        <Input
                                            name="secretCode"
                                            value={formData.secretCode}
                                            onChange={handleChange}
                                            placeholder="Secret Console Code"
                                            className="h-12 rounded-xl border-border/50 bg-muted/20 pl-12 focus-visible:ring-acm-blue"
                                            required
                                        />
                                    </motion.div>
                                )}
                            </div>
                            <Button type="submit" disabled={isLoading}
                                className="w-full h-14 rounded-2xl bg-acm-blue hover:bg-acm-blue-dark shadow-acm-glow text-lg font-black tracking-widest mt-6 transition-all uppercase italic">
                                {isLoading ? <Loader size={0.5} /> : (
                                    <div className="flex items-center gap-2">INITIALIZE ACCOUNT <ArrowRight className="h-5 w-5" /></div>
                                )}
                            </Button>
                        </form>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border/20" /></div>
                            <div className="relative flex justify-center text-[10px] uppercase font-black tracking-[0.2em] leading-none">
                                <span className="bg-slate-950 px-4 text-muted-foreground/40 italic">SWIFT AUTH</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Button variant="outline" onClick={() => handleOAuth("google")} disabled={!!oauthLoading}
                                className="h-12 rounded-xl border-border/50 bg-white/5 hover:bg-white/10 text-white gap-2 text-xs font-bold transition-all">
                                {oauthLoading === "google" ? <Loader size={0.3} /> : <Chrome className="h-4 w-4" />} GOOGLE
                            </Button>
                            <Button variant="outline" onClick={() => handleOAuth("github")} disabled={!!oauthLoading}
                                className="h-12 rounded-xl border-border/50 bg-white/5 hover:bg-white/10 text-white gap-2 text-xs font-bold transition-all">
                                {oauthLoading === "github" ? <Loader size={0.3} /> : <Github className="h-4 w-4" />} GITHUB
                            </Button>
                        </div>
                    </CardContent>

                    <CardFooter className="flex flex-col gap-6 px-10 pb-12 pt-6">
                        <p className="text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-4 leading-relaxed italic">
                            By creating an account, you agree to the <span className="text-slate-300">Chapter Protocol</span> and <span className="text-slate-300">Privacy Interface</span>.
                        </p>
                        <p className="text-center text-sm text-slate-400 font-medium">
                            Already a member?{" "}
                            <Link to="/login" className="text-acm-blue font-black hover:text-acm-blue-dark transition-colors uppercase italic tracking-wider">Sign In here</Link>
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
