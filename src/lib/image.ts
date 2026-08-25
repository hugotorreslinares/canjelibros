// Covers are stored inline in the book document as a data URL, not in Cloud Storage:
// since February 2026 a Storage bucket requires a billing account even for a few
// kilobytes, and this app is meant to run on the free tier. That trade means every
// cover travels with every books snapshot, so the budget below is deliberately tight —
// a Firestore document caps at 1 MiB, and the catalog loads every book at once.
export const MAX_COVER_CHARS = 120_000;
const MAX_UPLOAD_BYTES = 12 * 1024 * 1024;
const MAX_EDGE_PX = 520;
const QUALITY_STEPS = [0.72, 0.6, 0.5, 0.42];

export class CoverError extends Error {}

function drawScaled(bitmap: ImageBitmap, maxEdge: number): HTMLCanvasElement {
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new CoverError("Tu navegador no pudo procesar la imagen.");
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvas;
}

// Re-encodes at falling quality, then at a smaller size, until the data URL fits the
// budget. Returns JPEG regardless of input format: PNG screenshots of a cover would
// blow past the budget at any quality.
export async function fileToCoverDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new CoverError("El archivo no es una imagen.");
  if (file.size > MAX_UPLOAD_BYTES) throw new CoverError("La foto pesa más de 12 MB. Usa una más liviana.");

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new CoverError("No se pudo leer la imagen. Prueba con un JPG o un PNG.");
  }

  try {
    for (const maxEdge of [MAX_EDGE_PX, 400, 320]) {
      const canvas = drawScaled(bitmap, maxEdge);
      for (const quality of QUALITY_STEPS) {
        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        if (dataUrl.length <= MAX_COVER_CHARS) return dataUrl;
      }
    }
  } finally {
    bitmap.close();
  }

  throw new CoverError("No pudimos comprimir la foto lo suficiente. Prueba con otra.");
}
