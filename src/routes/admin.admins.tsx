import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Shield, Trash2 } from "lucide-react";
import { listAdmins, addAdmin, removeAdmin } from "@/lib/admin-management.functions";
import { adminAccountSchema } from "@/lib/admin-rules";
import { faDate } from "@/lib/content";
import { seo } from "@/lib/seo";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { inputCls } from "@/components/admin/ContentManager";

export const Route = createFileRoute("/admin/admins")({
  head: () => ({ meta: [...seo("مدیران", "مدیریت دسترسی مدیران مجتمع پردیس."), { name: "robots", content: "noindex, nofollow" }] }),
  component: Admins,
});

function Admins() {
  const list = useServerFn(listAdmins), add = useServerFn(addAdmin), remove = useServerFn(removeAdmin);
  const qc = useQueryClient();
  const { data: admins = [], isLoading, error } = useQuery({ queryKey: ["admin", "admins"], queryFn: () => list() });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [ownPassword, setOwnPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [hint, setHint] = useState("");
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const validated = adminAccountSchema.safeParse({ email, password });
    if (!validated.success) { toast.error(validated.error.issues[0]?.message ?? "مقادیر را بررسی کنید."); return; }
    setBusy(true);
    try {
      const result = await add({ data: validated.data });
      if (!result.ok) { toast.error(result.error); return; }
      setHint(result.existing ? "دسترسی مدیر اضافه شد. رمز حساب موجود تغییر نکرد؛ از مدیر جدید بخواهید رمز خود را از همین صفحه تغییر دهد." : "مدیر اضافه شد. رمز اولیه را از راهی امن به مدیر جدید بدهید و بخواهید رمز خود را از همین صفحه تغییر دهد.");
      setEmail(""); setPassword("");
      toast.success("دسترسی مدیر ثبت شد.");
      await qc.invalidateQueries({ queryKey: ["admin", "admins"] });
    } catch { toast.error("انجام عملیات ممکن نشد؛ دوباره وارد شوید."); }
    finally { setBusy(false); }
  }
  async function revoke(id: string) {
    if (!window.confirm("دسترسی این مدیر حذف شود؟")) return;
    setBusy(true);
    try {
      const result = await remove({ data: { userId: id } });
      if (!result.ok) { toast.error(result.error); return; }
      toast.success("دسترسی مدیر حذف شد.");
      await qc.invalidateQueries({ queryKey: ["admin", "admins"] });
    } catch { toast.error("حذف دسترسی انجام نشد؛ دوباره تلاش کنید."); }
    finally { setBusy(false); }
  }
  async function changePassword(event: React.FormEvent) {
    event.preventDefault();
    if (ownPassword.length < 8 || ownPassword.length > 72) { toast.error("رمز عبور بین ۸ تا ۷۲ کاراکتر باشد."); return; }
    setBusy(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password: ownPassword });
      if (updateError) { toast.error("تغییر رمز انجام نشد؛ دوباره تلاش کنید."); return; }
      setOwnPassword(""); toast.success("رمز عبور شما تغییر کرد.");
    } catch { toast.error("تغییر رمز انجام نشد؛ دوباره تلاش کنید."); }
    finally { setBusy(false); }
  }
  return <div>
    <h1 className="mb-6 flex items-center gap-2 text-2xl"><Shield />مدیران</h1>
    {isLoading ? <p>در حال بارگذاری…</p> : error ? <p role="alert">نمایش مدیران ممکن نشد؛ دوباره وارد شوید.</p> : <ul className="space-y-3">{admins.map((admin) => <li key={admin.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-4">
      <div className="min-w-0 flex-1"><p className="break-all" dir="ltr">{admin.email}</p><p className="text-xs text-muted-foreground">تاریخ ایجاد: {faDate(admin.createdAt)}</p></div>
      {admin.isSelf && <span className="rounded-full bg-lavender px-3 py-1 text-sm">شما</span>}
      {!admin.isSelf && <Button variant="outline" disabled={busy || admins.length <= 1} onClick={() => revoke(admin.id)}><Trash2 />حذف دسترسی مدیر</Button>}
    </li>)}</ul>}
    <section className="mt-8"><h2 className="mb-4 text-xl">افزودن مدیر</h2><form onSubmit={submit} className="grid max-w-lg gap-4">
      <label>ایمیل<input className={inputCls} type="email" dir="ltr" autoComplete="off" required value={email} onChange={(e) => setEmail(e.target.value)} /></label>
      <label>رمز عبور اولیه<input className={inputCls} type="password" dir="ltr" autoComplete="new-password" minLength={8} maxLength={72} required value={password} onChange={(e) => setPassword(e.target.value)} /></label>
      <Button variant="hero" disabled={busy} type="submit">افزودن مدیر</Button>
    </form>{hint && <p role="status" className="mt-4 rounded-lg bg-lavender/60 p-4 text-sm">{hint}</p>}</section>
    <section className="mt-8"><h2 className="mb-4 text-xl">تغییر رمز عبور من</h2><form onSubmit={changePassword} className="grid max-w-lg gap-4">
      <label>رمز عبور جدید<input className={inputCls} type="password" dir="ltr" autoComplete="new-password" minLength={8} maxLength={72} required value={ownPassword} onChange={(e) => setOwnPassword(e.target.value)} /></label>
      <Button variant="outline" disabled={busy} type="submit">تغییر رمز عبور</Button>
    </form></section>
  </div>;
}