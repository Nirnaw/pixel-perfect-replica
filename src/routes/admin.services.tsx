import { createFileRoute } from "@tanstack/react-router";
import { ContentManager } from "@/components/admin/ContentManager";

export const Route = createFileRoute("/admin/services")({
  component: () => (
    <ContentManager
      table="services"
      title="خدمات"
      titleField="title"
      imageField="image_url"
      publicKeys={[["services"], ["service"]]}
      fields={[
        { name: "title", label: "عنوان خدمت", type: "text", required: true, max: 150 },
        { name: "slug", label: "نامک (آدرس صفحه)", type: "slug", required: true, slugFrom: "title", max: 80 },
        { name: "short_description", label: "توضیح کوتاه", type: "textarea", required: true, max: 400 },
        { name: "description", label: "توضیح کامل", type: "textarea", max: 5000 },
        { name: "image_url", label: "تصویر خدمت", type: "image" },
        { name: "department", label: "بخش", type: "select", options: [{ value: "", label: "بدون بخش" }, { value: "پوست", label: "پوست" }, { value: "لیزر", label: "لیزر" }] },
        { name: "featured", label: "نمایش در صفحه اول (منتخب)", type: "bool" },
        { name: "seo_title", label: "عنوان برای گوگل (اختیاری)", type: "text", max: 70 },
        { name: "seo_description", label: "توضیح برای گوگل (اختیاری)", type: "textarea", max: 170 },
      ]}
    />
  ),
});
