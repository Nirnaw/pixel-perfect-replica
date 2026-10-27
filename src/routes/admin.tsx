import { createFileRoute, Link, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  BookOpen,
  CalendarCheck,
  FileText,
  Image,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  Shield,
  Images,
  Stethoscope,
  Users,
  X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { adminRedirectFor, checkAdmin } from "@/lib/admin-guard";
import { faNum } from "@/lib/content";
import { Logo } from "@/components/site/Logo";

export const Route = createFileRoute("/admin")({
  ssr: false,
  beforeLoad: async () => {
    const { userId, isAdmin, email } = await checkAdmin();
    const to = adminRedirectFor(userId, isAdmin);
    if (to) {
      if (userId && !isAdmin) await supabase.auth.signOut();
      throw redirect({ to });
    }
    return { adminEmail: email };
  },
  head: () => ({
    meta: [{ title: "پنل مدیریت | پردیس" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: AdminLayout,
});

const NAV = [
  { to: "/admin", label: "داشبورد", icon: LayoutDashboard },
  { to: "/admin/requests", label: "درخواست‌های نوبت", icon: CalendarCheck },
  { to: "/admin/services", label: "خدمات", icon: Stethoscope },
  { to: "/admin/doctors", label: "پزشکان", icon: Users },
  { to: "/admin/posts", label: "مقالات", icon: FileText },
  { to: "/admin/products", label: "محصولات", icon: Package },
  { to: "/admin/gallery", label: "گالری", icon: Image },
  { to: "/admin/before-after", label: "قبل و بعد", icon: Images },
  { to: "/admin/admins", label: "مدیران", icon: Shield },
  { to: "/admin/settings", label: "تنظیمات سایت", icon: Settings },
  { to: "/admin/help", label: "راهنما", icon: BookOpen },
] as const;

export function useNewRequestsCount() {
  return useQuery({
    queryKey: ["admin", "new-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("appointment_requests")
        .select("id", { count: "exact", head: true })
        .eq("status", "new");
      return count ?? 0;
    },
    refetchInterval: 60_000,
  });
}

function AdminLayout() {
  const { adminEmail } = Route.useRouteContext();
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { data: newCount = 0 } = useNewRequestsCount();

  async function logout() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/admin/login", replace: true });
  }

  const nav = (
    <nav aria-label="منوی مدیریت" className="flex flex-col gap-1">
      {NAV.map((n) => (
        <Link
          key={n.to}
          to={n.to}
          activeOptions={{ exact: n.to === "/admin" }}
          onClick={() => setOpen(false)}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm hover:bg-lavender data-[status=active]:bg-lavender data-[status=active]:text-ink"
        >
          <n.icon className="h-4 w-4 text-primary" aria-hidden />
          <span className="flex-1">{n.label}</span>
          {n.to === "/admin/requests" && newCount > 0 && (
            <span className="rounded-full bg-primary px-2 text-xs text-primary-foreground">
              {faNum(newCount)}
            </span>
          )}
        </Link>
      ))}
      <button
        onClick={logout}
        className="mt-4 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-destructive hover:bg-lavender"
      >
        <LogOut className="h-4 w-4" aria-hidden />
        خروج
      </button>
    </nav>
  );

  return (
    <div className="min-h-screen bg-muted">
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background px-4 lg:hidden">
        <Logo />
        <button
          aria-label={open ? "بستن منو" : "باز کردن منو"}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          className="rounded-full p-2 hover:bg-lavender"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>
      {open && <div className="border-b border-border bg-background p-3 lg:hidden">{nav}</div>}
      <div className="mx-auto flex max-w-7xl gap-6 p-4 md:p-6">
        <aside className="hidden w-60 shrink-0 lg:block">
          <div className="sticky top-6 rounded-2xl bg-background p-4 shadow-soft">
            <div className="mb-1">
              <Logo />
            </div>
            <p className="mb-4 truncate text-xs text-muted-foreground" dir="ltr">
              {adminEmail}
            </p>
            {nav}
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 block text-center text-xs text-primary hover:underline"
            >
              مشاهده سایت
            </a>
          </div>
        </aside>
        <main id="admin-main" className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
