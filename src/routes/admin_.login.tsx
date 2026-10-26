import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { checkAdmin } from "@/lib/admin-guard";
import { Button } from "@/components/ui/button";
import { inputCls } from "@/components/admin/ContentManager";
import { Logo } from "@/components/site/Logo";

export const Route = createFileRoute("/admin_/login")({
  ssr: false,
  head: () => ({
    meta: [{ title: "ورود مدیر | پردیس" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "forgot">("login");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent): Promise<void> {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      toast.error("ایمیل معتبر وارد کنید.");
      return;
    }
    setBusy(true);
    if (mode === "forgot") {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/admin/reset-password`,
      });
      setBusy(false);
      void (error
        ? toast.error("ارسال ایمیل انجام نشد.")
        : toast.success("اگر این ایمیل ثبت شده باشد، لینک بازیابی برایتان ارسال شد."));
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setBusy(false);
      {
        toast.error("ایمیل یا رمز عبور نادرست است.");
        return;
      }
    }
    const { isAdmin } = await checkAdmin();
    setBusy(false);
    if (!isAdmin) {
      await supabase.auth.signOut();
      {
        toast.error("این حساب دسترسی مدیریت ندارد.");
        return;
      }
    }
    navigate({ to: "/admin" });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-lavender/60 p-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm space-y-4 rounded-2xl bg-background p-6 shadow-lift"
        noValidate
      >
        <div className="text-center">
          <Logo />
        </div>
        <h1 className="text-center text-xl">
          {mode === "login" ? "ورود مدیر" : "بازیابی رمز عبور"}
        </h1>
        <div>
          <label htmlFor="em" className="mb-1 block text-sm">
            ایمیل
          </label>
          <input
            id="em"
            type="email"
            dir="ltr"
            autoComplete="email"
            className={inputCls}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        {mode === "login" && (
          <div>
            <label htmlFor="pw" className="mb-1 block text-sm">
              رمز عبور
            </label>
            <input
              id="pw"
              type="password"
              dir="ltr"
              autoComplete="current-password"
              className={inputCls}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        )}
        <Button type="submit" variant="hero" size="xl" className="w-full" disabled={busy}>
          {busy ? "لطفاً صبر کنید…" : mode === "login" ? "ورود" : "ارسال لینک بازیابی"}
        </Button>
        <button
          type="button"
          className="w-full text-sm text-primary hover:underline"
          onClick={() => setMode(mode === "login" ? "forgot" : "login")}
        >
          {mode === "login" ? "رمز عبور را فراموش کرده‌اید؟" : "بازگشت به ورود"}
        </button>
        <Link to="/" className="block text-center text-xs text-muted-foreground hover:text-primary">
          بازگشت به سایت
        </Link>
      </form>
    </div>
  );
}
