'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import { toast } from 'sonner';
import { Mail, Lock, User, Loader2, Eye, EyeOff, Github, Chrome, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';

/**
 * Feature-based Register Page
 * Reorganized into modular feature structure.
 */
export default function Register() {
    const router = useRouter();
    const { register, loginWithGoogle, loginWithGithub } = useAuthStore();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [oauthLoading, setOauthLoading] = useState(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const passwordRequirements = [
        { label: 'At least 8 characters', met: formData.password.length >= 8 },
        { label: 'Contains a number', met: /\d/.test(formData.password) },
        { label: 'Contains uppercase letter', met: /[A-Z]/.test(formData.password) },
    ];

    const isPasswordValid = passwordRequirements.every((req) => req.met);

    const handleEmailRegister = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.email || !formData.password) return toast.error('Please fill in all fields');
        if (!isPasswordValid) return toast.error('Password does not meet security requirements');
        if (formData.password !== formData.confirmPassword) return toast.error('Passwords do not match');

        setIsLoading(true);
        const result = await register(formData.email, formData.password, formData.name);
        setIsLoading(false);

        if (result.success) {
            router.push('/');
        }
    };

    const handleOAuth = async (method) => {
        setOauthLoading(method);
        const result = method === 'google' ? await loginWithGoogle() : await loginWithGithub();
        setOauthLoading(null);
        if (result.success) router.push('/');
    };

    if (!mounted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
                <Loader2 className="h-10 w-10 animate-spin text-acm-blue" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 px-4 py-20 relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-acm-blue/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="w-full max-w-md relative z-10">
                <Card className="border-border/50 bg-card/40 backdrop-blur-xl rounded-[2.5rem] shadow-2xl overflow-hidden">
                    <CardHeader className="text-center pt-12 pb-8 px-8 sm:px-10">
                        <Link href="/" className="inline-block mx-auto mb-6 transition-transform hover:scale-110 duration-300">
                            <div className="w-16 h-16 bg-gradient-to-tr from-acm-blue to-cyan-400 rounded-2xl flex items-center justify-center shadow-acm-glow">
                                <Sparkles className="w-8 h-8 text-white" />
                            </div>
                        </Link>
                        <CardTitle className="text-3xl font-black tracking-tight text-white italic">Level Up.</CardTitle>
                        <CardDescription className="text-slate-400 text-base mt-2">
                            Join the ACM community and start contributing
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="px-8 sm:px-10 space-y-8">
                        {/* Form */}
                        <form onSubmit={handleEmailRegister} className="space-y-4">
                            <div className="space-y-2">
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-acm-blue transition-colors" />
                                    <Input
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Full Identification"
                                        className="h-12 rounded-xl border-border/50 bg-muted/20 pl-12 focus-visible:ring-acm-blue"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-acm-blue transition-colors" />
                                    <Input
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Member Email"
                                        className="h-12 rounded-xl border-border/50 bg-muted/20 pl-12 focus-visible:ring-acm-blue"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-acm-blue transition-colors" />
                                    <Input
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Security Key"
                                        className="h-12 rounded-xl border-border/50 bg-muted/20 pl-12 pr-12 focus-visible:ring-acm-blue"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>

                                {/* Requirements display */}
                                {formData.password && (
                                    <div className="flex flex-wrap gap-2 px-1 pt-1">
                                        {passwordRequirements.map((req, i) => (
                                            <div key={i} className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${req.met ? 'text-emerald-500' : 'text-muted-foreground/50'}`}>
                                                <CheckCircle className={`h-3 w-3 ${req.met ? 'opacity-100' : 'opacity-30'}`} />
                                                {req.label}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-acm-blue transition-colors" />
                                    <Input
                                        name="confirmPassword"
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        placeholder="Verify Security Key"
                                        className={`h-12 rounded-xl border-border/50 bg-muted/20 pl-12 focus-visible:ring-acm-blue ${formData.confirmPassword && formData.password !== formData.confirmPassword ? 'border-red-500/50' : ''
                                            }`}
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-14 rounded-2xl bg-acm-blue hover:bg-acm-blue-dark shadow-acm-glow text-lg font-black tracking-widest mt-6 transition-all"
                            >
                                {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : (
                                    <div className="flex items-center gap-2">
                                        INITIALIZE ACCOUNT <ArrowRight className="h-5 w-5" />
                                    </div>
                                )}
                            </Button>
                        </form>

                        {/* Divider */}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-border/20" />
                            </div>
                            <div className="relative flex justify-center text-[10px] uppercase font-black tracking-[0.2em] leading-none">
                                <span className="bg-slate-950 px-4 text-muted-foreground/40">Swift Auth</span>
                            </div>
                        </div>

                        {/* OAuth buttons */}
                        <div className="grid grid-cols-2 gap-4">
                            <Button
                                variant="outline"
                                onClick={() => handleOAuth('google')}
                                disabled={!!oauthLoading}
                                className="h-12 rounded-xl border-border/50 bg-white/5 hover:bg-white/10 text-white gap-2 text-xs font-bold"
                            >
                                {oauthLoading === 'google' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Chrome className="h-4 w-4" />}
                                GOOGLE
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => handleOAuth('github')}
                                disabled={!!oauthLoading}
                                className="h-12 rounded-xl border-border/50 bg-white/5 hover:bg-white/10 text-white gap-2 text-xs font-bold"
                            >
                                {oauthLoading === 'github' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Github className="h-4 w-4" />}
                                GITHUB
                            </Button>
                        </div>
                    </CardContent>

                    <CardFooter className="flex flex-col gap-6 px-10 pb-12 pt-6">
                        <p className="text-center text-xs text-muted-foreground px-4 leading-relaxed">
                            By creating an account, you agree to the <span className="text-slate-300 font-bold">Community Protocol</span> and <span className="text-slate-300 font-bold">Privacy Interface</span>.
                        </p>
                        <p className="text-center text-sm text-slate-400">
                            Already a member?{' '}
                            <Link href="/login" className="text-acm-blue font-bold hover:text-acm-blue-dark transition-colors">
                                Sign In here
                            </Link>
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
