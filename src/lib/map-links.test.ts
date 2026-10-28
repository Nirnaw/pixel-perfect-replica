import { describe, expect, it } from "vitest";
import { clinicDirections, isOptionalHttpsUrl } from "./map-links";

const clinic = { name: "", manager: "", address: "بابل", instagram: "", instagram_handle: "", phones: [] };

describe("optional clinic map links", () => {
  it("accepts empty and HTTPS links only", () => {
    expect(isOptionalHttpsUrl("")).toBe(true);
    expect(isOptionalHttpsUrl(undefined)).toBe(true);
    expect(isOptionalHttpsUrl("https://nshn.ir/1e_bfkb85FLL5V")).toBe(true);
    expect(isOptionalHttpsUrl("https://balad.ir/p/3NKc52a0uVUstC")).toBe(true);
    expect(isOptionalHttpsUrl("http://balad.ir/p/3NKc52a0uVUstC")).toBe(false);
    expect(isOptionalHttpsUrl("https://")).toBe(false);
    expect(isOptionalHttpsUrl("javascript:alert(1)")).toBe(false);
  });
  it("offers the configured Iranian apps first and Google last", () => {
    expect(clinicDirections({ ...clinic, neshan_url: "https://nshn.ir/1e_bfkb85FLL5V", balad_url: "https://balad.ir/p/3NKc52a0uVUstC" }).map((x) => x.href)).toEqual([
      "https://nshn.ir/1e_bfkb85FLL5V",
      "https://balad.ir/p/3NKc52a0uVUstC",
      "https://www.google.com/maps/dir/?api=1&destination=%D8%A8%D8%A7%D8%A8%D9%84",
    ]);
  });
  it("omits unset app links without removing Google", () => {
    expect(clinicDirections(clinic)).toHaveLength(1);
    expect(clinicDirections({ ...clinic, balad_url: "https://balad.ir/p/3NKc52a0uVUstC" })).toHaveLength(2);
  });
});