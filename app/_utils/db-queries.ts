import * as schema from "@/database/schema"
import { db } from "@/database/index";
import { eq, and } from 'drizzle-orm';

/**
 * Load the uploaded files for the given user.
 * @param uuid The user's uuid
 * @returns An array of files metadata that the user has uploaded.
 */
export async function loadFiles(uuid: string) {
  const result = await db
    .select()
    .from(schema.files)
    .where(eq(schema.files.uuid, uuid));
  result.sort((a, b) => a.timeToLive.getTime() - b.timeToLive.getTime());
  return result;
}

/**
 * Deletes a file from the database.
 * @param fileId The ID of the file to delete.
 * @param uuid The user's uuid.
 */
export async function deleteFile(fileId: number, uuid: string) {
  const result = await db
    .delete(schema.files)
    .where(and(
      eq(schema.files.fileId, fileId),
      eq(schema.files.uuid, uuid)
    ));
  return result;
}