export function fieldValue(value: unknown, type: string, nullable = false) {
  if (type === "bool") return !!value;
  const text = typeof value === "string" ? value.trim() : value;
  if (text === "" || text === undefined || text === null) return nullable ? null : "";
  return text;
}

export function contentSaveError(code: string) {
  if (code === "23505") return "این نامک (آدرس) قبلاً استفاده شده است.";
  if (code === "23502") return "یکی از فیلدهای ضروری خالی است";
  if (code === "42501") return "دسترسی لازم را ندارید؛ دوباره وارد شوید";
  return "ذخیره انجام نشد. مقادیر را بررسی کنید.";
}