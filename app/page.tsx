import { cookies } from "next/headers";
import { jwtVerify } from 'jose';
import { DebugServerActionButton } from "@/app/_components/DebugServerActionButton";
import { FileUploadDropZone } from "@/app/_components/FileUploadDropZone";
import { RootPageContextProvider } from "./_components/root-context";

import Image from "next/image";

export default async function Home() {
  const cookie = await cookies();
  const token = cookie.get("session")?.value;
  let displayedUUID = "No session cookie found";

  if (token) {
    try {
      const { payload } = await jwtVerify(
        token,
        new TextEncoder().encode(process.env.JWT_SECRET)
      );
      displayedUUID = payload.userId as string; // This contains your UUID: payload.userId
    }
    catch (err) {
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-7xl flex-col items-center justify-between py-8 px-16 bg-white dark:bg-black sm:items-start">
        <RootPageContextProvider>
          <FileUploadDropZone />
          <DebugServerActionButton />
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            UUID: {displayedUUID}
          </h1>
        </RootPageContextProvider>
      </main>
    </div>
  );
}
