import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { z } from "zod";
import { Instagram, MapPin, Phone } from "lucide-react";
import { mapEmbed, servicesQuery, settingsQuery } from "@/lib/content";
import { telHref } from "@/lib/phone";
import { seo } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/site/Reveal";
import { AppointmentForm } from "@/components/site/AppointmentForm";
import { Directions } from "@/components/site/Directions";

const searchSchema = z.object({ service: z.string().optional() });

export const Route = createFileRoute("/contact")({
  validateSearch: (s) => searchSchema.parse(s),
  loader: ({ context }) => context.queryClient.ensureQueryData(servicesQuery),
  head: () => ({ meta: seo("تماس و درخواست نوبت", "درخواست نوبت آنلاین، شماره تماس بخش پوست و لیزر، آدرس و مسیریابی مجتمع پزشکی و زیبایی پردیس بابل.") }),
  component: Contact,
  errorComponent: ({ error }) => <div role="alert" className="container-page py-20">{String((error as Error)?.message ?? error)}</div>,
  notFoundComponent: () => <div className="container-page py-20">یافت نشد.</div>,
});

function Contact() {
  const { service } = Route.useSearch();
  const { data: s } = useSuspenseQuery(settingsQuery);
  const { data: services } = useSuspenseQuery(servicesQuery);
  return (
    <>
      <PageHeader title="تماس با ما" text="برای درخواست نوبت فرم زیر را تکمیل کنید یا مستقیماً با ما تماس بگیرید." />
      <section className="section-y">
        <div className="container-page grid gap-10 lg:grid-cols-[3fr_2fr]">
          <div id="appointment" className="scroll-mt-24 rounded-2xl border border-border bg-card p-6 shadow-soft md:p-8">
            <h2 className="mb-6 text-2xl">درخواست نوبت</h2>
            <AppointmentForm key={service ?? ""} services={services} defaultService={service} />
          </div>
          <div className="space-y-6">
            <div className="rounded-2xl bg-lavender/60 p-6">
              <h2 className="mb-4 text-lg">شماره‌های تماس</h2>
              <div className="grid gap-3">
                {s.clinic.phones.map((p) => (
                  <a key={p.number} href={telHref(p.number)} className="flex items-center justify-between gap-3 rounded-xl bg-background px-4 py-3 shadow-soft hover:text-primary">
                    <span className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" aria-hidden />{p.label}</span>
                    <span className="ltr font-medium">{p.number}</span>
                  </a>
                ))}
              </div>
            </div>
            <div className="rounded-2xl bg-lavender/60 p-6">
              <h2 className="mb-3 text-lg">آدرس</h2>
              <p className="flex items-start gap-2"><MapPin className="mt-1.5 h-4 w-4 shrink-0 text-primary" aria-hidden />{s.clinic.address}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                 <Directions clinic={s.clinic} />
                <Button asChild variant="soft"><a href={s.clinic.instagram} target="_blank" rel="noopener noreferrer"><Instagram />اینستاگرام</a></Button>
              </div>
            </div>
             <div>
               <iframe title="نقشه مجتمع پردیس" src={mapEmbed(s.clinic.address)} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="h-72 w-full rounded-2xl border-0 shadow-soft" />
               <p className="mt-3 text-sm text-muted-foreground">اگر نقشه نمایش داده نشد، از دکمه‌های نشان یا بلد استفاده کنید.</p>
             </div>
          </div>
        </div>
      </section>
    </>
  );
}
