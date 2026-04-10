import { Buffer } from "node:buffer";

/** ICO sizes embedded in output (width = height). */
export const ICO_SIZES = [32, 48, 180] as const;

const PNG_SIG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

function assertPng(buffer: Buffer, label: string): void {
  if (buffer.length < PNG_SIG.length || !buffer.subarray(0, PNG_SIG.length).equals(PNG_SIG)) {
    throw new Error(`${label}: expected PNG payload (bad signature)`);
  }
}

/**
 * Build a Windows ICO file whose image data is full PNG blobs (Vista+).
 * @param images width/height must be 1–256; use 256 only with byte 0 in entry per ICO convention.
 */
export function buildIcoFromPngs(
  images: ReadonlyArray<{ width: number; height: number; png: Buffer }>,
): Buffer {
  if (images.length === 0 || images.length > 65535) {
    throw new Error("ICO must contain between 1 and 65535 images");
  }

  for (let i = 0; i < images.length; i++) {
    assertPng(images[i].png, `Image ${i}`);
    const { width, height } = images[i];
    if (width < 1 || width > 256 || height < 1 || height > 256) {
      throw new Error(`Image ${i}: dimensions ${width}x${height} out of ICO range (1–256)`);
    }
  }

  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);

  const dirBytes = 6 + images.length * 16;
  const parts: Buffer[] = [header];

  let offset = dirBytes;
  for (const img of images) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(img.width === 256 ? 0 : img.width, 0);
    entry.writeUInt8(img.height === 256 ? 0 : img.height, 1);
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(img.png.length, 8);
    entry.writeUInt32LE(offset, 12);
    parts.push(entry);
    offset += img.png.length;
  }

  for (const img of images) {
    parts.push(img.png);
  }

  return Buffer.concat(parts);
}
