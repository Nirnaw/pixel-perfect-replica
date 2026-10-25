import { createFileRoute } from "@tanstack/react-router";
import { ContentManager } from "@/components/admin/ContentManager";

const isImg = (r: Record<string, unknown>) => (r.media_type ?? "image") === "image";
const isVid = (r: Record<string, unknown>) => r.media_type === "video";
const isBA = (r: Record<string, unknown>) => r.media_type === "before_after";

export const Route = createFileRoute("/admin/gallery")({
  component: () => (
    <ContentManager
      table="gallery_items"
      title="گالری"
      titleField="title"
      imageField="media_url"
      defaults={{ media_type: "image", category: "محیط مجموعه" }}
      publicKeys={[["gallery"]]}
      beforeSave={(r) => {
        const out = { ...r, title: r.title ?? "", alt: r.alt ?? r.title ?? "" };
        if (r.media_type === "before_after") out.media_url = r.before_url ?? r.after_url ?? "";
        return out;
      }}
      fields={[
        { name: "media_type", label: "نوع", type: "select", options: [{ value: "image", label: "تصویر" }, { value: "video", label: "ویدیو" }, { value: "before_after", label: "قبل و بعد" }] },
        { name: "title", label: "عنوان / توضیح", type: "text", max: 150 },
        { name: "category", label: "دسته", type: "datalist", required: true, max: 60, options: ["محیط مجموعه", "تجهیزات", "مراقبت پوست", "قبل و بعد", "پزشکان"].map((v) => ({ value: v, label: v })) },
        { name: "media_url", label: "تصویر", type: "image", required: true, showIf: isImg },
        { name: "media_url", label: "ویدیو", type: "video", required: true, showIf: isVid },
        { name: "thumbnail_url", label: "تصویر پیش‌نمایش ویدیو (اختیاری)", type: "image", showIf: isVid },
        { name: "before_url", label: "تصویر «قبل»", type: "image", required: true, showIf: isBA },
        { name: "after_url", label: "تصویر «بعد»", type: "image", required: true, showIf: isBA },
        { name: "alt", label: "متن جایگزین تصویر (برای دسترسی‌پذیری)", type: "text", max: 200 },
      ]}
    />
  ),
});
