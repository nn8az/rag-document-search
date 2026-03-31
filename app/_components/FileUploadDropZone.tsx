"use client";

import * as React from "react";
import { FileText, Loader2, X } from "lucide-react";
import { useRootPageContext } from "./root-context";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadTrigger,
} from "@/components/ui/file-upload";

export function FileUploadDropZone() {
  const { onFileUpload } = useRootPageContext();

  const [files, setFiles] = React.useState<File[]>([]);
  const [isUploading, setIsUploading] = React.useState(false);

  async function onFileChange(files: File[]) {
    if (files.length < 0) return;

    setIsUploading(true);
    
    const formData = new FormData();
    formData.append('file', files[0]);
  
    try {
      await onFileUpload(formData);
    } catch (error) {
      console.error("Upload failed", error);
    }

    setFiles([]);
    setIsUploading(false);
  };

  const onFileReject = React.useCallback((file: File, message: string) => {
    toast.error(message, {
      description: `"${file.name}" was rejected`,
    });
  }, []);

  return (
    <FileUpload
      accept=".pdf,.txt"
      maxFiles={1}
      maxSize={7 * 1024 * 1024}
      className="w-full max-w-md"
      value={files}
      onValueChange={onFileChange}
      onFileReject={onFileReject}
      disabled={isUploading}
    >
      {isUploading ? (
        <FileUploadDropzone className="min-h-[320px]">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="rounded-full border-2 border-dashed border-muted-foreground/25 p-4">
              <Loader2 className="size-8 text-muted-foreground animate-spin" />
            </div>
            <div>
              <p className="font-semibold">Uploading...</p>
            </div>
          </div>
        </FileUploadDropzone>
      ) : (
        <FileUploadDropzone className="min-h-[320px]">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="rounded-full border-2 border-dashed border-muted-foreground/25 p-4">
              <FileText className="size-8 text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold">Drop a document here</p>
              <p className="text-sm text-muted-foreground">
                .pdf, .txt <br/> (max 5MB and 100 pages)
              </p>
            </div>
            <FileUploadTrigger asChild>
              <Button variant="outline">Browse Document</Button>
            </FileUploadTrigger>
          </div>
        </FileUploadDropzone>
      )}
    </FileUpload>
  );
};
