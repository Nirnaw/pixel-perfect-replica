import { Link } from "@tanstack/react-router";
import { SafeImg } from "@/components/site/SafeImg";
import { Clock } from "lucide-react";
import { faDate, faNum, readingTime } from "@/lib/content";

type ServiceLite = { slug: string; title: string; short_description: string; image_url: string | null };

export function ServiceCard({ s }: { s: ServiceLite }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-shadow hover:shadow-lift">
      <Link to="/services/$slug" params={{ slug: s.slug }} className="block overflow-hidden">
        {s.image_url && (
          <SafeImg
            src={s.image_url}
            alt={s.title}
            loading="lazy"
            width={1024}
            height={768}
            className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        )}
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg">
          <Link to="/services/$slug" params={{ slug: s.slug }} className="hover:text-primary">
            {s.title}
          </Link>
        </h3>
        <p className="mt-2 flex-1 text-sm text-muted-foreground">{s.short_description}</p>
        <div className="mt-4 flex items-center justify-between gap-2">
          <Link
            to="/contact"
            search={{ service: s.slug }}
            hash="appointment"
            className="rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground transition-colors hover:bg-primary/90"
          >
            درخواست نوبت
          </Link>
          <Link to="/services/$slug" params={{ slug: s.slug }} className="text-sm text-primary hover:underline">
            اطلاعات بیشتر
          </Link>
        </div>
      </div>
    </article>
  );
}

type PostLite = { slug: string; title: string; excerpt: string; cover_url: string | null; published_at: string; content: string };

export function PostCard({ p }: { p: PostLite }) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-shadow hover:shadow-lift">
      <Link to="/blog/$slug" params={{ slug: p.slug }} className="block">
        {p.cover_url && (
          <SafeImg
            src={p.cover_url}
            alt={p.title}
            loading="lazy"
            width={1200}
            height={688}
            className="aspect-[16/9] w-full object-cover"
          />
        )}
        <div className="p-5">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <time dateTime={p.published_at}>{faDate(p.published_at)}</time>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" aria-hidden />
              {faNum(readingTime(p.content))} دقیقه مطالعه
            </span>
          </div>
          <h3 className="mt-2 text-lg group-hover:text-primary">{p.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{p.excerpt}</p>
        </div>
      </Link>
    </article>
  );
}
