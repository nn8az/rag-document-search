'use server';
import { revalidatePath } from "next/cache";
import { createHash } from 'crypto';

import { TokenTextSplitter } from "@langchain/textsplitters";
import { PDFParse } from "pdf-parse";

import * as helpers from "@/app/_utils/helpers";

import * as schema from "@/database/schema";
import { db } from "@/database/index";

// #region Server Actions
export async function debugServerAction() {
  revalidatePath('/');
}

export interface UploadFileResult {
  success: boolean;
  message?: string
}

/**
 * Server Action for handling file upload
 * 
 * @param formData The form data containing the uploaded file
 * @returns The JSON object describing the result of the saving operation
 */
export async function uploadFileServerAction(formData: FormData): Promise<UploadFileResult> {
  const uuid = await helpers.getUUID();
  if (!uuid) {
    revalidatePath('/');
    return { success: false };
  }

  const file = formData.get('file') as File;
  const fileName = file.name.toLowerCase();
  const fileType = fileName.split('.').pop();
  if (!file) {
    return { success: false, message: "No file uploaded" };
  }
  if (file.size > helpers.fileSizeLimit) {
    const fileSizeInMB = (helpers.fileSizeLimit / (1024 * 1024)).toFixed(2);
    return { success: false, message: `File exceeds ${fileSizeInMB}MB limit` };
  }
  if (fileType !== 'pdf' && fileType !== 'txt') {
    return { success: false, message: "Invalid file type. Only .pdf and .txt files are allowed." };
  }

  const checksum = await getFileChecksum(file);

  // check if file with the same checksum already exists for this user

  let text = "";

  if (fileType === 'pdf') {
    text = await extractTextFromPDFWithPdfParse(file);
  } else if (fileType === 'txt') {
    text = await file.text();
  }

  if (text.length > helpers.fileCharacterLimit) {
    return { success: false, message: `File exceeds ${helpers.fileCharacterLimit} characters limit.` };
  }

  const splitter = new TokenTextSplitter({
    encodingName: "gpt2",
    chunkSize: 512,
    chunkOverlap: 51,
  });

  const chunks = await splitter.createDocuments([text]);
  const textChunks = chunks.map(chunk => chunk.pageContent);
  
  try {
    await saveUploadedFileToDatabase(textChunks, fileName, fileType, uuid, checksum)
  } catch(error) {
    return { success: false, message: "Error saving file to database." };
  }

  revalidatePath('/');
  return { success: true };
}
// #endregion

// #region Helper Functions
/**
 * Generates a SHA-256 checksum for a file from a Web Stream
 * 
 * @param file The file for which to generate the checksum
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
 * Extract text from PDF using the pdf-parse library. \n, \r, and \t characters are removed. Leading and trailing whitespace is also trimmed.
 * 
 * @param file The PDF file to extract text from
 * @return The extracted text from the PDF.
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

/**
 * Saves the chunks to the database, associating them with the fileId.
 * 
 * @param chunks The array of text chunks to save
 * @param uuid The UUID of the user uploading the file
 * @param checksum The checksum of the file being uploaded
 */
async function saveUploadedFileToDatabase(chunks: string[], filename: string, fileType: string, uuid: string, checksum: string) {
  if (chunks.length === 0) {
    throw new Error("NO_CHUNKS_TO_SAVE");
  }

  await db.transaction(async (tx) => {
    // save a file record
    const [savedFile] = await tx.insert(schema.files).values({
      uuid,
      filename,
      fileType,
      checksum,
      chunkCount: chunks.length,
    }).returning({ fileId: schema.files.fileId });
    if (!savedFile) {
      throw new Error("FILE_INSERTION_FAILED");
    }

    // save chunk records
    const chunksToInsert = chunks.map(chunk => ({
      fileId: savedFile.fileId,
      rawText: chunk
    }))
    await tx.insert(schema.chunks).values(chunksToInsert);

  });
  return;
}
// #endregion