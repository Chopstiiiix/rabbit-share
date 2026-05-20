import { put } from "@vercel/blob";

export async function uploadObject({
  key,
  body,
  contentType,
}: {
  key: string;
  body: Buffer | Uint8Array | ArrayBuffer;
  contentType: string;
}) {
  const uploadBody = Buffer.isBuffer(body)
    ? body
    : body instanceof ArrayBuffer
      ? Buffer.from(body)
      : Buffer.from(body);

  const blob = await put(key, uploadBody, {
    access: "public",
    addRandomSuffix: false,
    contentType,
  });

  return blob.url;
}
