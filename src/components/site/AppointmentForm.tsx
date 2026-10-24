import { useState, type FormEvent } from "react";
import { CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { isValidIranMobile, normalizeMobile, toEnglishDigits } from "@/lib/phone";
import { Button } from "@/components/ui/button";

type Service = { id: string; slug: string; title: string };
const RL_KEY = "pardis_appt_times";
const SUCCESS = "درخواست شما ثبت شد؛ همکاران ما به‌زودی با شما تماس می‌گیرند.";

function rateLimited(): string | null {
  try {
    const now = Date.now();
    const times: number[] = JSON.parse(localStorage.getItem(RL_KEY) || "[]").filter(
      (t: number) => now - t < 60 * 60_000,
    );
    if (times.length && now - times[times.length - 1] < 60_000)
      return "لطفاً یک دقیقه دیگر دوباره تلاش کنید.";
    if (times.length >= 3) return "تعداد درخواست‌های شما زیاد است. لطفاً بعداً تلاش کنید یا تماس بگیرید.";
  } catch {
    /* ignore */
  }
  return null;
}
function recordSubmit() {
  try {
    const times: number[] = JSON.parse(localStorage.getItem(RL_KEY) || "[]");
    localStorage.setItem(RL_KEY, JSON.stringify([...times, Date.now()].slice(-5)));
  } catch {
    /* ignore */
  }
}

const field =
  "w-full rounded-xl border border-input bg-background px-4 py-3 text-base text-ink placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30";

export function AppointmentForm({ services, defaultService }: { services: Service[]; defaultService?: string | undefined }) {
  const initial = services.find((s) => s.slug === defaultService)?.id ?? "";
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [serviceId, setServiceId] = useState(initial);
  const [department, setDepartment] = useState("");
  const [notes, setNotes] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [formError, setFormError] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError("");
    const errs: Record<string, string> = {};
    if (name.trim().length < 2) errs.name = "لطفاً نام و نام خانوادگی را وارد کنید.";
    if (!mobile.trim()) errs.mobile = "لطفاً شماره موبایل را وارد کنید.";
    else if (!isValidIranMobile(mobile)) errs.mobile = "شماره موبایل باید به شکل ۰۹xxxxxxxxx و ۱۱ رقم باشد.";
    if (notes.length > 1000) errs.notes = "توضیحات حداکثر ۱۰۰۰ کاراکتر باشد.";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    if (website) {
      setStatus("done");
      return;
    }
    const rl = rateLimited();
    if (rl) {
      setFormError(rl);
      return;
    }
    setStatus("sending");
    const { error } = await supabase.from("appointment_requests").insert({
      full_name: name.trim().slice(0, 100),
      mobile: normalizeMobile(mobile),
      service_id: serviceId || null,
      department: department || null,
      notes: notes.trim() || null,
    });
    if (error) {
      setStatus("idle");
      setFormError("ثبت درخواست با مشکل روبه‌رو شد. لطفاً دوباره تلاش کنید یا تماس بگیرید.");
      return;
    }
    recordSubmit();
    setStatus("done");
  }

  if (status === "done") {
    return (
      <div role="status" className="flex flex-col items-center rounded-2xl bg-lavender p-10 text-center">
        <CheckCircle2 className="h-12 w-12 text-primary" aria-hidden />
        <p className="mt-4 text-lg text-ink">{SUCCESS}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-5" aria-label="فرم درخواست نوبت">
      <div>
        <label htmlFor="ap-name" className="mb-1.5 block text-sm font-medium text-ink">
          نام و نام خانوادگی <span className="text-destructive">*</span>
        </label>
        <input id="ap-name" className={field} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" maxLength={100} aria-invalid={!!errors.name} aria-describedby="ap-name-err" />
        {errors.name && <p id="ap-name-err" className="mt-1 text-sm text-destructive">{errors.name}</p>}
      </div>
      <div>
        <label htmlFor="ap-mobile" className="mb-1.5 block text-sm font-medium text-ink">
          شماره موبایل <span className="text-destructive">*</span>
        </label>
        <input
          id="ap-mobile"
          dir="ltr"
          inputMode="numeric"
          autoComplete="tel"
          placeholder="09xxxxxxxxx"
          className={`${field} text-left`}
          value={mobile}
          onChange={(e) => setMobile(toEnglishDigits(e.target.value))}
          maxLength={14}
          aria-invalid={!!errors.mobile}
          aria-describedby="ap-mobile-err"
        />
        {errors.mobile && <p id="ap-mobile-err" className="mt-1 text-sm text-destructive">{errors.mobile}</p>}
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="ap-service" className="mb-1.5 block text-sm font-medium text-ink">خدمت مورد نظر</label>
          <select id="ap-service" className={field} value={serviceId} onChange={(e) => setServiceId(e.target.value)}>
            <option value="">انتخاب کنید</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>{s.title}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="ap-dept" className="mb-1.5 block text-sm font-medium text-ink">بخش (اختیاری)</label>
          <select id="ap-dept" className={field} value={department} onChange={(e) => setDepartment(e.target.value)}>
            <option value="">فرقی نمی‌کند</option>
            <option value="پوست">پوست</option>
            <option value="لیزر">لیزر</option>
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="ap-notes" className="mb-1.5 block text-sm font-medium text-ink">توضیحات (اختیاری)</label>
        <textarea id="ap-notes" rows={4} className={field} value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={1000} />
        {errors.notes && <p className="mt-1 text-sm text-destructive">{errors.notes}</p>}
      </div>
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="ap-website">وب‌سایت</label>
        <input id="ap-website" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
      </div>
      {formError && <p role="alert" className="text-sm text-destructive">{formError}</p>}
      <Button type="submit" variant="hero" size="xl" disabled={status === "sending"}>
        {status === "sending" ? "در حال ثبت…" : "ثبت درخواست نوبت"}
      </Button>
      <p className="text-xs text-muted-foreground">این فرم درخواست نوبت است؛ زمان دقیق پس از تماس همکاران ما هماهنگ می‌شود.</p>
    </form>
  );
}
