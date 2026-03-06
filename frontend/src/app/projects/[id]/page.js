import PublicLayout from '@/layouts/PublicLayout';
import { use } from 'react';
import ProjectDetails from '@/features/projects/pages/ProjectDetails';

export default function ProjectDetailPage({ params: paramsPromise }) {
    const params = use(paramsPromise);
    const projectId = params.id;

    return (
        <PublicLayout>
            <ProjectDetails projectId={projectId} />
        </PublicLayout>
    );
}
