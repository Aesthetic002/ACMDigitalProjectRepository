"use client";

import { DomainDistribution } from "@/features/projects/components/DomainDistribution";

export default function DomainsPage() {
    return (
        <div className="py-12">
            <div className="container mx-auto px-4 mb-8 text-center">
                <h1 className="text-4xl font-black tracking-tight mb-4 uppercase italic">Technical Domains</h1>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    Our chapter fosters expertise across multiple technology sectors, providing specialized tracks for member growth.
                </p>
            </div>
            <DomainDistribution />
        </div>
    );
}
