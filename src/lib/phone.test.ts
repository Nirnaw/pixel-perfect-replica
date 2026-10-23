import { describe, expect, it } from "vitest";
import { isValidIranMobile, normalizeMobile, toEnglishDigits, telHref } from "./phone";

describe("phone utils", () => {
  it("converts Persian and Arabic digits", () => {
    expect(toEnglishDigits("۰۹۱۲۳٤٥٦")).toBe("09123456");
  });
  it("accepts 09xxxxxxxxx written in Persian digits", () => {
    expect(isValidIranMobile("۰۹۱۲۳۴۵۶۷۸۹")).toBe(true);
    expect(normalizeMobile("۰۹۱۲ ۳۴۵ ۶۷۸۹")).toBe("09123456789");
  });
  it("rejects wrong length or prefix", () => {
    expect(isValidIranMobile("0912345678")).toBe(false);
    expect(isValidIranMobile("01144420302")).toBe(false);
  });
  it("builds tel links for landlines", () => {
    expect(telHref("011-44420302")).toBe("tel:+981144420302");
  });
});
