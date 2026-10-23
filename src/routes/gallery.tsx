import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Play, X } from "lucide-react";
import { galleryQuery } from "@/lib/content";
import { seo } from "@/lib/seo";
import { PageHeader } from "@/components/site/Reveal";

export const Route = createFileRoute("/gallery")({
  loader: ({ context }) => context.queryClient.ensureQueryData(galleryQuery),
  head: () => ({ meta: seo("گالری تصاویر و ویدیوها", "تصاویر و ویدیوهای فضای مجموعه، تجهیزات و خدمات مجتمع پزشکی و زیبایی پردیس بابل.") }),
  component: Gallery,
  errorComponent: ({ error }) => <div role="alert" className="container-page py-20">{error.message}</div>,
  notFoundComponent: () => <div className="container-page py-20">یافت نشد.</div>,
});

function embedUrl(url: string): string | null {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{6,})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const ap = url.match(/aparat\.com\/v\/([\w-]+)/);
  if (ap) return `https://www.aparat.com/video/video/embed/videohash/${ap[1]}/vt/frame`;
  return null;
}

function Gallery() {
  const { data } = useSuspenseQuery(galleryQuery);
  const cats = useMemo(() => ["همه", ...Array.from(new Set(data.map((d) => d.category)))], [data]);
  const [cat, setCat] = useState("همه");
  const items = cat === "همه" ? data : data.filter((d) => d.category === cat);
  const [idx, setIdx] = useState<number | null>(null);
  const cur = idx !== null ? items[idx] : null;

  useEffect(() => {
    if (idx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIdx(null);
      if (e.key === "ArrowLeft") setIdx((i) => (i! + 1) % items.length);
      if (e.key === "ArrowRight") setIdx((i) => (i! - 1 + items.length) % items.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [idx, items.length]);

  return (
    <>
      <PageHeader title="گالری" text="نگاهی به فضای مجموعه، تجهیزات و خدمات پردیس." />
      <section className="section-y">
        <div className="container-page">
          <div role="tablist" aria-label="دسته‌بندی گالری" className="mb-8 flex flex-wrap gap-2">
            {cats.map((c) => (
              <button key={c} role="tab" aria-selected={cat === c} onClick={() => setCat(c)}
                className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${cat === c ? "border-primary bg-primary text-primary-foreground" : "border-lavender-deep hover:bg-lavender"}`}>
                {c}
              </button>
            ))}
          </div>
          {items.length === 0 ? (
            <p className="text-muted-foreground">موردی در این دسته وجود ندارد.</p>
          ) : (
            <div className="columns-2 gap-4 md:columns-3 [&>*]:mb-4">
              {items.map((g, i) => (
                <button key={g.id} onClick={() => setIdx(i)} aria-label={`نمایش ${g.title || g.alt}`} className="group relative block w-full break-inside-avoid overflow-hidden rounded-2xl">
                  {g.media_type === "image" || g.thumbnail_url ? (
                    <img src={g.thumbnail_url || g.media_url} alt={g.alt || g.title} loading="lazy" className="w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  ) : (
                    <video src={g.media_url} preload="none" muted className="aspect-video w-full bg-lavender object-cover" />
                  )}
                  {g.media_type === "video" && (
                    <span className="absolute inset-0 flex items-center justify-center" aria-hidden>
                      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-background/85"><Play className="h-6 w-6 text-primary" /></span>
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {cur && (
        <div role="dialog" aria-modal="true" aria-label={cur.title || "نمایش رسانه"} className="fixed inset-0 z-50 flex items-center justify-center bg-ink/90 p-4" onClick={() => setIdx(null)}>
          <button aria-label="بستن" className="absolute right-4 top-4 rounded-full bg-background/90 p-2" onClick={() => setIdx(null)}><X className="h-5 w-5" /></button>
          {items.length > 1 && (
            <>
              <button aria-label="قبلی" className="absolute right-4 top-1/2 rounded-full bg-background/90 p-2" onClick={(e) => { e.stopPropagation(); setIdx((idx! - 1 + items.length) % items.length); }}><ChevronRight className="h-5 w-5" /></button>
              <button aria-label="بعدی" className="absolute left-4 top-1/2 rounded-full bg-background/90 p-2" onClick={(e) => { e.stopPropagation(); setIdx((idx! + 1) % items.length); }}><ChevronLeft className="h-5 w-5" /></button>
            </>
          )}
          <div className="max-h-[85vh] max-w-5xl" onClick={(e) => e.stopPropagation()}>
            {cur.media_type === "image" ? (
              <img src={cur.media_url} alt={cur.alt || cur.title} className="max-h-[85vh] rounded-2xl object-contain" />
            ) : embedUrl(cur.media_url) ? (
              <iframe src={embedUrl(cur.media_url)!} title={cur.title || "ویدیو"} allowFullScreen className="aspect-video w-[90vw] max-w-5xl rounded-2xl" />
            ) : (
              <video src={cur.media_url} controls autoPlay className="max-h-[85vh] rounded-2xl" />
            )}
            {cur.title && <p className="mt-3 text-center text-primary-foreground">{cur.title}</p>}
          </div>
        </div>
      )}
    </>
  );
}
