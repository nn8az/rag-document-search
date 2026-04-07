'use server';
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createHash } from 'crypto';

import { jwtVerify } from 'jose';
import { TokenTextSplitter } from "@langchain/textsplitters";
import { PDFParse } from "pdf-parse";

// #region Server Actions
export async function debugServerAction() {
  revalidatePath('/');
}

export interface UploadFileResult {
  success: boolean;
  message?: string;
  error?: string;
}

/* server Action for handling file upload */
export async function uploadFileServerAction(formData: FormData): Promise<UploadFileResult> {
  const userId = await getUUIDFromSession();

  const file = formData.get('file') as File;
  const fileName = file.name.toLowerCase();
  if (!file) {
    return { success: false, message: "No file uploaded" };
  }
  if (file.size > 5 * 1024 * 1024) {
    return { success: false, message: "File size exceeds 5MB limit" };
  }
  if (!fileName.endsWith('.pdf') && !fileName.endsWith('.txt')) {
    return { success: false, message: "Invalid file type. Only .pdf and .txt files are allowed." };
  }

  let text = "";

  if (fileName.endsWith('.pdf')) {
    // const arrayBuffer = await file.arrayBuffer();
    // const buffer = Buffer.from(arrayBuffer);
    // const uint8ArrayData = new Uint8Array(arrayBuffer);

    // const parser = new PDFParse({ data: buffer });
    // const pdfData = await parser.getText();
    // text = pdfData?.text || "";
    // parser.destroy();

    text = await extractTextFromPDFWithPdfParse(file);
  } else if (fileName.endsWith('.txt')) {
    text = await file.text();
  }

  if (text.length > 300000) {
    return { success: false, error: "File exceeds 300,000 characters limit." };
  }

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
// #endregion

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
  const reader = file.stream().getReader();

  const hash = createHash('sha256');
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    hash.update(value);
  }

  return hash.digest('hex');
}

/**
 *Extract text from PDF using pdf-parse library
 */
async function extractTextFromPDFWithPdfParse(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const parser = new PDFParse({ data: buffer });
  const pdfData = await parser.getText();
  const text = pdfData?.text || "";
  parser.destroy();

  const cleanText = text
  .replace(/\n/g, ' ')
  .replace(/\r/g, ' ')
  .replace(/\t/g, ' ')
  .trim();

  return cleanText;
}
// #endregion