import { supabase } from "@/integrations/supabase/client";

/** Pure decision used by the /admin gate (tested). */
export function adminRedirectFor(userId: string | null, isAdmin: boolean): "/admin/login" | null {
  if (!userId) return "/admin/login";
  if (!isAdmin) return "/admin/login";
  return null;
}

export async function checkAdmin(): Promise<{
  userId: string | null;
  isAdmin: boolean;
  email: string | null;
}> {
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) return { userId: null, isAdmin: false, email: null };
  const { data: ok } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
  return { userId: user.id, isAdmin: ok === true, email: user.email ?? null };
}
