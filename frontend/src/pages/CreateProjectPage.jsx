import Layout from "@/components/Layout";
import ProjectForm from "@/features/projects/components/ProjectForm";

export default function CreateProjectPage() {
    return (
        <Layout>
            <div className="container mx-auto px-4 py-8">
                <ProjectForm />
            </div>
        </Layout>
    );
}
