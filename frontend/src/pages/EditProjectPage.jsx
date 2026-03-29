import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { projectsAPI } from '@/services/api';
import ProjectForm from '@/features/projects/components/ProjectForm';
import Layout from '@/components/Layout';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function EditProjectPage() {
    const { id } = useParams();

    const { data: projectData, isLoading, isError, error } = useQuery({
        queryKey: ['project', id],
        queryFn: () => projectsAPI.getById(id),
        enabled: !!id,
    });

    const project = projectData?.data?.project;

    return (
        <Layout>
            <div className="container mx-auto px-4 py-12">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                        <Loader2 className="h-12 w-12 animate-spin text-acm-blue" />
                        <p className="text-muted-foreground font-bold animate-pulse uppercase tracking-widest text-xs">Retrieving Project Data...</p>
                    </div>
                ) : isError || !project ? (
                    <div className="flex flex-col items-center justify-center min-h-[400px] text-center max-w-md mx-auto">
                        <div className="h-20 w-20 rounded-3xl bg-red-500/10 flex items-center justify-center mb-6">
                            <AlertCircle className="h-10 w-10 text-red-500" />
                        </div>
                        <h2 className="text-2xl font-black uppercase italic mb-2">Access Denied or Not Found</h2>
                        <p className="text-muted-foreground mb-8">The requested project could not be retrieved from the archive. It may have been moved or you lack the necessary clearance.</p>
                        <Button asChild className="rounded-2xl h-12 px-8 bg-acm-blue hover:bg-acm-blue-dark">
                            <Link to="/profile">REVERT TO PROFILE</Link>
                        </Button>
                    </div>
                ) : (
                    <div className="max-w-4xl mx-auto">
                        <ProjectForm initialData={project} projectId={id} />
                    </div>
                )}
            </div>
        </Layout>
    );
}
