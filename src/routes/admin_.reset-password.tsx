import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { inputCls } from "@/components/admin/ContentManager";

export const Route = createFileRoute("/admin_/reset-password")({
  ssr: false,
  head: () => ({
    meta: [{ title: "تعیین رمز جدید | پردیس" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: Reset,
});

function Reset() {
  const navigate = useNavigate();
  const [pw, setPw] = useState("");
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (pw.length < 8) {
      toast.error("رمز عبور باید حداقل ۸ کاراکتر باشد.");
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: pw });
    if (error) {
      toast.error("تغییر رمز انجام نشد. لینک را دوباره درخواست کنید.");
      return;
    }
    toast.success("رمز عبور تغییر کرد.");
    navigate({ to: "/admin" });
  }
  return (
    <div className="flex min-h-screen items-center justify-center bg-lavender/60 p-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm space-y-4 rounded-2xl bg-background p-6 shadow-lift"
      >
        <h1 className="text-center text-xl">تعیین رمز عبور جدید</h1>
        <label htmlFor="np" className="block text-sm">
          رمز جدید
        </label>
        <input
          id="np"
          type="password"
          dir="ltr"
          autoComplete="new-password"
          className={inputCls}
          value={pw}
          onChange={(e) => setPw(e.target.value)}
        />
        <Button type="submit" variant="hero" size="xl" className="w-full">
          ذخیره رمز
        </Button>
      </form>
    </div>
  );
}
