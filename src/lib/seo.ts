export const SITE_NAME = "مجتمع پزشکی و زیبایی پردیس";

export function seo(title: string, description: string, opts: { type?: string; image?: string } = {}) {
  const full = title.includes("پردیس") ? title : `${title} | ${SITE_NAME}`;
  const meta: Array<Record<string, string>> = [
    { title: full },
    { name: "description", content: description },
    { property: "og:title", content: full },
    { property: "og:description", content: description },
    { property: "og:type", content: opts.type ?? "website" },
    { property: "og:locale", content: "fa_IR" },
    { property: "og:site_name", content: SITE_NAME },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: full },
    { name: "twitter:description", content: description },
  ];
  if (opts.image && /^https:\/\//.test(opts.image)) {
    meta.push({ property: "og:image", content: opts.image }, { name: "twitter:image", content: opts.image });
  }
  return meta;
}
