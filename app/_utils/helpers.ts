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
 * Gets the user-friendly string displaying the file size limit. (e.g., "5MB")
 * @returns The user-friendly string for the file size limit.
 */
export function getFileSizeLimitString() {
  // parseFloat() is used to remove trailing zeros after the decimal point (e.g., "5.00" -> "5")
  return parseFloat((fileSizeLimit / (1024 * 1024)).toFixed(2)) + "MB";
}

/**
 * Gets the user-friendly string displaying the file character limit. (e.g., "300,000")
 * @returns The user-friendly string for the file character limit.
 */
export function getFileCharacterLimitString() {
  return fileCharacterLimit.toLocaleString();
}