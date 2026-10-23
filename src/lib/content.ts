import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Phone = { label: string; number: string };
export type SiteSettings = {
  clinic: {
    name: string;
    manager: string;
    address: string;
    instagram: string;
    instagram_handle: string;
    phones: Phone[];
  };
  hero: { title: string; subtitle: string; primary_cta: string; secondary_cta: string };
  about: { title: string; text: string };
  disclaimer: { text: string };
  theme?: Record<string, string>;
};

async function fetchSettings(): Promise<SiteSettings> {
  const { data, error } = await supabase
    .from("site_settings")
    .select("key,value")
    .eq("published", true);
  if (error) throw new Error(error.message);
  const map: Record<string, unknown> = {};
  for (const row of data ?? []) map[row.key] = row.value;
  return map as unknown as SiteSettings;
}

export const settingsQuery = queryOptions({
  queryKey: ["site_settings"],
  queryFn: fetchSettings,
  staleTime: 5 * 60_000,
});

export const servicesQuery = queryOptions({
  queryKey: ["services"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("services")
      .select("id,slug,title,short_description,image_url,department,featured")
      .eq("published", true)
      .order("sort_order");
    if (error) throw new Error(error.message);
    return data ?? [];
  },
  staleTime: 60_000,
});

export const serviceQuery = (slug: string) =>
  queryOptions({
    queryKey: ["service", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("slug", slug)
        .eq("published", true)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data;
    },
  });

export const doctorsQuery = queryOptions({
  queryKey: ["doctors"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("doctors")
      .select("id,name,role,bio,image_url")
      .eq("published", true)
      .order("sort_order");
    if (error) throw new Error(error.message);
    return data ?? [];
  },
});

export const galleryQuery = queryOptions({
  queryKey: ["gallery"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("gallery_items")
      .select("id,title,category,media_type,media_url,thumbnail_url,alt")
      .eq("published", true)
      .order("sort_order");
    if (error) throw new Error(error.message);
    return data ?? [];
  },
});

export const postsQuery = queryOptions({
  queryKey: ["posts"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("blog_posts")
      .select("id,slug,title,excerpt,cover_url,published_at,content")
      .eq("published", true)
      .order("published_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  },
});

export const postQuery = (slug: string) =>
  queryOptions({
    queryKey: ["post", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .eq("published", true)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data;
    },
  });

export const productsQuery = queryOptions({
  queryKey: ["products"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("products")
      .select("id,name,description,image_url,price_text")
      .eq("published", true)
      .order("sort_order");
    if (error) throw new Error(error.message);
    return data ?? [];
  },
});

export function readingTime(text: string): number {
  return Math.max(1, Math.round(text.trim().split(/\s+/).length / 200));
}

export const faNum = (n: number | string) => Number(n).toLocaleString("fa-IR");

export const faDate = (iso: string) =>
  new Date(iso).toLocaleDateString("fa-IR", { year: "numeric", month: "long", day: "numeric" });

export function mapEmbed(address: string) {
  return `https://maps.google.com/maps?q=${encodeURIComponent(address)}&z=16&output=embed`;
}
export function mapDirections(address: string) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
}
