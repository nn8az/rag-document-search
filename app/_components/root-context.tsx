'use client';

import { createContext, useContext } from "react";
import { uploadFileServerAction, UploadFileResult } from "../_actions/root-actions";

interface RootPageInitialData {
  // Put data that are initialized on the server and needed on the client here.
}
interface RootPageContext extends RootPageInitialData {
  onFileUpload: (formData: FormData) => Promise<UploadFileResult>;
}

const RootPageContext: React.Context<RootPageContext | undefined> = createContext<RootPageContext | undefined>(undefined);

export function RootPageContextProvider({ data, children }: { data?: RootPageInitialData, children: React.ReactNode }) {
  // #region Client States
  // #endregion

  // #region Event Handlers
  async function onFileUpload(formData: FormData) {
    const result = await uploadFileServerAction(formData);
    return result;
  }
  // #endregion

  return (
    <RootPageContext.Provider value={{ onFileUpload }}>
      {children}
    </RootPageContext.Provider>
  );
}

export function useRootPageContext() {
  const context = useContext(RootPageContext);
  if (!context) throw new Error("useRootPageContext must be used within RootPageContextProvider");
  return context;
}