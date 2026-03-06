'use client';

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { projectsAPI } from '@/services/api';
import ProjectForm from '@/components/ProjectForm';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function EditProjectPage({ params: paramsPromise }) {
    const params = use(paramsPromise);
    const projectId = params.id;
    const router = useRouter();

    const { data, isLoading, isError } = useQuery({
        queryKey: ['project', projectId],
        queryFn: () => projectsAPI.getById(projectId),
        enabled: !!projectId,
    });

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-acm-blue" />
            </div>
        );
    }

    if (isError || !data?.data?.project) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
                <div className="mb-6 rounded-full bg-red-500/10 p-4">
                    <AlertCircle className="h-10 w-10 text-red-500" />
                </div>
                <h2 className="text-2xl font-bold">Failed to load project</h2>
                <p className="mt-2 text-muted-foreground">The project data could not be retrieved.</p>
                <Button onClick={() => router.back()} className="mt-6">Go Back</Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <ProjectForm initialData={data.data.project} projectId={projectId} />
        </div>
    );
}
