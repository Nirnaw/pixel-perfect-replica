import { Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ArrowUp, Instagram, Menu, Phone, X, MapPin } from "lucide-react";
import { Logo } from "./Logo";
import { settingsQuery } from "@/lib/content";
import { telHref } from "@/lib/phone";
import { Button } from "@/components/ui/button";

const NAV = [
  { to: "/", label: "خانه" },
  { to: "/services", label: "خدمات" },
  { to: "/about", label: "درباره ما" },
  { to: "/gallery", label: "گالری" },
  { to: "/before-after", label: "قبل و بعد" },
  { to: "/blog", label: "مقالات" },
  { to: "/products", label: "محصولات" },
  { to: "/contact", label: "تماس" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link to="/" aria-label="صفحه اصلی پردیس" className="shrink-0">
          <Logo />
        </Link>
        <nav aria-label="منوی اصلی" className="hidden items-center gap-1 lg:flex">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: n.to === "/" }}
              className="rounded-full px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-lavender data-[status=active]:bg-lavender data-[status=active]:text-ink"
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="hero" className="hidden sm:inline-flex">
            <Link to="/contact" hash="appointment">درخواست نوبت</Link>
          </Button>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-lavender lg:hidden"
            aria-label={open ? "بستن منو" : "باز کردن منو"}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {open && (
        <nav aria-label="منوی موبایل" className="border-t border-border bg-background lg:hidden">
          <div className="container-page flex flex-col py-3">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                activeOptions={{ exact: n.to === "/" }}
                className="rounded-xl px-3 py-2.5 hover:bg-lavender data-[status=active]:text-primary"
              >
                {n.label}
              </Link>
            ))}
            <Button asChild variant="hero" size="xl" className="mt-2">
              <Link to="/contact" hash="appointment" onClick={() => setOpen(false)}>
                درخواست نوبت
              </Link>
            </Button>
          </div>
        </nav>
      )}
    </header>
  );
}

export function SiteFooter() {
  const { data: s } = useSuspenseQuery(settingsQuery);
  return (
    <footer className="mt-10 bg-lavender/70">
      <div className="container-page grid gap-10 py-14 md:grid-cols-3">
        <div>
          <Logo />
          <p className="mt-4 text-sm text-muted-foreground">{s.clinic?.name}</p>
          <p className="text-sm text-muted-foreground">مدیریت: {s.clinic?.manager}</p>
        </div>
        <div>
          <h2 className="mb-3 text-base">دسترسی سریع</h2>
          <ul className="grid grid-cols-2 gap-1 text-sm">
            {NAV.map((n) => (
              <li key={n.to}>
                <Link to={n.to} className="hover:text-primary">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-3 text-sm">
          <h2 className="mb-3 text-base">ارتباط با ما</h2>
          {s.clinic?.phones?.map((p) => (
            <a key={p.number} href={telHref(p.number)} className="flex items-center gap-2 hover:text-primary">
              <Phone className="h-4 w-4 text-primary" aria-hidden />
              <span>{p.label}:</span>
              <span className="ltr">{p.number}</span>
            </a>
          ))}
          <p className="flex items-start gap-2">
            <MapPin className="mt-1 h-4 w-4 shrink-0 text-primary" aria-hidden />
            {s.clinic?.address}
          </p>
          <a href={s.clinic?.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary">
            <Instagram className="h-4 w-4 text-primary" aria-hidden />
            <span>اینستاگرام</span>
            <span className="ltr">@{s.clinic?.instagram_handle}</span>
          </a>
        </div>
      </div>
      <div className="border-t border-lavender-deep/60">
        <div className="container-page py-5 text-center text-xs text-muted-foreground">
          <p>{s.disclaimer?.text}</p>
          <p className="mt-1">© {new Date().getFullYear().toLocaleString("fa-IR", { useGrouping: false })} {s.clinic?.name}</p>
          <Link to="/admin/login" className="mt-2 inline-block opacity-50 hover:opacity-100">ورود مدیر</Link>
        </div>
      </div>
    </footer>
  );
}

export function FloatingButtons() {
  const { data: s } = useSuspenseQuery(settingsQuery);
  const phone = s.clinic?.phones?.[0];
  const [showTop, setShowTop] = useState(false);
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div className="fixed bottom-5 left-5 z-40 flex flex-col gap-3">
      {showTop && <Button variant="soft" size="icon" aria-label="بازگشت به بالای صفحه" title="بازگشت به بالا" className="h-12 w-12 rounded-full shadow-lift"
        onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" })}><ArrowUp /></Button>}
      {phone && (
        <a
          href={telHref(phone.number)}
          aria-label={`تماس با ${phone.label}`}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lift transition-transform hover:scale-105"
        >
          <Phone className="h-5 w-5" />
        </a>
      )}
      <a
        href={s.clinic?.instagram}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="اینستاگرام پردیس"
        className="flex h-12 w-12 items-center justify-center rounded-full bg-ink text-primary-foreground shadow-lift transition-transform hover:scale-105"
      >
        <Instagram className="h-5 w-5" />
      </a>
    </div>
  );
}
