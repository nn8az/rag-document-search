'use client';

import { createContext, useContext, useState, useTransition } from "react";
import { uploadFileServerAction, deleteFileServerAction, BasicServerActionResult } from "../_actions/root-actions";

// #region Typings
interface RootPageServerStates {
  // Put data that are initialized on the server and needed on the client here.
}
interface RootPageClientStates {
  isDeleting: boolean;
}
interface RootPageEventHandlers {
  onFileUpload: (formData: FormData) => Promise<BasicServerActionResult>;
  onFileDelete: (formData: FormData) => Promise<void>;
}
interface RootPageContext {
  server: RootPageServerStates;
  client: RootPageClientStates;
  handlers: RootPageEventHandlers;
}
// #endregion

const RootPageContext = createContext<RootPageContext | undefined>(undefined);

export function RootPageContextProvider({ children }: { children: React.ReactNode }) {
  /**
   * Track whether file deletion is in progress. Used to disable all delete buttons while deletion is currently in progress.
   */
  const [isDeleting, startDeleteTransition] = useTransition();

  /**
   * Handles when the user uploads a file.
   * @param formData The form data containing the file to be uploaded.
   * @returns The result of the file upload operation, including success status and any relevant messages.
   */
  async function onFileUpload(formData: FormData): Promise<BasicServerActionResult> {
    const result = await uploadFileServerAction(formData);
    return result;
  }

  /**
   * Handles when the user deletes an uploaded file.
   * @param formData The form data containing the file ID to be deleted.
   */
  async function onFileDelete(formData: FormData): Promise<void> {
    const fileId = Number(formData.get("fileId"));
    startDeleteTransition(async () => {
      await deleteFileServerAction(fileId);
    });
    return;
  }

  const context = {
    server: {},
    client: {
      isDeleting
    },
    handlers: {
      onFileUpload,
      onFileDelete,
    }
  }

  return (
    <RootPageContext.Provider value={context}>
      {children}
    </RootPageContext.Provider>
  );
}

/**
 * A custom hook to access the root page context.
 * @returns The context for the root page.
 */
export function useRootPageContext() {
  const context = useContext(RootPageContext);
  if (!context) throw new Error("useRootPageContext() must be used within RootPageContextProvider");
  return context;
}