import { useEffect, useState, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { slugify } from "@/lib/media";
import { Button } from "@/components/ui/button";
import { SafeImg } from "@/components/site/SafeImg";
import { ImageUploadField } from "./ImageUploadField";

export type Field = {
  name: string;
  label: string;
  type: "text" | "textarea" | "markdown" | "image" | "video" | "bool" | "select" | "slug" | "date" | "datalist";
  required?: boolean;
  max?: number;
  options?: { value: string; label: string }[];
  slugFrom?: string;
  showIf?: (row: Row) => boolean;
  ltr?: boolean;
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Row = any;
type Table = "services" | "doctors" | "blog_posts" | "products" | "gallery_items";

export const inputCls =
  "w-full rounded-xl border border-input bg-background px-3 py-2 text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30";

export function ContentManager({
  table,
  title,
  fields,
  titleField,
  imageField,
  defaults = {},
  publicKeys,
  beforeSave,
}: {
  table: Table;
  title: string;
  fields: Field[];
  titleField: string;
  imageField?: string;
  defaults?: Row;
  publicKeys: string[][];
  beforeSave?: (row: Row) => Row;
}) {
  const qc = useQueryClient();
  const key = ["admin", table];
  const { data: rows = [], isLoading } = useQuery({
    queryKey: key,
    queryFn: async () => {
      const { data, error } = await supabase.from(table).select("*").order("sort_order").order("created_at");
      if (error) throw error;
      return data as Row[];
    },
  });
  const [editing, setEditing] = useState<Row | null>(null);

  const refresh = () => {
    qc.invalidateQueries({ queryKey: key });
    publicKeys.forEach((k) => qc.invalidateQueries({ queryKey: k }));
  };

  async function move(i: number, dir: -1 | 1) {
    const a = rows[i], b = rows[i + dir];
    if (!a || !b) return;
    const list = rows.map((r, idx) => ({ id: r.id, sort_order: idx + 1 }));
    list[i]!.sort_order = i + dir + 1;
    list[i + dir]!.sort_order = i + 1;
    for (const r of [list[i]!, list[i + dir]!]) {
      const { error } = await supabase.from(table).update({ sort_order: r.sort_order }).eq("id", r.id);
      if (error) { toast.error("تغییر ترتیب انجام نشد."); return; }
    }
    toast.success("ترتیب به‌روز شد.");
    refresh();
  }

  async function togglePublish(r: Row) {
    const { error } = await supabase.from(table).update({ published: !r.published }).eq("id", r.id);
    if (error) { toast.error("تغییر وضعیت انجام نشد."); return; }
    toast.success(r.published ? "به پیش‌نویس منتقل شد." : "منتشر شد.");
    refresh();
  }

  async function remove(r: Row) {
    if (!window.confirm(`«${r[titleField] || "این مورد"}» حذف شود؟ این کار قابل بازگشت نیست.`)) return;
    const { error } = await supabase.from(table).delete().eq("id", r.id);
    if (error) { toast.error("حذف انجام نشد."); return; }
    toast.success("حذف شد.");
    refresh();
  }

  if (editing) {
    return (
      <Editor
        table={table}
        fields={fields}
        initial={editing}
        nextOrder={rows.length + 1}
        beforeSave={beforeSave}
        onDone={(saved) => {
          setEditing(null);
          if (saved) refresh();
        }}
      />
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl">{title}</h1>
        <Button variant="hero" onClick={() => setEditing({ published: true, ...defaults })}>
          <Plus />افزودن مورد جدید
        </Button>
      </div>
      {isLoading ? (
        <p className="text-muted-foreground">در حال بارگذاری…</p>
      ) : rows.length === 0 ? (
        <p className="rounded-2xl bg-lavender/60 p-8 text-center text-muted-foreground">هنوز موردی ثبت نشده است.</p>
      ) : (
        <ul className="grid gap-3">
          {rows.map((r, i) => (
            <li key={r.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-soft">
              {imageField && (
                <SafeImg src={r[imageField] || r.before_url || undefined} alt="" className="h-14 w-20 shrink-0 rounded-lg object-cover" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-ink">{r[titleField] || "بدون عنوان"}</p>
                <span className={`text-xs ${r.published ? "text-primary" : "text-muted-foreground"}`}>
                  {r.published ? "منتشر شده" : "پیش‌نویس"}
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                <Button size="icon" variant="ghost" aria-label="بالا" disabled={i === 0} onClick={() => move(i, -1)}><ArrowUp /></Button>
                <Button size="icon" variant="ghost" aria-label="پایین" disabled={i === rows.length - 1} onClick={() => move(i, 1)}><ArrowDown /></Button>
                <Button size="sm" variant="soft" onClick={() => togglePublish(r)}>{r.published ? "پیش‌نویس کن" : "منتشر کن"}</Button>
                <Button size="sm" variant="outline" onClick={() => setEditing(r)}><Pencil />ویرایش</Button>
                <Button size="icon" variant="ghost" aria-label="حذف" onClick={() => remove(r)}><Trash2 className="text-destructive" /></Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Editor({
  table, fields, initial, nextOrder, beforeSave, onDone,
}: {
  table: Table; fields: Field[]; initial: Row; nextOrder: number;
  beforeSave?: ((row: Row) => Row) | undefined; onDone: (saved: boolean) => void;
}) {
  const [row, setRow] = useState<Row>(initial);
  const [saving, setSaving] = useState(false);
  const [slugTouched, setSlugTouched] = useState(!!initial.id);
  const set = (k: string, v: unknown) => setRow((r: Row) => ({ ...r, [k]: v }));

  const slugField = fields.find((f) => f.type === "slug");
  const slugSource = slugField?.slugFrom ? row[slugField.slugFrom] : undefined;
  useEffect(() => {
    if (slugField && !slugTouched && typeof slugSource === "string") set(slugField.name, slugify(slugSource));
  }, [slugSource]); // eslint-disable-line react-hooks/exhaustive-deps

  async function save() {
    for (const f of fields) {
      if (f.showIf && !f.showIf(row)) continue;
      const v = row[f.name];
      if (f.required && (v === undefined || v === null || String(v).trim() === "")) {
        { toast.error(`لطفاً «${f.label}» را وارد کنید.`); return; }
      }
      if (f.max && typeof v === "string" && v.length > f.max) {
        { toast.error(`«${f.label}» حداکثر ${f.max.toLocaleString("fa-IR")} کاراکتر باشد.`); return; }
      }
    }
    setSaving(true);
    let payload: Row = {};
    for (const f of fields) {
      let v = row[f.name];
      if (typeof v === "string") v = v.trim() === "" && f.type !== "text" && !f.required ? null : v.trim();
      payload[f.name] = v ?? (f.type === "bool" ? false : null);
    }
    payload.published = !!row.published;
    if (beforeSave) payload = beforeSave(payload);
    const q = row.id
      ? supabase.from(table).update(payload as never).eq("id", row.id)
      : supabase.from(table).insert({ ...payload, sort_order: nextOrder } as never);
    const { error } = await q;
    setSaving(false);
    if (error) {
      toast.error(error.code === "23505" ? "این نامک (آدرس) قبلاً استفاده شده است." : "ذخیره انجام نشد. مقادیر را بررسی کنید.");
      return;
    }
    toast.success("با موفقیت ذخیره شد.");
    onDone(true);
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl">{row.id ? "ویرایش" : "مورد جدید"}</h1>
      <div className="grid gap-5 rounded-2xl border border-border bg-card p-5 shadow-soft">
        {fields.map((f) => (f.showIf && !f.showIf(row) ? null : <FieldInput key={f.name} f={f} value={row[f.name]} onChange={(v) => { if (f.type === "slug") setSlugTouched(true); set(f.name, v); }} />))}
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={!!row.published} onChange={(e) => set("published", e.target.checked)} className="h-5 w-5 accent-primary" />
          <span>منتشر شود (در غیر این صورت پیش‌نویس می‌ماند)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          <Button variant="hero" size="xl" disabled={saving} onClick={save}>{saving ? "در حال ذخیره…" : "ذخیره"}</Button>
          <Button variant="soft" size="xl" onClick={() => onDone(false)}>انصراف</Button>
        </div>
      </div>
    </div>
  );
}

export function FieldInput({ f, value, onChange }: { f: Field; value: any; onChange: (v: any) => void }): ReactNode {
  const id = `f-${f.name}`;
  const lab = (
    <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">
      {f.label} {f.required && <span className="text-destructive">*</span>}
    </label>
  );
  switch (f.type) {
    case "image":
    case "video":
      return <ImageUploadField label={f.label} value={value} onChange={onChange} kind={f.type} />;
    case "bool":
      return (
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} className="h-5 w-5 accent-primary" />
          <span>{f.label}</span>
        </label>
      );
    case "select":
      return (
        <div>{lab}
          <select id={id} className={inputCls} value={value ?? ""} onChange={(e) => onChange(e.target.value || null)}>
            {f.options!.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      );
    case "datalist":
      return (
        <div>{lab}
          <input id={id} list={`${id}-l`} className={inputCls} value={value ?? ""} maxLength={f.max} onChange={(e) => onChange(e.target.value)} />
          <datalist id={`${id}-l`}>{f.options?.map((o) => <option key={o.value} value={o.value} />)}</datalist>
          <p className="mt-1 text-xs text-muted-foreground">از فهرست انتخاب کنید یا نام دسته جدید را بنویسید.</p>
        </div>
      );
    case "textarea":
      return <div>{lab}<textarea id={id} rows={4} className={inputCls} value={value ?? ""} maxLength={f.max} onChange={(e) => onChange(e.target.value)} /></div>;
    case "markdown":
      return (
        <div>{lab}
          <div className="grid gap-3 md:grid-cols-2">
            <textarea id={id} rows={14} className={`${inputCls} font-mono text-sm`} value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
            <div className="prose-fa max-h-[24rem] overflow-auto rounded-xl bg-muted p-4" aria-label="پیش‌نمایش">
              <ReactMarkdown>{value ?? ""}</ReactMarkdown>
            </div>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">برای تیتر از ## و برای فهرست از - استفاده کنید. سمت چپ پیش‌نمایش است.</p>
        </div>
      );
    case "date":
      return (
        <div>{lab}
          <input id={id} type="date" dir="ltr" className={inputCls} value={value ? String(value).slice(0, 10) : ""} onChange={(e) => onChange(e.target.value ? new Date(e.target.value).toISOString() : null)} />
        </div>
      );
    default:
      return (
        <div>{lab}
          <input id={id} dir={f.type === "slug" || f.ltr ? "ltr" : undefined} className={inputCls} value={value ?? ""} maxLength={f.max} onChange={(e) => onChange(f.type === "slug" ? slugify(e.target.value) : e.target.value)} />
          {f.type === "slug" && <p className="mt-1 text-xs text-muted-foreground">بخشی از آدرس صفحه؛ خودکار ساخته می‌شود و قابل ویرایش است.</p>}
        </div>
      );
  }
}
