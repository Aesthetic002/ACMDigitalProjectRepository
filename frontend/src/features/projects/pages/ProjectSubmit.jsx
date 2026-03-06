'use client';

import ProjectForm from '../components/ProjectForm';

/**
 * Feature-based Project Submission Page
 * Simple shell that renders the ProjectForm component.
 */
export default function ProjectSubmit() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <ProjectForm />
        </div>
    );
}
