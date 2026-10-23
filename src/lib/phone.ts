const PERSIAN = "۰۱۲۳۴۵۶۷۸۹";
const ARABIC = "٠١٢٣٤٥٦٧٨٩";

/** Convert Persian/Arabic digits to English digits. */
export function toEnglishDigits(input: string): string {
  return input.replace(/[۰-۹٠-٩]/g, (d) => {
    const p = PERSIAN.indexOf(d);
    return String(p >= 0 ? p : ARABIC.indexOf(d));
  });
}

/** Normalize an Iranian mobile: digits only, +98/0098 → 0. */
export function normalizeMobile(input: string): string {
  let v = toEnglishDigits(input).replace(/[^\d+]/g, "");
  if (v.startsWith("+98")) v = "0" + v.slice(3);
  else if (v.startsWith("0098")) v = "0" + v.slice(4);
  else if (v.startsWith("98") && v.length === 12) v = "0" + v.slice(2);
  else if (v.startsWith("9") && v.length === 10) v = "0" + v;
  return v.replace(/\+/g, "");
}

export function isValidIranMobile(input: string): boolean {
  return /^09\d{9}$/.test(normalizeMobile(input));
}

/** "011-44420302" → "+981144420302" for tel: links */
export function telHref(number: string): string {
  const d = toEnglishDigits(number).replace(/\D/g, "");
  return "tel:" + (d.startsWith("0") ? "+98" + d.slice(1) : d);
}
