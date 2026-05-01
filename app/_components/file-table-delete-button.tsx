"use client";

import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export function FileTableDeleteButton({fileId}: {fileId: number}): React.JSX.Element {
    return (
        <form className="inline">
            <input type="hidden" name="fileId" value={fileId} />
            <Button type="submit" variant="destructive" size="icon">
                <Trash2 />
            </Button>
        </form>
    );
}
