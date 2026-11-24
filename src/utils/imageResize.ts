// Reads an image file and returns it as a small data URL, so team crests stay
// light in ms_sports (the backend accepts up to ~500 KB per image).

export const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];
const MAX_FILE_BYTES = 5 * 1024 * 1024;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("No fue posible leer la imagen."));
    image.src = src;
  });
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("No fue posible leer el archivo."));
    reader.readAsDataURL(file);
  });
}

// Scales the image so its longest side is at most `maxSize` px and encodes it
// as WEBP (PNG when the browser cannot encode WEBP), keeping transparency.
export async function resizeImageFile(file: File, maxSize = 256): Promise<string> {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    throw new Error("El logo debe ser una imagen PNG, JPG, WEBP o GIF.");
  }
  if (file.size > MAX_FILE_BYTES) {
    throw new Error("La imagen no puede superar los 5 MB.");
  }

  const image = await loadImage(await readAsDataUrl(file));
  const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("No fue posible procesar la imagen.");
  }
  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  const webp = canvas.toDataURL("image/webp", 0.85);
  return webp.startsWith("data:image/webp") ? webp : canvas.toDataURL("image/png");
}
