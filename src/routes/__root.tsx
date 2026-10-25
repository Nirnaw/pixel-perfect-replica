import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  useRouterState,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { settingsQuery } from "@/lib/content";
import { toEnglishDigits } from "@/lib/phone";
import { Toaster } from "@/components/ui/sonner";
import { SiteFooter, SiteHeader, FloatingButtons } from "@/components/site/Layout";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-6xl text-primary">۴۰۴</h1>
        <h2 className="mt-4 text-xl">صفحه پیدا نشد</h2>
        <p className="mt-2 text-sm text-muted-foreground">صفحه‌ای که دنبال آن هستید وجود ندارد یا جابه‌جا شده است.</p>
        <Link to="/" className="mt-6 inline-flex rounded-full bg-primary px-5 py-2 text-sm text-primary-foreground hover:bg-primary/90">
          بازگشت به خانه
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl">صفحه بارگذاری نشد</h1>
        <p className="mt-2 text-sm text-muted-foreground">مشکلی پیش آمد. لطفاً دوباره تلاش کنید.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="rounded-full bg-primary px-5 py-2 text-sm text-primary-foreground hover:bg-primary/90"
          >
            تلاش دوباره
          </button>
          <a href="/" className="rounded-full border border-input px-5 py-2 text-sm hover:bg-accent">
            بازگشت به خانه
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  loader: ({ context }) => context.queryClient.ensureQueryData(settingsQuery),
  head: ({ loaderData }) => {
    const c = loaderData?.clinic;
    const jsonLd = c
      ? {
          "@context": "https://schema.org",
          "@type": "MedicalBusiness",
          name: c.name,
          medicalSpecialty: ["Dermatology", "PlasticSurgery"],
          address: {
            "@type": "PostalAddress",
            streetAddress: c.address,
            addressLocality: "بابل",
            addressRegion: "مازندران",
            addressCountry: "IR",
          },
          telephone: c.phones?.map((p) => "+98" + toEnglishDigits(p.number).replace(/\D/g, "").slice(1)),
          sameAs: [c.instagram],
        }
      : null;
    return {
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { name: "theme-color", content: "#7B6A8D" },
        { title: "مجتمع پزشکی و زیبایی پردیس" },
        { name: "description", content: "خدمات تخصصی پوست، مو و زیبایی در بابل" },
      ],
      links: [
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
        { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;600;700&display=swap" },
        { rel: "stylesheet", href: appCss },
        { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      ],
      scripts: jsonLd ? [{ type: "application/ld+json", children: JSON.stringify(jsonLd) }] : [],
    };
  },
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const isAdmin = useRouterState({ select: (s) => s.location.pathname.startsWith("/admin") });
  if (isAdmin)
    return (
      <QueryClientProvider client={queryClient}>
        <Outlet />
        <Toaster position="top-center" richColors />
      </QueryClientProvider>
    );
  return (
    <QueryClientProvider client={queryClient}>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:right-3 focus:top-3 focus:z-50 focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-primary-foreground">
        رفتن به محتوای اصلی
      </a>
      <SiteHeader />
      <main id="main">
        <Outlet />
      </main>
      <SiteFooter />
      <FloatingButtons />
    </QueryClientProvider>
  );
}
