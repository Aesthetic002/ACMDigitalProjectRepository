"use client";

import { Navigation } from "@/components/sections/Navigation";
import { Footer } from "@/components/sections/Footer";

export default function DashboardLayout({ children }) {
    return (
        <div className="flex flex-col min-h-screen">
            <Navigation />
            <div className="flex flex-1 pt-16">
                {/* We can add a sidebar here later if needed */}
                <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
            <Footer />
        </div>
    );
}
