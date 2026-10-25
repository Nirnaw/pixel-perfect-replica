import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { settingsQuery, type SiteSettings } from "@/lib/content";
import { Button } from "@/components/ui/button";
import { inputCls } from "@/components/admin/ContentManager";
import { ImageUploadField } from "@/components/admin/ImageUploadField";

export const Route = createFileRoute("/admin/settings")({
  loader: ({ context }) => context.queryClient.ensureQueryData(settingsQuery),
  component: Settings,
});

function T({ label, value, onChange, area, ltr }: { label: string; value: string; onChange: (v: string) => void; area?: boolean; ltr?: boolean }) {
  const id = `s-${label}`;
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-ink">{label}</label>
      {area ? <textarea id={id} rows={4} className={inputCls} value={value} onChange={(e) => onChange(e.target.value)} />
        : <input id={id} dir={ltr ? "ltr" : undefined} className={inputCls} value={value} onChange={(e) => onChange(e.target.value)} />}
    </div>
  );
}

function Settings() {
  const qc = useQueryClient();
  const { data } = useSuspenseQuery(settingsQuery);
  const [s, setS] = useState<SiteSettings>(() => structuredClone(data));
  const [busy, setBusy] = useState(false);
  const up = <K extends keyof SiteSettings>(k: K, patch: Partial<SiteSettings[K]>) => setS((p) => ({ ...p, [k]: { ...p[k], ...patch } }));

  async function save() {
    if (!s.clinic.name.trim()) return toast.error("نام مجموعه را وارد کنید.");
    if (s.clinic.phones.some((p) => !p.label.trim() || !p.number.trim())) return toast.error("برای هر شماره، عنوان و شماره را وارد کنید.");
    if (s.clinic.instagram && !/^https:\/\//.test(s.clinic.instagram)) return toast.error("نشانی اینستاگرام باید با https:// شروع شود.");
    setBusy(true);
    const keys = ["clinic", "hero", "about", "disclaimer"] as const;
    for (const k of keys) {
      const { error } = await supabase.from("site_settings").upsert({ key: k, value: s[k] as never }, { onConflict: "key" });
      if (error) { setBusy(false); return toast.error("ذخیره تنظیمات انجام نشد."); }
    }
    setBusy(false);
    toast.success("تنظیمات ذخیره شد.");
    qc.invalidateQueries({ queryKey: ["site_settings"] });
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl">تنظیمات سایت</h1>
      <section className="grid gap-4 rounded-2xl bg-background p-5 shadow-soft">
        <h2 className="text-lg">اطلاعات مجموعه</h2>
        <T label="نام مجموعه" value={s.clinic.name} onChange={(v) => up("clinic", { name: v })} />
        <T label="مدیر مجموعه" value={s.clinic.manager} onChange={(v) => up("clinic", { manager: v })} />
        <T label="آدرس" value={s.clinic.address} onChange={(v) => up("clinic", { address: v })} area />
        <T label="نشانی اینستاگرام" value={s.clinic.instagram} onChange={(v) => up("clinic", { instagram: v })} ltr />
        <T label="نام کاربری اینستاگرام (بدون @)" value={s.clinic.instagram_handle} onChange={(v) => up("clinic", { instagram_handle: v })} ltr />
        <div>
          <p className="mb-2 text-sm font-medium text-ink">شماره‌های تماس</p>
          {s.clinic.phones.map((p, i) => (
            <div key={i} className="mb-2 flex gap-2">
              <input aria-label="عنوان شماره" className={inputCls} value={p.label} onChange={(e) => up("clinic", { phones: s.clinic.phones.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)) })} />
              <input aria-label="شماره" dir="ltr" className={inputCls} value={p.number} onChange={(e) => up("clinic", { phones: s.clinic.phones.map((x, j) => (j === i ? { ...x, number: e.target.value } : x)) })} />
              <Button variant="ghost" size="icon" aria-label="حذف شماره" onClick={() => up("clinic", { phones: s.clinic.phones.filter((_, j) => j !== i) })}><Trash2 className="text-destructive" /></Button>
            </div>
          ))}
          <Button variant="soft" size="sm" onClick={() => up("clinic", { phones: [...s.clinic.phones, { label: "", number: "" }] })}><Plus />افزودن شماره</Button>
        </div>
      </section>
      <section className="grid gap-4 rounded-2xl bg-background p-5 shadow-soft">
        <h2 className="text-lg">صفحه اول</h2>
        <T label="عنوان اصلی" value={s.hero.title} onChange={(v) => up("hero", { title: v })} />
        <T label="زیرعنوان" value={s.hero.subtitle} onChange={(v) => up("hero", { subtitle: v })} />
        <T label="متن دکمه اول" value={s.hero.primary_cta} onChange={(v) => up("hero", { primary_cta: v })} />
        <T label="متن دکمه دوم" value={s.hero.secondary_cta} onChange={(v) => up("hero", { secondary_cta: v })} />
        <ImageUploadField label="تصویر بالای صفحه اول" value={s.hero.image ?? "/images/hero.jpg"} onChange={(v) => up("hero", { image: v ?? "" })} />
      </section>
      <section className="grid gap-4 rounded-2xl bg-background p-5 shadow-soft">
        <h2 className="text-lg">درباره ما و هشدار</h2>
        <T label="عنوان بخش درباره" value={s.about.title} onChange={(v) => up("about", { title: v })} />
        <T label="متن درباره" value={s.about.text} onChange={(v) => up("about", { text: v })} area />
        <ImageUploadField label="تصویر بخش درباره (اختیاری)" value={s.about.image} onChange={(v) => up("about", { image: v ?? "" })} />
        <T label="متن هشدار پایین صفحه" value={s.disclaimer.text} onChange={(v) => up("disclaimer", { text: v })} area />
      </section>
      <Button variant="hero" size="xl" disabled={busy} onClick={save}>{busy ? "در حال ذخیره…" : "ذخیره تنظیمات"}</Button>
    </div>
  );
}
