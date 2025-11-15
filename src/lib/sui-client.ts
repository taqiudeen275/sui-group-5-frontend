/**
 * Sui Client Utilities
 */

export function parseObjectContent<T>(obj: any): T | null {
  if (!obj?.data?.content?.fields) {
    return null;
  }
  return obj.data.content.fields as T;
}

export function extractObjectId(obj: any): string | null {
  if (typeof obj === "string") {
    return obj;
  }
  if (obj?.id) {
    return typeof obj.id === "string" ? obj.id : obj.id.id;
  }
  if (obj?.data?.objectId) {
    return obj.data.objectId;
  }
  return null;
}

export function parseTimestamp(timestamp: string | number): number {
  if (typeof timestamp === "number") {
    return timestamp;
  }
  return parseInt(timestamp, 10);
}
