

export function extractFileKey(url: string | undefined | null): string | null {
  if (!url) return null;

  /**
   * This regex looks for "/f/" and captures everything after it 
   * until it hits a question mark (query params) or the end of the string.
   */
  const match = url.match(/\/f\/([^?#]+)/);

  return match ? match[1] : null;
}