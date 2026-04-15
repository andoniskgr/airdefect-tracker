/**
 * Clipboard image → data URL for note content (Firestore string field).
 * JPEG re-encode keeps documents smaller and under the ~1MB doc limit.
 */

const MAX_EDGE = 1600;
const JPEG_QUALITY = 0.82;

export function getImageBlobFromClipboard(event: ClipboardEvent): Blob | null {
  const items = event.clipboardData?.items;
  if (!items?.length) return null;
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.kind === "file" && item.type.startsWith("image/")) {
      const file = item.getAsFile();
      if (file) return file;
    }
  }
  return null;
}

function readBlobAsDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error ?? new Error("read failed"));
    reader.readAsDataURL(blob);
  });
}

export async function imageBlobToCompressedJpegDataUrl(blob: Blob): Promise<string> {
  const objectUrl = URL.createObjectURL(blob);
  try {
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("image decode"));
      img.src = objectUrl;
    });

    let width = img.naturalWidth;
    let height = img.naturalHeight;
    if (width < 1 || height < 1) {
      return readBlobAsDataUrl(blob);
    }

    if (width > MAX_EDGE || height > MAX_EDGE) {
      if (width > height) {
        height = Math.round((height * MAX_EDGE) / width);
        width = MAX_EDGE;
      } else {
        width = Math.round((width * MAX_EDGE) / height);
        height = MAX_EDGE;
      }
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return readBlobAsDataUrl(blob);

    ctx.drawImage(img, 0, 0, width, height);
    return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
  } catch {
    return readBlobAsDataUrl(blob);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

/** Firestore document size is ~1 MiB; leave headroom for other fields. */
export const NOTE_CONTENT_MAX_CHARS = 950_000;
