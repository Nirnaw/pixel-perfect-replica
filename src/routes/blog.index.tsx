import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { postsQuery } from "@/lib/content";
import { seo } from "@/lib/seo";
import { PageHeader, Reveal } from "@/components/site/Reveal";
import { PostCard } from "@/components/site/Cards";

export const Route = createFileRoute("/blog/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(postsQuery),
  head: () => ({ meta: seo("مقالات پوست و زیبایی", "مقالات آموزشی مجتمع پردیس درباره مراقبت از پوست، محافظت از آفتاب و آمادگی پیش از لیزر.") }),
  component: Blog,
  errorComponent: ({ error }) => <div role="alert" className="container-page py-20">{error.message}</div>,
  notFoundComponent: () => <div className="container-page py-20">یافت نشد.</div>,
});

function Blog() {
  const { data } = useSuspenseQuery(postsQuery);
  return (
    <>
      <PageHeader title="مقالات" text="دانستنی‌های کوتاه و کاربردی درباره سلامت پوست و مو." />
      <section className="section-y">
        <div className="container-page grid gap-6 md:grid-cols-3">
          {data.length === 0 && <p className="text-muted-foreground">هنوز مقاله‌ای منتشر نشده است.</p>}
          {data.map((p) => <Reveal key={p.id}><PostCard p={p} /></Reveal>)}
        </div>
      </section>
    </>
  );
}
