"use client";

import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";

import { useRootPageContext } from "./root-context";

export function FileTableDeleteButton({fileId}: {fileId: number}): React.JSX.Element {
    const rootPageContext = useRootPageContext();
    const { isDeleting } = rootPageContext.client;
    const { onFileDelete } = rootPageContext.handlers;

    return (
        <form className="inline" action={onFileDelete}>
            <input type="hidden" name="fileId" value={fileId} />
            <Button type="submit" variant="destructive" size="icon" disabled={isDeleting}>
                {isDeleting ? <Loader2 className="text-muted-foreground animate-spin" /> : <Trash2/>}
            </Button>
        </form>
    );
}