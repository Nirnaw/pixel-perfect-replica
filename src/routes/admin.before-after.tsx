import { createFileRoute } from "@tanstack/react-router";
import { ContentManager } from "@/components/admin/ContentManager";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/admin/before-after")({
  head: () => ({ meta: [...seo("مدیریت قبل و بعد", "ویرایش نمونه‌کارهای قبل و بعد پردیس."), { name: "robots", content: "noindex, nofollow" }] }),
  component: () => <ContentManager table="gallery_items" title="قبل و بعد" titleField="title" imageField="before_url" mediaType="before_after"
    defaults={{ media_type: "before_after", category: "قبل و بعد", published: false }} publicKeys={[["gallery"]]}
    beforeSave={(row) => ({ ...row, media_type: "before_after", category: "قبل و بعد", media_url: row.before_url ?? "" })}
    fields={[
      { name: "title", label: "عنوان / توضیح", type: "text", max: 150 },
      { name: "before_url", label: "تصویر «قبل»", type: "image", nullable: true, required: true },
      { name: "after_url", label: "تصویر «بعد»", type: "image", nullable: true, required: true },
      { name: "alt", label: "متن جایگزین تصویر", type: "text", max: 200 },
    ]} />,
});