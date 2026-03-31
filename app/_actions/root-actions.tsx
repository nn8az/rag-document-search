'use server';
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createHash } from 'crypto';

import { jwtVerify } from 'jose';
import { TokenTextSplitter } from "@langchain/textsplitters";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

export async function debugServerAction() {
    revalidatePath('/');
}

export interface UploadFileResult {
    success: boolean;
    message?: string;
    error?: string;
}
export async function uploadFileServerAction(formData: FormData): Promise<UploadFileResult> {
    const userId = await getUUIDFromSession();

    const file = formData.get('file') as File;
    if (!file) {
        return { success: false, message: "No file uploaded" };
    }
    if (file.size > 5 * 1024 * 1024) {
        return { success: false, message: "File size exceeds 5MB limit" };
    }
    if (file.type !== "application/pdf" && file.type !== "text/plain") {
        return { success: false, message: "Invalid file type. Only PDF and TXT are allowed." };
    }

    let text = "";

    if (file.type === 'application/pdf') {
        const loader = new PDFLoader(file, {
            splitPages: true,
        });

        let pageCount = 0;
        const docs = await loader.load();
        pageCount = docs.length;

        if (pageCount > 100) {
            return { success: false, error: `Document has ${pageCount} pages. Maximum allowed is 100.` };
        }

        text = docs.map(doc => doc.pageContent).join("\n");
    } else if (file.type === 'text/plain') {
        text = await file.text();
    }

    // LangChain Chunking Logic
    // 256 tokens with 10% overlap
    const splitter = new TokenTextSplitter({
      encodingName: "gpt2", 
      chunkSize: 256,
      chunkOverlap: 25,
    });

    const chunks = await splitter.createDocuments([text]);

    // Save your chunks to RDS here...

    revalidatePath('/');
    return { success: true };
}

// #region Helper Functions
async function getUUIDFromSession() {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;
    if (!token) return null;

    try {
        const { payload } = await jwtVerify(
            token,
            new TextEncoder().encode(process.env.JWT_SECRET)
        );
        return payload.userId as string;
    } catch (err) {
        return null;
    }
}

/**
 * Generates a SHA-256 checksum for a file from a Web Stream (standard in Next.js)
 */
async function getFileChecksum(file: File): Promise<string> {
  const hash = createHash('sha256');
  const reader = file.stream().getReader();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    hash.update(value);
  }

  return hash.digest('hex');
}
// #endregion