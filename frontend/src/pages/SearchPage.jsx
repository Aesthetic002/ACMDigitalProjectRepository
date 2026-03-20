import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { searchAPI } from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { History } from "lucide-react";
import ProjectCard from "@/components/ProjectCard";
import Layout from "@/components/Layout";
import {
    Search as SearchIcon, Filter, X, FolderOpen,
    ChevronRight, TrendingUp, Sparkles
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function SearchContent() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const query = searchParams.get("q") || "";

    const [searchInput, setSearchInput] = useState(query);
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        techStack: searchParams.get("tech") || "",
        status: searchParams.get("status") || "",
    });
    const { user } = useAuthStore();

    const recentSearches = user?.isDemoUser ? ["AI Assistant", "Blockchain Voting", "Portfolio"] : [];

    const { data: searchData, isLoading } = useQuery({
        queryKey: ["search", query, filters],
        queryFn: () => {
            const params = { q: query };
            if (filters.techStack) params.techStack = filters.techStack;
            if (filters.status) params.status = filters.status;
            return searchAPI.search(params);
        },
        enabled: !!query,
    });

    const results = searchData?.data?.results || searchData?.data?.projects || [];

    const handleSearch = (e) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (searchInput.trim()) params.set("q", searchInput.trim());
        if (filters.techStack) params.set("tech", filters.techStack);
        if (filters.status) params.set("status", filters.status);
        setSearchParams(params);
    };

    const handleQuickSearch = (term) => {
        setSearchInput(term);
        setSearchParams({ q: term });
    };

    const clearFilters = () => {
        setFilters({ techStack: "", status: "" });
        if (query) setSearchParams({ q: query });
    };

    const hasActiveFilters = filters.techStack || filters.status;

    return (
        <div className="min-h-screen bg-background/50 pb-20">
            <section className="relative border-b border-border/50 bg-slate-950 py-16 lg:py-24">
                <div className="absolute inset-x-0 top-0 h-full bg-gradient-to-b from-primary/5 to-transparent" />
                <div className="container relative mx-auto px-4">
                    <div className="mx-auto max-w-4xl text-center">
                        <h1 className="mb-8 text-3xl font-extrabold tracking-tight text-white sm:text-5xl uppercase italic tracking-tighter">
                            Search the <span className="text-acm-blue">Archive.</span>
                        </h1>
                        <form onSubmit={handleSearch} className="group relative mx-auto max-w-2xl">
                            <div className="flex flex-col gap-3 sm:flex-row">
                                <div className="relative flex-1">
                                    <SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-acm-blue" />
                                    <Input type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
                                        placeholder="Search by title, stack, or owner..."
                                        className="h-14 rounded-2xl border-border/50 bg-card pl-12 text-lg focus-visible:ring-acm-blue" />
                                </div>
                                <div className="flex gap-2">
                                    <Button type="button" variant="outline" onClick={() => setShowFilters(!showFilters)}
                                        className={`h-14 w-14 rounded-2xl border-border/50 transition-all ${showFilters || hasActiveFilters ? "bg-acm-blue/10 border-acm-blue text-acm-blue" : "bg-card"}`}>
                                        <Filter className="h-5 w-5" />
                                    </Button>
                                    <Button type="submit" className="h-14 rounded-2xl bg-acm-blue px-8 text-lg font-black tracking-widest uppercase italic hover:bg-acm-blue-dark shadow-acm-glow">SEARCH</Button>
                                </div>
                            </div>

                            {showFilters && (
                                <div className="mt-4 overflow-hidden rounded-3xl border border-border/50 bg-card p-6 text-left shadow-xl backdrop-blur-xl bg-card/80">
                                    <div className="mb-4 flex items-center justify-between">
                                        <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Advanced Filters</h3>
                                        {hasActiveFilters && (
                                            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 text-[10px] font-black tracking-tighter hover:text-red-500 uppercase">
                                                <X className="mr-1 h-3 w-3" /> RESET FILTERS
                                            </Button>
                                        )}
                                    </div>
                                    <div className="grid gap-6 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-foreground italic">Technology</label>
                                            <Input placeholder="e.g. React, Python" value={filters.techStack}
                                                onChange={(e) => setFilters(f => ({ ...f, techStack: e.target.value }))}
                                                className="h-10 border-border/50 bg-muted/30 rounded-xl focus-visible:ring-acm-blue" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-foreground italic">Visibility Status</label>
                                            <Select value={filters.status || "all"} onValueChange={(v) => setFilters(f => ({ ...f, status: v === "all" ? "" : v }))}>
                                                <SelectTrigger className="h-10 border-border/50 bg-muted/30 rounded-xl focus:ring-acm-blue"><SelectValue placeholder="All Statuses" /></SelectTrigger>
                                                <SelectContent className="rounded-xl bg-card border-border/50 backdrop-blur-xl">
                                                    <SelectItem value="all">All Statuses</SelectItem>
                                                    <SelectItem value="approved">Approved</SelectItem>
                                                    <SelectItem value="pending">Pending</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </form>

                        {!query && (
                            <div className="mt-8 space-y-6">
                                <div className="flex flex-wrap justify-center gap-2">
                                    <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground mr-2 italic">
                                        <TrendingUp className="h-3 w-3" /> Suggested:
                                    </span>
                                    {["Machine Learning", "Next.js", "Firebase", "Data Visualization", "Security"].map((tag) => (
                                        <button key={tag} onClick={() => handleQuickSearch(tag)}
                                            className="rounded-full border border-border/50 bg-card/30 px-4 py-1.5 text-xs font-bold uppercase tracking-tight text-white/50 transition-all hover:border-acm-blue/50 hover:bg-acm-blue/5 hover:text-white italic">
                                            {tag}
                                        </button>
                                    ))}
                                </div>

                                {user?.isDemoUser && recentSearches.length > 0 && (
                                    <div className="flex flex-wrap justify-center gap-2 max-w-2xl mx-auto pt-4 border-t border-white/5">
                                        <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground mr-2 italic">
                                            <History className="h-3 w-3" /> Recent:
                                        </span>
                                        {recentSearches.map((term) => (
                                            <button key={term} onClick={() => handleQuickSearch(term)}
                                                className="px-3 py-1 text-[11px] font-bold text-muted-foreground hover:text-white transition-colors uppercase tracking-tight">
                                                {term}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <div className="container mx-auto px-4 py-12">
                {query ? (
                    <div className="mx-auto max-w-5xl">
                        <div className="mb-10 flex items-center justify-between border-b border-border/50 pb-6">
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-acm-blue/10 shadow-inner">
                                    <Sparkles className="h-6 w-6 text-acm-blue" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black tracking-tight text-white uppercase italic">Search Results</h2>
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mt-1">
                                        {isLoading ? "Searching Protocols..." : `${results.length} valid results for "${query}"`}
                                    </p>
                                </div>
                            </div>
                            {!isLoading && results.length > 0 && (
                                <Badge variant="outline" className="border-border/50 text-muted-foreground font-black uppercase tracking-widest text-[9px] italic bg-white/5">Sorted by Relevance</Badge>
                            )}
                        </div>

                        {isLoading ? (
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {[1, 2, 3].map((i) => <div key={i} className="h-[400px] animate-pulse rounded-[2.5rem] bg-card/40 border border-border/50" />)}
                            </div>
                        ) : results.length === 0 ? (
                            <div className="flex min-h-[400px] flex-col items-center justify-center rounded-[3rem] border border-dashed border-border/30 p-12 text-center bg-white/2">
                                <div className="mb-6 rounded-3xl bg-muted/50 p-6 shadow-inner"><FolderOpen className="h-12 w-12 text-muted-foreground/50" /></div>
                                <h3 className="text-3xl font-black tracking-tight text-white uppercase italic">Zero Matches found.</h3>
                                <p className="mt-2 text-muted-foreground max-w-xs mx-auto font-medium">The search query did not trigger any matching entity in the archive.</p>
                                <div className="mt-8 flex gap-3">
                                    <Button variant="outline" onClick={() => navigate("/projects")} className="rounded-xl px-8 font-black uppercase tracking-widest text-xs italic">Browse All</Button>
                                    <Button variant="secondary" onClick={() => { setSearchInput(""); setSearchParams({}); }} className="rounded-xl px-8 font-black uppercase tracking-widest text-xs italic bg-white text-slate-950">Clear Buffer</Button>
                                </div>
                            </div>
                        ) : (
                            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                                {results.map((project) => <ProjectCard key={project.id} project={project} />)}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="mx-auto max-w-4xl text-center py-20 relative">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-acm-blue/5 rounded-full blur-[100px] pointer-events-none" />
                        <div className="inline-flex h-24 w-24 items-center justify-center rounded-[2.5rem] bg-white/5 mb-8 border border-white/10 shadow-2xl">
                            <SearchIcon className="h-10 w-10 text-acm-blue/40" />
                        </div>
                        <h2 className="text-4xl font-black tracking-tighter text-white uppercase italic mb-4">Start your discovery</h2>
                        <p className="text-muted-foreground max-w-md mx-auto mb-12 font-medium leading-relaxed">
                            Input a member name, a technology like 'Python', or a project title to search the entire digital archive of the ACM Chapter.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative z-10">
                            {[
                                { label: "Popular Web Apps", query: "Web", desc: "Discover active sites" },
                                { label: "Data Science", query: "Data", desc: "View analytical models" },
                                { label: "Cloud Solutions", query: "Cloud", desc: "Review infra projects" }
                            ].map((item) => (
                                <Button key={item.label} variant="outline" onClick={() => handleQuickSearch(item.query)}
                                    className="h-32 rounded-[2rem] border-border/50 bg-card/40 backdrop-blur-md flex-col items-start p-6 gap-1 transition-all hover:border-acm-blue hover:bg-acm-blue/5 group text-left shadow-lg">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-acm-blue mb-1">{item.label}</span>
                                    <div className="flex items-center justify-between w-full">
                                        <span className="text-xs font-bold text-slate-400 group-hover:text-white transition-colors">{item.desc}</span>
                                        <ChevronRight className="h-5 w-5 text-acm-blue/30 group-hover:text-acm-blue transition-all group-hover:translate-x-1" />
                                    </div>
                                </Button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function SearchPage() {
    return (
        <Layout>
            <SearchContent />
        </Layout>
    );
}
