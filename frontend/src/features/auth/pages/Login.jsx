'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import { toast } from 'sonner';
import { Mail, Lock, Loader2, Eye, EyeOff, Github, Chrome, ArrowRight, ShieldCheck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';

/**
 * Feature-based Login Page
 * Consolidates authentication UI and logic from the original App Router page.
 */
function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login, loginWithGoogle, loginWithGithub } = useAuthStore();

    const [formData, setFormData] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [isEmailLoading, setIsEmailLoading] = useState(false);
    const [oauthLoading, setOauthLoading] = useState(null);

    const from = searchParams.get('from') || '/';

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleEmailLogin = async (e) => {
        e.preventDefault();
        if (!formData.email || !formData.password) return toast.error('Please fill in all fields');

        setIsEmailLoading(true);
        const result = await login(formData.email, formData.password);
        setIsEmailLoading(false);

        if (result.success) {
            router.push(from);
        }
    };

    const handleOAuth = async (method) => {
        setOauthLoading(method);
        const result = method === 'google' ? await loginWithGoogle() : await loginWithGithub();
        setOauthLoading(null);

        if (result.success) {
            router.push(from);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 px-4 py-12 relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-acm-blue/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="w-full max-w-md relative z-10">
                <Card className="border-border/50 bg-card/40 backdrop-blur-xl rounded-[2.5rem] shadow-2xl overflow-hidden">
                    <CardHeader className="text-center pt-12 pb-8">
                        <Link href="/" className="inline-block mx-auto mb-6 transition-transform hover:scale-110 duration-300">
                            <div className="w-20 h-20 bg-gradient-to-tr from-acm-blue to-cyan-400 rounded-3xl flex items-center justify-center shadow-acm-glow">
                                <ShieldCheck className="w-10 h-10 text-white" />
                            </div>
                        </Link>
                        <CardTitle className="text-3xl font-black tracking-tight text-white">Welcome Back</CardTitle>
                        <CardDescription className="text-slate-400 text-base mt-2">
                            Access the ACM Digital Project Repository
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="px-8 sm:px-10 space-y-8">
                        {/* OAuth buttons */}
                        <div className="grid grid-cols-2 gap-4">
                            <Button
                                variant="outline"
                                onClick={() => handleOAuth('google')}
                                disabled={!!oauthLoading}
                                className="h-14 rounded-2xl border-border/50 bg-white/5 hover:bg-white/10 text-white gap-3 transition-all"
                            >
                                {oauthLoading === 'google' ? <Loader2 className="h-5 w-5 animate-spin" /> : <Chrome className="h-5 w-5" />}
                                <span className="font-bold">Google</span>
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => handleOAuth('github')}
                                disabled={!!oauthLoading}
                                className="h-14 rounded-2xl border-border/50 bg-white/5 hover:bg-white/10 text-white gap-3 transition-all"
                            >
                                {oauthLoading === 'github' ? <Loader2 className="h-5 w-5 animate-spin" /> : <Github className="h-5 w-5" />}
                                <span className="font-bold">GitHub</span>
                            </Button>
                        </div>

                        {/* Divider */}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-border/30" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase font-black tracking-widest leading-none">
                                <span className="bg-slate-950 px-4 text-muted-foreground/60">OR LOGIN WITH EMAIL</span>
                            </div>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleEmailLogin} className="space-y-5">
                            <div className="space-y-2">
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-acm-blue transition-colors" />
                                    <Input
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Member Email"
                                        className="h-14 rounded-2xl border-border/50 bg-muted/20 pl-12 focus-visible:ring-acm-blue"
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
                                        placeholder="Security Credential"
                                        className="h-14 rounded-2xl border-border/50 bg-muted/20 pl-12 pr-12 focus-visible:ring-acm-blue"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between px-1">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <div className="w-4 h-4 rounded border border-border/50 bg-muted/20 group-hover:border-acm-blue transition-colors" />
                                    <span className="text-xs font-bold text-muted-foreground group-hover:text-slate-300">Stay Secure</span>
                                </label>
                                <button type="button" className="text-xs font-bold text-acm-blue hover:text-acm-blue-dark">Recover access</button>
                            </div>

                            <Button
                                type="submit"
                                disabled={isEmailLoading}
                                className="w-full h-14 rounded-2xl bg-acm-blue hover:bg-acm-blue-dark shadow-acm-glow text-lg font-black tracking-widest transition-all"
                            >
                                {isEmailLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : (
                                    <div className="flex items-center gap-2">
                                        SIGN IN <ArrowRight className="h-5 w-5" />
                                    </div>
                                )}
                            </Button>
                        </form>
                    </CardContent>

                    <CardFooter className="flex flex-col gap-6 px-8 sm:px-10 pb-12 pt-6">
                        <p className="text-center text-sm text-muted-foreground">
                            New to the community?{' '}
                            <Link href="/register" className="text-white font-bold hover:text-acm-blue transition-colors decoration-acm-blue/30 underline underline-offset-4">
                                Join the Repository
                            </Link>
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}

export default function Login() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
                <Loader2 className="h-12 w-12 animate-spin text-acm-blue" />
            </div>
        }>
            <LoginContent />
        </Suspense>
    );
}
