import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { faNum } from "@/lib/content";

export const Route = createFileRoute("/admin/")({ component: Dashboard });

async function count(table: "services" | "blog_posts" | "gallery_items", published = true) {
  const { count } = await supabase
    .from(table)
    .select("id", { count: "exact", head: true })
    .eq("published", published);
  return count ?? 0;
}

function Dashboard() {
  const { data } = useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: async () => {
      const [{ count: newReq }, services, posts, gallery] = await Promise.all([
        supabase
          .from("appointment_requests")
          .select("id", { count: "exact", head: true })
          .eq("status", "new"),
        count("services"),
        count("blog_posts"),
        count("gallery_items"),
      ]);
      return { newReq: newReq ?? 0, services, posts, gallery };
    },
  });
  const cards = [
    {
      label: "درخواست‌های جدید نوبت",
      value: data?.newReq,
      to: "/admin/requests" as const,
      strong: true,
    },
    { label: "خدمات منتشرشده", value: data?.services, to: "/admin/services" as const },
    { label: "مقالات منتشرشده", value: data?.posts, to: "/admin/posts" as const },
    { label: "موارد گالری", value: data?.gallery, to: "/admin/gallery" as const },
  ];
  return (
    <div>
      <h1 className="mb-6 text-2xl">داشبورد</h1>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            to={c.to}
            className={`rounded-2xl p-5 shadow-soft transition-shadow hover:shadow-lift ${c.strong ? "bg-primary text-primary-foreground" : "bg-background"}`}
          >
            <p className={`text-sm ${c.strong ? "" : "text-muted-foreground"}`}>{c.label}</p>
            <p className={`mt-2 text-3xl font-bold ${c.strong ? "" : "text-ink"}`}>
              {c.value === undefined ? "…" : faNum(c.value)}
            </p>
          </Link>
        ))}
      </div>
      <div className="mt-8 rounded-2xl bg-background p-5 shadow-soft">
        <p>
          برای آشنایی با کار با پنل،{" "}
          <Link to="/admin/help" className="text-primary underline">
            راهنما
          </Link>{" "}
          را ببینید.
        </p>
      </div>
    </div>
  );
}
