'use client';

import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";
import React from "react";

export function UploadFileButton() {
    const [isUploading, setIsUploading] = React.useState(false);

    return (
      <Button
        type="button"
        size="lg"
        className="h-16 w-full px-8 text-xl bg-green-600 hover:bg-green-700 text-white transition-colors"
        onClick={() => {setIsUploading(true); setTimeout(() => setIsUploading(false), 2000);}}
        disabled={isUploading}
      >
        {isUploading ? (
          <Loader2 className="mr-2 h-6 w-6 animate-spin" />
        ) : (
          <Plus className="mr-2 h-6 w-6" />
        )}
        {isUploading ? "Uploading..." : "Upload File"}
      </Button>);
    }