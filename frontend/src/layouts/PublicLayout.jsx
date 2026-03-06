"use client";

import { Navigation } from "@/components/sections/Navigation";
import { Footer } from "@/components/sections/Footer";

export default function PublicLayout({ children }) {
    return (
        <div className="flex flex-col min-h-screen">
            <Navigation />
            <main className="flex-grow pt-20">
                {children}
            </main>
            <Footer />
        </div>
    );
}
