import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Initials } from "@/components/site/SafeImg";
import { doctorsQuery, settingsQuery } from "@/lib/content";
import { seo } from "@/lib/seo";
import { PageHeader, Reveal } from "@/components/site/Reveal";

export const Route = createFileRoute("/about")({
  loader: ({ context }) => context.queryClient.ensureQueryData(doctorsQuery),
  head: () => ({ meta: seo("درباره ما و پزشکان", "آشنایی با مجتمع پزشکی و زیبایی پردیس بابل و پزشکان مجموعه به مدیریت دکتر شاهین غلامی.") }),
  component: About,
  errorComponent: ({ error }) => <div role="alert" className="container-page py-20">{String((error as Error)?.message ?? error)}</div>,
  notFoundComponent: () => <div className="container-page py-20">یافت نشد.</div>,
});

function About() {
  const { data: s } = useSuspenseQuery(settingsQuery);
  const { data: doctors } = useSuspenseQuery(doctorsQuery);
  return (
    <>
      <PageHeader title="درباره پردیس" />
      <section className="section-y">
        <Reveal className="container-page max-w-3xl">
          <p className="text-lg">{s.about.text}</p>
        </Reveal>
      </section>
      <section className="section-y bg-lavender/50">
        <div className="container-page">
          <h2 className="mb-8 text-2xl md:text-3xl">پزشکان مجموعه</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {doctors.map((d) => (
              <Reveal key={d.id}>
                <article className="flex h-full items-start gap-5 rounded-2xl bg-card p-6 shadow-soft">
                  {d.image_url ? (
                    <img src={d.image_url} alt={d.name} loading="lazy" className="h-24 w-24 shrink-0 rounded-2xl object-cover" />
                  ) : (
                    <Initials name={d.name} className="h-24 w-24 shrink-0 rounded-2xl" />
                  )}
                  <div>
                    <h3 className="text-xl">{d.name}</h3>
                    <p className="text-sm text-primary">{d.role}</p>
                    <p className="mt-2 text-muted-foreground">{d.bio}</p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
