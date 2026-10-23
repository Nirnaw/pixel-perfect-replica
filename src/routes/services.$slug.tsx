import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { serviceQuery, servicesQuery } from "@/lib/content";
import { seo } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { ServiceCard } from "@/components/site/Cards";

export const Route = createFileRoute("/services/$slug")({
  loader: async ({ context, params }) => {
    const s = await context.queryClient.ensureQueryData(serviceQuery(params.slug));
    if (!s) throw notFound();
    await context.queryClient.ensureQueryData(servicesQuery);
    return s;
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? seo(loaderData.seo_title || loaderData.title, loaderData.seo_description || loaderData.short_description)
      : [{ title: "خدمت یافت نشد" }, { name: "robots", content: "noindex" }],
  }),
  component: ServiceDetail,
  errorComponent: ({ error }) => <div role="alert" className="container-page py-20">{error.message}</div>,
  notFoundComponent: () => (
    <div className="container-page py-20 text-center">
      <h1 className="text-2xl">این خدمت پیدا نشد</h1>
      <Link to="/services" className="mt-4 inline-block text-primary hover:underline">بازگشت به خدمات</Link>
    </div>
  ),
});

function ServiceDetail() {
  const { slug } = Route.useParams();
  const { data: s } = useSuspenseQuery(serviceQuery(slug));
  const { data: all } = useSuspenseQuery(servicesQuery);
  if (!s) return null;
  const others = all.filter((x) => x.slug !== slug).slice(0, 3);
  return (
    <>
      <section className="container-page grid gap-10 py-12 md:grid-cols-2 md:py-16">
        <div>
          <nav aria-label="مسیر" className="mb-4 text-sm text-muted-foreground">
            <Link to="/services" className="hover:text-primary">خدمات</Link> / <span>{s.title}</span>
          </nav>
          <h1 className="text-3xl md:text-4xl">{s.title}</h1>
          {s.department && <p className="mt-2 inline-block rounded-full bg-lavender px-3 py-0.5 text-sm">بخش {s.department}</p>}
          <p className="mt-6 text-lg">{s.short_description}</p>
          <p className="mt-4 whitespace-pre-line">{s.description}</p>
          <p className="mt-6 rounded-2xl bg-muted p-4 text-sm text-muted-foreground">
            نتیجه درمان‌ها بسته به شرایط هر فرد متفاوت است. پیش از هر اقدام، مشاوره تخصصی پزشک ضروری است.
          </p>
          <Button asChild variant="hero" size="xl" className="mt-6">
            <Link to="/contact" search={{ service: s.slug }} hash="appointment">درخواست نوبت برای این خدمت</Link>
          </Button>
        </div>
        {s.image_url && (
          <img src={s.image_url} alt={s.title} width={1024} height={768} className="aspect-[4/3] w-full rounded-[2rem] object-cover shadow-lift" />
        )}
      </section>
      {others.length > 0 && (
        <section className="section-y bg-lavender/50">
          <div className="container-page">
            <h2 className="mb-8 text-2xl">خدمات دیگر</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((o) => <ServiceCard key={o.id} s={o} />)}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
