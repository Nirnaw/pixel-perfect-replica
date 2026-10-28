import { mapDirections, type SiteSettings } from "@/lib/content";

export function isOptionalHttpsUrl(value?: string): boolean {
  if (!value) return true;
  if (!/^https:\/\/\S+$/.test(value)) return false;
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

export function clinicDirections(clinic: SiteSettings["clinic"]) {
  const links: { label: string; href: string }[] = [];
  if (clinic.neshan_url && isOptionalHttpsUrl(clinic.neshan_url)) {
    links.push({ label: "مسیریابی با نشان", href: clinic.neshan_url });
  }
  if (clinic.balad_url && isOptionalHttpsUrl(clinic.balad_url)) {
    links.push({ label: "مسیریابی با بلد", href: clinic.balad_url });
  }
  links.push({ label: "مسیریابی با Google Maps", href: mapDirections(clinic.address) });
  return links;
}