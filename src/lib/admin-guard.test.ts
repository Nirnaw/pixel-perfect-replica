import { describe, expect, it, vi } from "vitest";
vi.mock("@/integrations/supabase/client", () => ({ supabase: {} }));
import { adminRedirectFor } from "./admin-guard";

describe("admin guard", () => {
  it("sends signed-out visitors to login", () => {
    expect(adminRedirectFor(null, false)).toBe("/admin/login");
  });
  it("blocks signed-in non-admins", () => {
    expect(adminRedirectFor("u1", false)).toBe("/admin/login");
  });
  it("lets admins in", () => {
    expect(adminRedirectFor("u1", true)).toBeNull();
  });
});
