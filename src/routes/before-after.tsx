import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { galleryQuery, settingsQuery } from "@/lib/content";
import { seo } from "@/lib/seo";
import { PageHeader } from "@/components/site/Reveal";
import { BeforeAfterEmpty, BeforeAfterPair } from "@/components/site/BeforeAfter";

export const Route = createFileRoute("/before-after")({
  loader: ({ context }) => Promise.all([context.queryClient.ensureQueryData(galleryQuery), context.queryClient.ensureQueryData(settingsQuery)]),
  head: () => ({ meta: seo("قبل و بعد", "نمونه‌کارهای قبل و بعد مجتمع پزشکی و زیبایی پردیس بابل؛ نتایج خدمات برای هر فرد متفاوت است.") }),
  component: BeforeAfter,
});

function BeforeAfter() {
  const { data } = useSuspenseQuery(galleryQuery);
  const { data: settings } = useSuspenseQuery(settingsQuery);
  const pairs = data.filter((item) => item.media_type === "before_after");
  return <><PageHeader title="قبل و بعد" /><section className="section-y"><div className="container-page">
    {pairs.length ? <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{pairs.map((pair) => <BeforeAfterPair key={pair.id} pair={pair} />)}</div> : <BeforeAfterEmpty />}
    <p className="mt-6 text-sm text-muted-foreground">{settings.disclaimer.text}</p>
  </div></section></>;
}