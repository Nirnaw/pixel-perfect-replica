import { describe, expect, it } from "vitest";
import { adminAccountSchema, adminRemovalError } from "./admin-rules";

describe("admin rules", () => {
  it("requires at least eight password characters", () => {
    expect(adminAccountSchema.safeParse({ email: "owner@example.com", password: "1234567" }).success).toBe(false);
    expect(adminAccountSchema.safeParse({ email: "owner@example.com", password: "12345678" }).success).toBe(true);
  });
  it("prevents self-removal even when other admins exist", () => {
    expect(adminRemovalError("a", "a", 2)).toBe("نمی‌توانید دسترسی خودتان را حذف کنید.");
  });
  it("prevents removing the last admin", () => {
    expect(adminRemovalError("a", "b", 1)).toBe("آخرین مدیر قابل حذف نیست.");
    expect(adminRemovalError("a", "b", 2)).toBeNull();
  });
});