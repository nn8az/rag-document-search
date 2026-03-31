'use client';

import { debugServerAction } from "@/app/_actions/root-actions";

export function DebugServerActionButton() {
    return (
        <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            onClick={()=>{debugServerAction()}}
        >
            Triggers the debug server action
        </button>
    );
}