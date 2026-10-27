import { z } from "zod";

export const adminAccountSchema = z.object({
  email: z.string().trim().email("ایمیل معتبر وارد کنید.").max(255),
  password: z.string().min(8, "رمز عبور حداقل ۸ کاراکتر باشد.").max(72),
});

export function adminRemovalError(callerId: string, targetId: string, count: number) {
  if (callerId === targetId) return "نمی‌توانید دسترسی خودتان را حذف کنید.";
  if (count <= 1) return "آخرین مدیر قابل حذف نیست.";
  return null;
}