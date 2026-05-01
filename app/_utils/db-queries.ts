import * as schema from "@/database/schema"
import { db } from "@/database/index";
import { eq } from 'drizzle-orm';

/**
 * Load the uploaded files for the given user.
 * @param uuid The user's uuid
 * @returns An array of files metadata that the user has uploaded.
 */
export async function loadUploadedFiles(uuid: string) {
  const result = await db
    .select()
    .from(schema.files)
    .where(eq(schema.files.uuid, uuid));
  result.sort((a, b) => a.timeToLive.getTime() - b.timeToLive.getTime());
  return result;
}
