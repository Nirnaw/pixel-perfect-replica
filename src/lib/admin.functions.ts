import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

async function adminExists() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { count, error } = await supabaseAdmin
    .from("user_roles")
    .select("id", { count: "exact", head: true })
    .eq("role", "admin");
  if (error) throw new Error("خطا در بررسی وضعیت مدیر");
  return (count ?? 0) > 0;
}

/** Public: only tells whether the one-time setup is still open. */
export const getSetupStatus = createServerFn({ method: "GET" }).handler(async () => {
  return { needsSetup: !(await adminExists()) };
});

const setupSchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(72),
});

/** One-time: creates the first admin only while no admin exists. */
export const createFirstAdmin = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => setupSchema.parse(d))
  .handler(async ({ data }) => {
    if (await adminExists()) return { ok: false as const, error: "مدیر سایت قبلاً تعریف شده است." };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
    });
    if (error || !created.user) return { ok: false as const, error: "ساخت حساب ممکن نشد. شاید این ایمیل قبلاً ثبت شده باشد." };
    // Re-check right before granting to narrow the race window.
    if (await adminExists()) {
      await supabaseAdmin.auth.admin.deleteUser(created.user.id);
      return { ok: false as const, error: "مدیر سایت قبلاً تعریف شده است." };
    }
    const { error: roleErr } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: created.user.id, role: "admin" });
    if (roleErr) return { ok: false as const, error: "ثبت نقش مدیر ممکن نشد." };
    return { ok: true as const };
  });
