import { createFileRoute } from "@tanstack/react-router";
import { ContentManager } from "@/components/admin/ContentManager";

export const Route = createFileRoute("/admin/products")({
  component: () => (
    <ContentManager
      table="products"
      title="محصولات"
      titleField="name"
      imageField="image_url"
      publicKeys={[["products"]]}
      beforeSave={(r) => ({ ...r, description: r.description ?? "" })}
      fields={[
        { name: "name", label: "نام محصول", type: "text", required: true, max: 150 },
        { name: "description", label: "توضیحات", type: "textarea", max: 1000 },
        { name: "image_url", nullable: true, label: "تصویر محصول", type: "image" },
        { name: "price_text", nullable: true, label: "قیمت (متن دلخواه، اختیاری)", type: "text", max: 80 },
      ]}
    />
  ),
});
