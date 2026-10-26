import { createFileRoute } from "@tanstack/react-router";
import { ContentManager } from "@/components/admin/ContentManager";

export const Route = createFileRoute("/admin/posts")({
  component: () => (
    <ContentManager
      table="blog_posts"
      title="مقالات"
      titleField="title"
      imageField="cover_url"
      publicKeys={[["posts"], ["post"]]}
      beforeSave={(r) => {
        if (!r.published_at) delete r.published_at;
        if (r.content === null) r.content = "";
        if (r.excerpt === null) r.excerpt = "";
        return r;
      }}
      fields={[
        { name: "title", label: "عنوان مقاله", type: "text", required: true, max: 150 },
        {
          name: "slug",
          label: "نامک (آدرس صفحه)",
          type: "slug",
          required: true,
          slugFrom: "title",
          max: 80,
        },
        { name: "excerpt", label: "خلاصه", type: "textarea", max: 400 },
        { name: "cover_url", label: "تصویر کاور", type: "image" },
        { name: "content", label: "متن مقاله", type: "markdown", required: true },
        { name: "published_at", label: "تاریخ انتشار", type: "date" },
        { name: "seo_title", label: "عنوان برای گوگل (اختیاری)", type: "text", max: 70 },
        { name: "seo_description", label: "توضیح برای گوگل (اختیاری)", type: "textarea", max: 170 },
      ]}
    />
  ),
});
