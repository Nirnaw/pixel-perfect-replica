import { supabase } from "@/integrations/supabase/client";

const TEN_YEARS = 60 * 60 * 24 * 365 * 10;
export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const VIDEO_TYPES = ["video/mp4", "video/webm"];

/** Resize to max 1600px long side and re-encode as webp (jpeg fallback) ~0.85. */
export async function compressImage(file: File, max = 1600): Promise<Blob> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const w = Math.round(bmp.width * scale);
  const h = Math.round(bmp.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  canvas.getContext("2d")!.drawImage(bmp, 0, 0, w, h);
  const toBlob = (type: string) => new Promise<Blob | null>((r) => canvas.toBlob(r, type, 0.85));
  return (await toBlob("image/webp")) ?? (await toBlob("image/jpeg"))!;
}

/** Upload to the "media" bucket and return a long-lived URL. */
export async function uploadMedia(file: File, kind: "image" | "video"): Promise<string> {
  let body: Blob = file;
  let ext = file.name.split(".").pop()?.toLowerCase() || "bin";
  if (kind === "image") {
    body = await compressImage(file);
    ext = body.type === "image/webp" ? "webp" : "jpg";
  }
  const path = `${kind}s/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from("media").upload(path, body, {
    contentType: body.type || file.type,
    upsert: false,
  });
  if (error) throw new Error("آپلود فایل انجام نشد.");
  const { data, error: e2 } = await supabase.storage.from("media").createSignedUrl(path, TEN_YEARS);
  if (e2 || !data) throw new Error("دریافت نشانی فایل انجام نشد.");
  return data.signedUrl;
}

export function slugify(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
