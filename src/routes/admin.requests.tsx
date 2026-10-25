import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Phone, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { faDate, faNum } from "@/lib/content";
import { telHref, toEnglishDigits } from "@/lib/phone";
import { Button } from "@/components/ui/button";
import { inputCls } from "@/components/admin/ContentManager";

export const Route = createFileRoute("/admin/requests")({ component: Requests });

export const STATUS: Record<string, string> = { new: "جدید", called: "تماس گرفته شد", booked: "نوبت داده شد", cancelled: "لغو شد" };
const BADGE: Record<string, string> = { new: "bg-primary text-primary-foreground", called: "bg-lavender text-ink", booked: "bg-lavender-deep text-ink", cancelled: "bg-muted text-muted-foreground" };

function Requests() {
  const qc = useQueryClient();
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");
  const { data = [], isLoading } = useQuery({
    queryKey: ["admin", "requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointment_requests")
        .select("*, services(title)")
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return data;
    },
  });
  const refresh = () => { qc.invalidateQueries({ queryKey: ["admin"] }); };
  const term = toEnglishDigits(q.trim());
  const list = data.filter((r) => (!status || r.status === status) && (!term || r.full_name.includes(term) || r.mobile.includes(term)));
  const newCount = data.filter((r) => r.status === "new").length;

  async function update(id: string, patch: { status?: string; admin_note?: string | null }) {
    const { error } = await supabase.from("appointment_requests").update(patch).eq("id", id);
    if (error) return toast.error("ذخیره انجام نشد.");
    toast.success("ذخیره شد.");
    refresh();
  }
  async function remove(id: string, name: string) {
    if (!window.confirm(`درخواست «${name}» حذف شود؟`)) return;
    const { error } = await supabase.from("appointment_requests").delete().eq("id", id);
    if (error) return toast.error("حذف انجام نشد.");
    toast.success("حذف شد.");
    refresh();
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl">درخواست‌های نوبت</h1>
        {newCount > 0 && <span className="rounded-full bg-primary px-3 py-0.5 text-sm text-primary-foreground">{faNum(newCount)} جدید</span>}
      </div>
      <div className="mb-5 grid gap-3 sm:grid-cols-[1fr_auto]">
        <input aria-label="جستجو با نام یا موبایل" placeholder="جستجو با نام یا شماره موبایل" className={inputCls} value={q} onChange={(e) => setQ(e.target.value)} />
        <select aria-label="فیلتر وضعیت" className={inputCls} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">همه وضعیت‌ها</option>
          {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>
      {isLoading ? <p className="text-muted-foreground">در حال بارگذاری…</p> : list.length === 0 ? (
        <p className="rounded-2xl bg-background p-8 text-center text-muted-foreground">درخواستی پیدا نشد.</p>
      ) : (
        <ul className="grid gap-4">
          {list.map((r) => <RequestCard key={r.id} r={r} onUpdate={update} onRemove={remove} />)}
        </ul>
      )}
    </div>
  );
}

type Req = { id: string; full_name: string; mobile: string; status: string; department: string | null; notes: string | null; admin_note: string | null; created_at: string; services: { title: string } | null };

function RequestCard({ r, onUpdate, onRemove }: { r: Req; onUpdate: (id: string, p: { status?: string; admin_note?: string | null }) => void; onRemove: (id: string, n: string) => void }) {
  const [note, setNote] = useState(r.admin_note ?? "");
  return (
    <li className="rounded-2xl bg-background p-5 shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-lg font-medium text-ink">{r.full_name}</p>
          <a href={telHref(r.mobile)} className="mt-1 inline-flex items-center gap-2 text-primary hover:underline">
            <Phone className="h-4 w-4" aria-hidden /><span className="ltr">{r.mobile}</span>
          </a>
        </div>
        <div className="text-left">
          <span className={`rounded-full px-3 py-0.5 text-xs ${BADGE[r.status] ?? ""}`}>{STATUS[r.status] ?? r.status}</span>
          <p className="mt-1 text-xs text-muted-foreground">{faDate(r.created_at)} · {new Date(r.created_at).toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" })}</p>
        </div>
      </div>
      <dl className="mt-3 grid gap-1 text-sm sm:grid-cols-2">
        <div><dt className="inline text-muted-foreground">خدمت: </dt><dd className="inline">{r.services?.title ?? "—"}</dd></div>
        <div><dt className="inline text-muted-foreground">بخش: </dt><dd className="inline">{r.department ?? "—"}</dd></div>
        {r.notes && <div className="sm:col-span-2"><dt className="inline text-muted-foreground">توضیحات بیمار: </dt><dd className="inline">{r.notes}</dd></div>}
      </dl>
      <div className="mt-4 grid gap-3 md:grid-cols-[auto_1fr_auto] md:items-end">
        <div>
          <label htmlFor={`st-${r.id}`} className="mb-1 block text-xs text-muted-foreground">وضعیت</label>
          <select id={`st-${r.id}`} className={inputCls} value={r.status} onChange={(e) => onUpdate(r.id, { status: e.target.value })}>
            {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor={`nt-${r.id}`} className="mb-1 block text-xs text-muted-foreground">یادداشت داخلی (فقط برای مدیر)</label>
          <input id={`nt-${r.id}`} className={inputCls} maxLength={2000} value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
        <div className="flex gap-2">
          <Button variant="soft" disabled={note === (r.admin_note ?? "")} onClick={() => onUpdate(r.id, { admin_note: note.trim() || null })}>ذخیره یادداشت</Button>
          <Button variant="ghost" size="icon" aria-label="حذف درخواست" onClick={() => onRemove(r.id, r.full_name)}><Trash2 className="text-destructive" /></Button>
        </div>
      </div>
    </li>
  );
}
