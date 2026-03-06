import Link from "next/link";
import { Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/BackButton";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden px-4">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-acm-blue/10 blur-[120px] rounded-full" />

            <div className="relative z-10 text-center space-y-8 max-w-2xl">
                <div className="space-y-2">
                    <h1 className="text-[12rem] font-black text-white/5 leading-none select-none tracking-tighter">404</h1>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full">
                        <h2 className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-tighter">Archive Node Not Found</h2>
                        <p className="mt-4 text-slate-400 font-medium max-w-md mx-auto">
                            The requested data segment is missing from the repository or has been moved to a different sector.
                        </p>
                    </div>
                </div>

                <div className="pt-24 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Button asChild size="lg" className="h-14 px-8 rounded-2xl bg-acm-blue hover:bg-acm-blue-dark text-white font-black tracking-widest shadow-lg shadow-acm-blue/20">
                        <Link href="/">
                            <Home className="mr-2 h-5 w-5" /> COMMAND CENTER
                        </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="h-14 px-8 rounded-2xl border-white/10 bg-white/5 backdrop-blur-sm text-white font-black tracking-widest hover:bg-white/10">
                        <Link href="/search">
                            <Search className="mr-2 h-5 w-5" /> SEARCH DATA
                        </Link>
                    </Button>
                </div>

                <div className="pt-8">
                    <BackButton />
                </div>
            </div>
        </div>
    );
}
