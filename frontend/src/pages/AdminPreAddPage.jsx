import ProjectForm from "@/features/projects/components/ProjectForm";
import { Shield, CheckCircle2 } from "lucide-react";

export default function AdminPreAddPage() {
    return (
        <div className="space-y-12">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-acm-blue flex items-center justify-center shadow-lg shadow-acm-blue/20">
                        <Shield className="text-white h-7 w-7" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black tracking-tight uppercase italic">Pre-add Project</h1>
                        <p className="text-muted-foreground font-medium flex items-center gap-1.5">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Administrative Submission Override
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl">
                <ProjectForm isAdmin={true} />
            </div>
        </div>
    );
}
