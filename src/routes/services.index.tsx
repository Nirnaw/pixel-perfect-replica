import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { servicesQuery } from "@/lib/content";
import { seo } from "@/lib/seo";
import { PageHeader, Reveal } from "@/components/site/Reveal";
import { ServiceCard } from "@/components/site/Cards";

export const Route = createFileRoute("/services/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(servicesQuery),
  head: () => ({ meta: seo("خدمات پوست، مو و زیبایی", "فهرست خدمات مجتمع پردیس بابل: لیزر، تزریق بوتاکس و فیلر، ترمیم جای جوش، فیشال، مزوتراپی، کاشت مو و جراحی.") }),
  component: Services,
  errorComponent: ({ error }) => <div role="alert" className="container-page py-20">{String((error as Error)?.message ?? error)}</div>,
  notFoundComponent: () => <div className="container-page py-20">یافت نشد.</div>,
});

function Services() {
  const { data } = useSuspenseQuery(servicesQuery);
  return (
    <>
      <PageHeader title="خدمات پردیس" text="هر خدمت پس از معاینه و مشاوره تخصصی و متناسب با شرایط شما برنامه‌ریزی می‌شود." />
      <section className="section-y">
        <div className="container-page grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((s) => (
            <Reveal key={s.id}><ServiceCard s={s} /></Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
