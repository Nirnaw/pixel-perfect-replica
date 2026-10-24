import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Instagram, Package, Phone } from "lucide-react";
import { productsQuery, settingsQuery } from "@/lib/content";
import { telHref } from "@/lib/phone";
import { seo } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { PageHeader, Reveal } from "@/components/site/Reveal";

export const Route = createFileRoute("/products")({
  loader: ({ context }) => context.queryClient.ensureQueryData(productsQuery),
  head: () => ({ meta: seo("محصولات مراقبتی", "محصولات مراقبت از پوست و مو در مجتمع پردیس بابل؛ برای استعلام و سفارش تماس بگیرید یا در اینستاگرام پیام دهید.") }),
  component: Products,
  errorComponent: ({ error }) => <div role="alert" className="container-page py-20">{String((error as Error)?.message ?? error)}</div>,
  notFoundComponent: () => <div className="container-page py-20">یافت نشد.</div>,
});

function Inquiry() {
  const { data: s } = useSuspenseQuery(settingsQuery);
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-4">
      <Button variant="hero" className="w-full" aria-expanded={open} onClick={() => setOpen((o) => !o)}>استعلام و سفارش</Button>
      {open && (
        <div className="mt-3 grid gap-2">
          {s.clinic.phones.map((p) => (
            <a key={p.number} href={telHref(p.number)} className="flex items-center justify-center gap-2 rounded-full border border-lavender-deep py-2 text-sm hover:bg-lavender">
              <Phone className="h-4 w-4" aria-hidden />تماس با {p.label} <span className="ltr">{p.number}</span>
            </a>
          ))}
          <a href={s.clinic.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded-full border border-lavender-deep py-2 text-sm hover:bg-lavender">
            <Instagram className="h-4 w-4" aria-hidden />پیام در اینستاگرام
          </a>
        </div>
      )}
    </div>
  );
}

function Products() {
  const { data } = useSuspenseQuery(productsQuery);
  return (
    <>
      <PageHeader title="محصولات" text="محصولات فقط برای معرفی نمایش داده می‌شوند؛ برای استعلام و سفارش با ما در تماس باشید." />
      <section className="section-y">
        <div className="container-page">
          {data.length === 0 ? (
            <div className="mx-auto max-w-md rounded-2xl bg-lavender/60 p-10 text-center">
              <Package className="mx-auto h-12 w-12 text-primary" aria-hidden />
              <h2 className="mt-4 text-xl">به‌زودی محصولات این بخش معرفی می‌شوند</h2>
              <p className="mt-2 text-muted-foreground">تا آن زمان برای پرسش درباره محصولات مراقبتی با ما تماس بگیرید.</p>
              <Button asChild variant="soft" className="mt-5"><Link to="/contact">تماس با ما</Link></Button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {data.map((p) => (
                <Reveal key={p.id}>
                  <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
                    {p.image_url && <img src={p.image_url} alt={p.name} loading="lazy" className="aspect-square w-full object-cover" />}
                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="text-lg">{p.name}</h3>
                      <p className="mt-1 flex-1 text-sm text-muted-foreground">{p.description}</p>
                      {p.price_text && <p className="mt-3 text-primary">{p.price_text}</p>}
                      <Inquiry />
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
