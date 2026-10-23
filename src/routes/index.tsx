import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Instagram, MapPin, Navigation } from "lucide-react";
import heroImg from "/images/hero.jpg?url";
import { galleryQuery, mapDirections, mapEmbed, postsQuery, productsQuery, servicesQuery, settingsQuery } from "@/lib/content";
import { seo } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { Reveal, SectionHeading } from "@/components/site/Reveal";
import { PostCard, ServiceCard } from "@/components/site/Cards";

export const Route = createFileRoute("/")({
  loader: ({ context: { queryClient } }) =>
    Promise.all([
      queryClient.ensureQueryData(servicesQuery),
      queryClient.ensureQueryData(postsQuery),
      queryClient.ensureQueryData(galleryQuery),
      queryClient.ensureQueryData(productsQuery),
    ]),
  head: () => ({
    meta: seo("مجتمع پزشکی و زیبایی پردیس | پوست، مو و زیبایی در بابل", "مجتمع پزشکی و زیبایی پردیس در بابل؛ خدمات تخصصی پوست، مو، لیزر و زیبایی با مدیریت دکتر شاهین غلامی. درخواست نوبت آنلاین."),
  }),
  component: Home,
  errorComponent: ({ error }) => <div role="alert" className="container-page py-20">{error.message}</div>,
  notFoundComponent: () => <div className="container-page py-20">یافت نشد.</div>,
});

function Home() {
  const { data: s } = useSuspenseQuery(settingsQuery);
  const { data: services } = useSuspenseQuery(servicesQuery);
  const { data: posts } = useSuspenseQuery(postsQuery);
  const { data: gallery } = useSuspenseQuery(galleryQuery);
  const { data: products } = useSuspenseQuery(productsQuery);
  const featured = (services.filter((x) => x.featured).length >= 6 ? services.filter((x) => x.featured) : services).slice(0, 6);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="container-page grid items-center gap-10 py-12 md:grid-cols-2 md:py-20">
          <div>
            <p className="eyebrow mb-3">بابل · مازندران</p>
            <h1 className="text-3xl leading-[1.5] md:text-5xl md:leading-[1.4]">{s.hero.title}</h1>
            <p className="mt-4 text-lg text-muted-foreground">{s.hero.subtitle}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="hero" size="xl">
                <Link to="/contact" hash="appointment">{s.hero.primary_cta}</Link>
              </Button>
              <Button asChild variant="soft" size="xl">
                <Link to="/contact">{s.hero.secondary_cta}</Link>
              </Button>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 -z-10 rounded-[2.5rem] bg-lavender" aria-hidden />
            <img src={heroImg} alt="فضای آرام و روشن مجتمع پزشکی و زیبایی پردیس" width={1600} height={1008} fetchPriority="high" className="aspect-[4/3] w-full rounded-[2rem] object-cover shadow-lift" />
          </div>
        </div>
      </section>

      {/* About */}
      <section className="section-y bg-lavender/50">
        <Reveal className="container-page grid gap-8 md:grid-cols-[1fr_2fr]">
          <h2 className="text-2xl md:text-3xl">{s.about.title}</h2>
          <div>
            <p className="text-lg">{s.about.text}</p>
            <Link to="/about" className="mt-4 inline-block text-primary hover:underline">آشنایی با پزشکان مجموعه</Link>
          </div>
        </Reveal>
      </section>

      {/* Services */}
      <section className="section-y">
        <div className="container-page">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <SectionHeading eyebrow="خدمات" title="خدمات منتخب پردیس" />
              <Link to="/services" className="mb-10 text-primary hover:underline">همه خدمات</Link>
            </div>
          </Reveal>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((sv) => (
              <Reveal key={sv.id}><ServiceCard s={sv} /></Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery teaser */}
      {gallery.length > 0 && (
        <section className="section-y bg-muted">
          <div className="container-page">
            <Reveal>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <SectionHeading eyebrow="گالری" title="نگاهی به فضای مجموعه" />
                <Link to="/gallery" className="mb-10 text-primary hover:underline">مشاهده گالری</Link>
              </div>
            </Reveal>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {gallery.filter((g) => g.media_type === "image").slice(0, 4).map((g, i) => (
                <Link key={g.id} to="/gallery" className={`overflow-hidden rounded-2xl ${i === 0 ? "md:col-span-2 md:row-span-2" : ""}`}>
                  <img src={g.thumbnail_url || g.media_url} alt={g.alt || g.title} loading="lazy" className="h-full min-h-40 w-full object-cover transition-transform duration-700 hover:scale-105" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Blog */}
      {posts.length > 0 && (
        <section className="section-y">
          <div className="container-page">
            <Reveal>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <SectionHeading eyebrow="مقالات" title="دانستنی‌های پوست و زیبایی" />
                <Link to="/blog" className="mb-10 text-primary hover:underline">همه مقالات</Link>
              </div>
            </Reveal>
            <div className="grid gap-6 md:grid-cols-3">
              {posts.slice(0, 3).map((p) => (
                <Reveal key={p.id}><PostCard p={p} /></Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Products teaser */}
      <section className="section-y bg-lavender/50">
        <Reveal className="container-page flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <p className="eyebrow mb-2">محصولات</p>
            <h2 className="text-2xl md:text-3xl">محصولات مراقبتی</h2>
            <p className="mt-2 text-muted-foreground">
              {products.length > 0
                ? "محصولات مراقبت از پوست و مو را ببینید و برای استعلام با ما در تماس باشید."
                : "به‌زودی محصولات مراقبتی منتخب در این بخش معرفی می‌شوند."}
            </p>
          </div>
          <Button asChild variant="ink" size="xl"><Link to="/products">مشاهده محصولات</Link></Button>
        </Reveal>
      </section>

      {/* Location + Instagram */}
      <section className="section-y">
        <div className="container-page grid gap-8 md:grid-cols-2">
          <Reveal>
            <SectionHeading eyebrow="آدرس" title="مسیر رسیدن به پردیس" />
            <p className="flex items-start gap-2"><MapPin className="mt-1.5 h-5 w-5 shrink-0 text-primary" aria-hidden />{s.clinic.address}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild variant="hero" size="xl">
                <a href={mapDirections(s.clinic.address)} target="_blank" rel="noopener noreferrer"><Navigation />مسیریابی</a>
              </Button>
              <Button asChild variant="soft" size="xl">
                <a href={s.clinic.instagram} target="_blank" rel="noopener noreferrer"><Instagram />اینستاگرام پردیس</a>
              </Button>
            </div>
          </Reveal>
          <Reveal>
            <iframe title="نقشه مجتمع پردیس" src={mapEmbed(s.clinic.address)} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="h-80 w-full rounded-2xl border-0 shadow-soft" />
          </Reveal>
        </div>
      </section>
    </>
  );
}
