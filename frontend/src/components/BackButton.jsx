"use client";

import { MoveLeft } from "lucide-react";

export function BackButton() {
    return (
        <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 text-xs font-bold text-acm-blue hover:text-white transition-colors uppercase tracking-[0.2em]"
        >
            <MoveLeft className="h-4 w-4" /> Go back to previous sector
        </button>
    );
}
