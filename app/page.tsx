import React from "react";

import { DebugServerActionButton } from "@/app/_components/DebugServerActionButton";
import { FileUploadDropZone } from "@/app/_components/FileUploadDropZone";
import { RootPageContextProvider } from "./_components/root-context";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import * as helpers from "@/app/_utils/helpers";
import * as schema from "@/database/schema"
import * as dbQueries from "@/app/_utils/db-queries";

/**
 * Load the uploaded files for the given user.
 * @param uuid The UUID of the user.
 * @returns A list of uploaded files for the user.
 */
async function loadData(uuid: string) {
  const result = await dbQueries.loadUploadedFiles(uuid);
  return result;
}
type FileData = Awaited<ReturnType<typeof loadData>>[number];

/**
 * Renders a table of uploaded files.
 * @param data 
 * @returns React element of the rendered page
 */
function FileTable({ data }: { data: FileData[] }): React.JSX.Element {
  if (data.length === 0) {
    return <p className="text-gray-500">No uploaded files.</p>;
  }

  return <div>
    <h1 className="text-xl font-semibold text-center">Uploaded Files</h1>
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Filename</TableHead>
            <TableHead>Expiration Date</TableHead>
            <TableHead>Processing Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((file) => (
            <TableRow key={file.fileId}>
              <TableCell>{file.filename}</TableCell>
              <TableCell>{file.timeToLive.toLocaleString()}</TableCell>
              <TableCell className={getFileStatusBackgroundColor(file.embeddingStatus)}>
                {getFileStatusDisplayText(file.embeddingStatus)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  </div>
}

/**
 * Get the display text for the given file status.
 * @param status The embedding status of the file.
 * @returns The text to display for the given embedding status.
 */
function getFileStatusDisplayText(status: schema.embeddingStatus): string {
  const displayTextMap = {
    "not_started": "Not Started",
    "pending": "Pending",
    "done": "Done",
    "error": "Error"
  }
  return displayTextMap[status];
}

/**
 * Get the background color class for the given file status.
 * @param status The embedding status of the file.
 * @returns The background color class for the given embedding status.
 */
function getFileStatusBackgroundColor(status: schema.embeddingStatus): string {
  const colorMap = {
    "not_started": "bg-gray-500",
    "pending": "bg-yellow-500",
    "done": "bg-green-500",
    "error": "bg-red-500"
  }
  return colorMap[status];
}

/**
 * Renders the main page
 * @returns React element of the rendered page
 */
export default async function Home(): Promise<React.JSX.Element> {
  const uuid = await helpers.getUUID();
  let data: FileData[] = [];
  if (uuid) {
    data = await loadData(uuid);
  }
  
  const uuidMsg = uuid ? `UUID: ${uuid}` : "No UUID found";

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-7xl flex-col items-center justify-between py-8 px-16 bg-white dark:bg-black sm:items-start">
        <RootPageContextProvider>
          <FileUploadDropZone disabled={data.length > helpers.uploadCountLimit} />
          <DebugServerActionButton />
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            {uuidMsg}
          </h1>
          <FileTable data={data} />
        </RootPageContextProvider>
      </main>
    </div>
  );
}
