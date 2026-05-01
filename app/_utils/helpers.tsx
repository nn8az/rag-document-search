import { cookies } from "next/headers";
import { jwtVerify } from 'jose';

/**
 * The maximum number of files a user can upload.
 */
export const uploadCountLimit = 20;

/**
 * The maximum size of a file that can be uploaded.
 */
export const fileSizeLimit = 5 * 1024 * 1024;

/**
 * The maximum number of characters the uploaded file can have.
 */
export const fileCharacterLimit = 300000;

/**
 * Gets the UUID from the session JWT token.
 * @returns The UUID if the token is valid, otherwise undefined.
 */
export async function getUUID() {
  const cookie = await cookies();
  const token = cookie.get("session")?.value;
  let uuid;

  if (token) {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET)
    );
    uuid = payload.userId as string; // This contains your UUID: payload.userId
  }
  return uuid;
}