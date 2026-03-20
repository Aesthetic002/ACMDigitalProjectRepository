"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { searchAPI } from "@/services/api";
import ProjectCard from "@/components/project/ProjectCard";
import {
    Search as SearchIcon, Loader2, Filter, X, FolderOpen,
    ChevronRight, TrendingUp, Sparkles
} from "lucide-react";
import ProjectCardSkeleton from "@/components/project/ProjectCardSkeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function SearchContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const query = searchParams.get("q") || "";

    const [searchInput, setSearchInput] = useState(query);
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        techStack: searchParams.get("tech") || "",
        status: searchParams.get("status") || "",
    });

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
        router.push(`/search?${params.toString()}`);
    };

    const handleQuickSearch = (term) => {
        setSearchInput(term);
        router.push(`/search?q=${encodeURIComponent(term)}`);
    };

    const clearFilters = () => {
        setFilters({ techStack: "", status: "" });
        if (query) router.push(`/search?q=${encodeURIComponent(query)}`);
    };

    const hasActiveFilters = filters.techStack || filters.status;

    return (
        <div className="min-h-screen bg-background/50 pb-20">
            <section className="relative border-b border-border/50 bg-slate-950 py-16 lg:py-24">
                <div className="absolute inset-x-0 top-0 h-full bg-gradient-to-b from-primary/5 to-transparent" />
                <div className="container relative mx-auto px-4">
                    <div className="mx-auto max-w-4xl text-center">
                        <h1 className="mb-8 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
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
                                    <Button type="submit" className="h-14 rounded-2xl bg-acm-blue px-8 text-lg font-bold hover:bg-acm-blue-dark">SEARCH</Button>
                                </div>
                            </div>

                            {showFilters && (
                                <div className="mt-4 overflow-hidden rounded-3xl border border-border/50 bg-card p-6 text-left shadow-xl">
                                    <div className="mb-4 flex items-center justify-between">
                                        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Advanced Filters</h3>
                                        {hasActiveFilters && (
                                            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 text-[10px] font-black tracking-tighter hover:text-red-500">
                                                <X className="mr-1 h-3 w-3" /> RESET FILTERS
                                            </Button>
                                        )}
                                    </div>
                                    <div className="grid gap-6 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-foreground">Technology</label>
                                            <Input placeholder="e.g. React, Python" value={filters.techStack}
                                                onChange={(e) => setFilters(f => ({ ...f, techStack: e.target.value }))}
                                                className="h-10 border-border/50 bg-muted/30 rounded-xl" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-foreground">Visibility Status</label>
                                            <Select value={filters.status || "all"} onValueChange={(v) => setFilters(f => ({ ...f, status: v === "all" ? "" : v }))}>
                                                <SelectTrigger className="h-10 border-border/50 bg-muted/30 rounded-xl"><SelectValue placeholder="All Statuses" /></SelectTrigger>
                                                <SelectContent className="rounded-xl">
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
                            <div className="mt-8 flex flex-wrap justify-center gap-2">
                                <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground mr-2">
                                    <TrendingUp className="h-3 w-3" /> Suggested:
                                </span>
                                {["Machine Learning", "Next.js", "Firebase", "Data Visualization", "Security"].map((tag) => (
                                    <button key={tag} onClick={() => handleQuickSearch(tag)}
                                        className="rounded-full border border-border/50 bg-card/30 px-4 py-1.5 text-xs font-medium text-slate-300 transition-all hover:border-acm-blue/50 hover:bg-acm-blue/5 hover:text-white">
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <div className="container mx-auto px-4 py-12">
                {query ? (
                    <div className="mx-auto max-w-5xl">
                        <div className="mb-10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-acm-blue/10">
                                    <Sparkles className="h-5 w-5 text-acm-blue" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold">Search Results</h2>
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-none mt-1">
                                        {isLoading ? "Searching..." : `${results.length} results found for "${query}"`}
                                    </p>
                                </div>
                            </div>
                            {!isLoading && results.length > 0 && (
                                <Badge variant="outline" className="border-border/50 text-muted-foreground">Sorted by Relevance</Badge>
                            )}
                        </div>

                        {isLoading ? (
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {[1, 2, 3].map((i) => <ProjectCardSkeleton key={i} />)}
                            </div>
                        ) : results.length === 0 ? (
                            <div className="flex min-h-[400px] flex-col items-center justify-center rounded-[3rem] border border-dashed border-border p-12 text-center">
                                <div className="mb-6 rounded-full bg-muted p-4"><FolderOpen className="h-10 w-10 text-muted-foreground" /></div>
                                <h3 className="text-2xl font-bold">No projects matched.</h3>
                                <p className="mt-2 text-muted-foreground max-w-xs mx-auto">Try broad keywords or removing filters.</p>
                                <div className="mt-8 flex gap-3">
                                    <Button variant="outline" onClick={() => router.push("/projects")} className="rounded-2xl px-6">Browse All</Button>
                                    <Button variant="secondary" onClick={() => { setSearchInput(""); router.push("/search"); }} className="rounded-2xl px-6">Clear Search</Button>
                                </div>
                            </div>
                        ) : (
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {results.map((project) => <ProjectCard key={project.id} project={project} />)}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="mx-auto max-w-4xl text-center py-20">
                        <div className="inline-flex h-20 w-20 items-center justify-center rounded-[2rem] bg-acm-blue/5 mb-8">
                            <SearchIcon className="h-10 w-10 text-acm-blue/40" />
                        </div>
                        <h2 className="text-2xl font-bold mb-4">Start your discovery</h2>
                        <p className="text-muted-foreground max-w-sm mx-auto mb-10">
                            Input a member name, a technology like 'Python', or a project title to search the entire digital archive.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {[{ label: "Popular Web Apps", query: "Web" }, { label: "Data Science", query: "Data" }, { label: "Cloud Solutions", query: "Cloud" }].map((item) => (
                                <Button key={item.label} variant="outline" onClick={() => handleQuickSearch(item.query)}
                                    className="h-20 rounded-3xl border-border/50 flex-col gap-1 transition-all hover:border-acm-blue hover:bg-acm-blue/10">
                                    <span className="text-xs font-black uppercase tracking-[0.1em]">{item.label}</span>
                                    <ChevronRight className="h-4 w-4 text-acm-blue" />
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
        <SearchContent />
    );
}
