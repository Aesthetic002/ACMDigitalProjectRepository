import { ProjectDetailContent } from "./ProjectDetailPage";

export default function AdminProjectDetailPage() {
    return (
        <div className="w-full h-full relative">
            <ProjectDetailContent backUrl="/admin/projects" />
        </div>
    );
}
