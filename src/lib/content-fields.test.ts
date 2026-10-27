import { expect, it } from "vitest";
import { fieldValue, contentSaveError } from "./content-fields";

it("keeps NOT NULL optional text as empty strings", () => {
  for (const type of ["text", "textarea", "markdown"]) {
    expect(fieldValue("  ", type)).toBe("");
    expect(fieldValue(undefined, type)).toBe("");
  }
});
it("uses null only for explicitly nullable fields", () => {
  expect(fieldValue("", "image", true)).toBeNull();
  expect(fieldValue("", "text", true)).toBeNull();
  expect(fieldValue("", "select", true)).toBeNull();
});
it("reports required fields and permission errors", () => {
  expect(contentSaveError("23502")).toBe("یکی از فیلدهای ضروری خالی است");
  expect(contentSaveError("42501")).toBe("دسترسی لازم را ندارید؛ دوباره وارد شوید");
});