import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { createFirstAdmin, getSetupStatus } from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { inputCls } from "@/components/admin/ContentManager";

export const Route = createFileRoute("/admin_/setup")({
  loader: async () => {
    const { needsSetup } = await getSetupStatus();
    if (!needsSetup) throw notFound();
    return null;
  },
  head: () => ({
    meta: [{ title: "راه‌اندازی مدیر | پردیس" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: Setup,
});

function Setup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent): Promise<void> {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      toast.error("ایمیل معتبر وارد کنید.");
      return;
    }
    if (pw.length < 8) {
      toast.error("رمز عبور باید حداقل ۸ کاراکتر باشد.");
      return;
    }
    setBusy(true);
    try {
      const res = await createFirstAdmin({ data: { email, password: pw } });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("حساب مدیر ساخته شد. اکنون وارد شوید.");
      navigate({ to: "/admin/login" });
    } catch {
      toast.error("ساخت حساب انجام نشد.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="flex min-h-screen items-center justify-center bg-lavender/60 p-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm space-y-4 rounded-2xl bg-background p-6 shadow-lift"
        noValidate
      >
        <h1 className="text-center text-xl">ساخت حساب مدیر (یک‌بار)</h1>
        <p className="text-sm text-muted-foreground">
          این صفحه فقط تا زمانی که هنوز مدیری تعریف نشده باز است.
        </p>
        <label htmlFor="se" className="block text-sm">
          ایمیل
        </label>
        <input
          id="se"
          type="email"
          dir="ltr"
          className={inputCls}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <label htmlFor="sp" className="block text-sm">
          رمز عبور (حداقل ۸ کاراکتر)
        </label>
        <input
          id="sp"
          type="password"
          dir="ltr"
          autoComplete="new-password"
          className={inputCls}
          value={pw}
          onChange={(e) => setPw(e.target.value)}
        />
        <Button type="submit" variant="hero" size="xl" className="w-full" disabled={busy}>
          {busy ? "در حال ساخت…" : "ساخت حساب مدیر"}
        </Button>
      </form>
    </div>
  );
}
