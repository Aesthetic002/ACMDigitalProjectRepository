'use client';

import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Users, Calendar, ArrowUpRight, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';

export default function ProjectCard({ project }) {
    const statusColors = {
        pending: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
        approved: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
        rejected: 'bg-red-500/10 text-red-500 border-red-500/20',
    };

    return (
        <Card className="group overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:shadow-acm-glow hover:border-acm-blue/50">
            {/* Project Image/Preview */}
            <div className="relative h-48 overflow-hidden bg-muted">
                {project.thumbnail ? (
                    <img
                        src={project.thumbnail}
                        alt={project.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-acm-blue/20 to-acm-blue/5">
                        <div className="text-6xl opacity-20 transform transition-transform duration-500 group-hover:scale-125">
                            {project.techStack?.[0]?.charAt(0) || '🚀'}
                        </div>
                    </div>
                )}

                {/* Featured badge */}
                {project.isFeatured && (
                    <div className="absolute top-3 left-3 z-10">
                        <Badge className="bg-amber-500 text-amber-950 hover:bg-amber-500/90 gap-1 border-none px-2 py-0.5">
                            <Star className="h-3 w-3 fill-current" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Featured</span>
                        </Badge>
                    </div>
                )}

                {/* Status badge */}
                <div className="absolute top-3 right-3 z-10">
                    <Badge variant="outline" className={`${statusColors[project.status] || 'bg-blue-500/10 text-blue-500 border-blue-500/20'} capitalize text-[10px] font-medium`}>
                        {project.status}
                    </Badge>
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-40" />
            </div>

            <CardHeader className="p-5 pb-0">
                <Link href={`/projects/${project.id}`}>
                    <h3 className="line-clamp-1 text-lg font-bold tracking-tight text-foreground transition-colors group-hover:text-acm-blue">
                        {project.title}
                    </h3>
                </Link>
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground leading-relaxed">
                    {project.description}
                </p>
            </CardHeader>

            <CardContent className="p-5 pt-4">
                {/* Tech Stack */}
                <div className="flex flex-wrap gap-1.5">
                    {project.techStack?.slice(0, 3).map((tech, index) => (
                        <Badge
                            key={index}
                            variant="secondary"
                            className="bg-acm-blue/10 text-acm-blue hover:bg-acm-blue/20 border-none text-[10px] py-0 h-5"
                        >
                            {tech}
                        </Badge>
                    ))}
                    {project.techStack?.length > 3 && (
                        <span className="text-[10px] text-muted-foreground self-center ml-1">
                            +{project.techStack.length - 3} more
                        </span>
                    )}
                </div>
            </CardContent>

            <CardFooter className="flex items-center justify-between p-5 pt-0 mt-auto border-t border-border/50">
                <div className="flex items-center space-x-3 text-[10px] text-muted-foreground">
                    {project.contributors?.length > 0 && (
                        <span className="flex items-center gap-1 font-medium">
                            <Users className="h-3 w-3 text-acm-blue/70" />
                            <span>{project.contributors.length}</span>
                        </span>
                    )}
                    <span className="flex items-center gap-1 font-medium">
                        <Calendar className="h-3 w-3 text-acm-blue/70" />
                        <span>
                            {project.createdAt
                                ? formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })
                                : 'Recently'}
                        </span>
                    </span>
                </div>

                <Link
                    href={`/projects/${project.id}`}
                    className="flex items-center gap-1 text-[11px] font-bold text-acm-blue transition-colors hover:text-acm-blue-dark"
                >
                    <span>VIEW</span>
                    <ArrowUpRight className="h-3 w-3" />
                </Link>
            </CardFooter>
        </Card>
    );
}
