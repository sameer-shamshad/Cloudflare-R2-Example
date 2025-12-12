import { nanoid } from "nanoid";

/**
 * Generates a random 4-digit number using nanoid
**/
export const generateUniqueId = async (): Promise<string> => {
  return nanoid(4);
};

/**
 * Generates a unique filename by appending a 4-digit ID if the file exists
 */
export const generateUniqueFileName = async (originalName: string, uniqueId: string): Promise<string> => {
  const lastDotIndex = originalName.lastIndexOf('.');
  if (lastDotIndex === -1) {
    return `${originalName}-${uniqueId}`;
  }
  const name = originalName.substring(0, lastDotIndex);
  const extension = originalName.substring(lastDotIndex);
  return `${name}-${uniqueId}${extension}`;
};
