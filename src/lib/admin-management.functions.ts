import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { adminAccountSchema } from "./admin-rules";

const adminOnly = requireSupabaseAuth;
const genericError = "انجام عملیات ممکن نشد؛ لطفاً دوباره تلاش کنید.";

export const listAdmins = createServerFn({ method: "POST" })
  .middleware([adminOnly])
  .handler(async ({ context }) => {
    const { data: allowed, error } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (error || !allowed) throw new Error("دسترسی لازم را ندارید؛ دوباره وارد شوید.");
    const { data: roles, error: rolesError } = await context.supabase.from("user_roles").select("user_id").eq("role", "admin");
    if (rolesError) throw new Error(genericError);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const admins = await Promise.all((roles ?? []).map(async (role) => {
      const { data, error: userError } = await supabaseAdmin.auth.admin.getUserById(role.user_id);
      if (userError || !data.user) throw new Error(genericError);
      return { id: data.user.id, email: data.user.email ?? "", createdAt: data.user.created_at, isSelf: data.user.id === context.userId };
    }));
    return admins.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  });

export const addAdmin = createServerFn({ method: "POST" })
  .middleware([adminOnly])
  .inputValidator((input: unknown) => adminAccountSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: allowed, error } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (error || !allowed) return { ok: false, error: "دسترسی لازم را ندارید؛ دوباره وارد شوید." };
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      let userId: string | undefined;
      let existing = false;
      for (let page = 1; ; page++) {
        const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 100 });
        if (listError) throw listError;
        const found = users.users.find((user) => user.email?.toLowerCase() === data.email.toLowerCase());
        if (found) { userId = found.id; existing = true; break; }
        if (users.users.length < 100) break;
      }
      if (!userId) {
        const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({ email: data.email, password: data.password, email_confirm: true });
        if (createError || !created.user) throw new Error(genericError);
        userId = created.user.id;
      }
      const { error: roleError } = await supabaseAdmin.from("user_roles").upsert({ user_id: userId, role: "admin" }, { onConflict: "user_id,role", ignoreDuplicates: true });
      if (roleError) throw roleError;
      return { ok: true, existing };
    } catch { return { ok: false, error: genericError }; }
  });

export const removeAdmin = createServerFn({ method: "POST" })
  .middleware([adminOnly])
  .inputValidator((input: unknown) => z.object({ userId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: allowed, error } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (error || !allowed) return { ok: false, error: "دسترسی لازم را ندارید؛ دوباره وارد شوید." };
    if (data.userId === context.userId) return { ok: false, error: "نمی‌توانید دسترسی خودتان را حذف کنید." };
    const { error: removeError } = await context.supabase.rpc("remove_admin_access", { target_user_id: data.userId });
    if (removeError) return { ok: false, error: removeError.message === "LAST_ADMIN" ? "آخرین مدیر قابل حذف نیست." : genericError };
    return { ok: true };
  });