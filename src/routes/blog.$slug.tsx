import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import { Clock } from "lucide-react";
import { faDate, faNum, postQuery, readingTime } from "@/lib/content";
import { seo } from "@/lib/seo";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ context, params }) => {
    const p = await context.queryClient.ensureQueryData(postQuery(params.slug));
    if (!p) throw notFound();
    return p;
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? seo(loaderData.seo_title || loaderData.title, loaderData.seo_description || loaderData.excerpt, { type: "article", image: loaderData.cover_url ?? undefined })
      : [{ title: "مقاله یافت نشد" }, { name: "robots", content: "noindex" }],
  }),
  component: Post,
  errorComponent: ({ error }) => <div role="alert" className="container-page py-20">{error.message}</div>,
  notFoundComponent: () => (
    <div className="container-page py-20 text-center">
      <h1 className="text-2xl">این مقاله پیدا نشد</h1>
      <Link to="/blog" className="mt-4 inline-block text-primary hover:underline">بازگشت به مقالات</Link>
    </div>
  ),
});

function Post() {
  const { slug } = Route.useParams();
  const { data: p } = useSuspenseQuery(postQuery(slug));
  if (!p) return null;
  return (
    <article className="container-page max-w-3xl py-12 md:py-16">
      <nav aria-label="مسیر" className="mb-4 text-sm text-muted-foreground">
        <Link to="/blog" className="hover:text-primary">مقالات</Link>
      </nav>
      <h1 className="text-3xl md:text-4xl">{p.title}</h1>
      <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
        <time dateTime={p.published_at}>{faDate(p.published_at)}</time>
        <span className="flex items-center gap-1"><Clock className="h-4 w-4" aria-hidden />{faNum(readingTime(p.content))} دقیقه مطالعه</span>
      </div>
      {p.cover_url && <img src={p.cover_url} alt={p.title} width={1200} height={688} className="mt-8 aspect-[16/9] w-full rounded-[2rem] object-cover" />}
      <div className="prose-fa mt-8 text-lg">
        <ReactMarkdown>{p.content}</ReactMarkdown>
      </div>
      <div className="mt-10 rounded-2xl bg-lavender p-6">
        <p className="text-ink">برای مشاوره تخصصی درباره شرایط پوست خود، درخواست نوبت ثبت کنید.</p>
        <Button asChild variant="hero" size="xl" className="mt-4"><Link to="/contact" hash="appointment">درخواست نوبت</Link></Button>
      </div>
    </article>
  );
}
