import { useId, useRef, useState } from "react";
import { toast } from "sonner";
import { Trash2, Upload, Link2 } from "lucide-react";
import { IMAGE_TYPES, VIDEO_TYPES, uploadMedia } from "@/lib/media";
import { SafeImg } from "@/components/site/SafeImg";
import { Button } from "@/components/ui/button";

export function ImageUploadField({
  label,
  value,
  onChange,
  kind = "image",
}: {
  label: string;
  value: string | null | undefined;
  onChange: (v: string | null) => void;
  kind?: "image" | "video";
}) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [url, setUrl] = useState("");
  const types = kind === "image" ? IMAGE_TYPES : VIDEO_TYPES;
  const maxMb = kind === "image" ? 5 : 50;

  async function onFile(f: File | undefined) {
    if (!f) return;
    if (!types.includes(f.type)) {
      toast.error(kind === "image" ? "فقط تصویر JPG، PNG یا WEBP قابل قبول است." : "فقط ویدیوی MP4 یا WEBM قابل قبول است.");
      return;
    }
    if (f.size > maxMb * 1024 * 1024) {
      toast.error(`حجم فایل باید کمتر از ${maxMb.toLocaleString("fa-IR")} مگابایت باشد.`);
      return;
    }
    setBusy(true);
    try {
      onChange(await uploadMedia(f, kind));
      toast.success("فایل با موفقیت آپلود شد.");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <div className="rounded-2xl border border-border p-4">
      <p className="mb-2 text-sm font-medium text-ink">{label}</p>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="h-28 w-40 shrink-0 overflow-hidden rounded-xl">
          {kind === "video" && value ? (
            <video src={value} className="h-full w-full bg-lavender object-cover" muted />
          ) : (
            <SafeImg src={value ?? undefined} alt={label} className="h-full w-full object-cover" />
          )}
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            <input ref={input} id={id} type="file" accept={types.join(",")} className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} />
            <Button type="button" variant="hero" size="sm" disabled={busy} onClick={() => input.current?.click()}>
              <Upload />{busy ? "در حال آپلود…" : kind === "image" ? "آپلود / تعویض تصویر" : "آپلود / تعویض ویدیو"}
            </Button>
            {value && (
              <Button type="button" variant="soft" size="sm" onClick={() => onChange(null)}>
                <Trash2 />حذف
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <input
              dir="ltr"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              aria-label={`نشانی ${label}`}
              className="min-w-0 flex-1 rounded-lg border border-input px-3 py-1.5 text-sm"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                if (!/^(https?:\/\/|\/)/.test(url.trim())) return toast.error("نشانی معتبر وارد کنید.");
                onChange(url.trim());
                setUrl("");
                toast.success("نشانی ثبت شد.");
              }}
            >
              <Link2 />استفاده از نشانی
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            {kind === "image" ? "حداکثر ۵ مگابایت؛ تصویر به‌طور خودکار فشرده می‌شود." : "حداکثر ۵۰ مگابایت، یا نشانی ویدیو (یوتیوب/آپارات/مستقیم)."}
          </p>
        </div>
      </div>
    </div>
  );
}
