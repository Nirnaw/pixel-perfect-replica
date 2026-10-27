import { createFileRoute } from "@tanstack/react-router";
import { ContentManager } from "@/components/admin/ContentManager";

export const Route = createFileRoute("/admin/doctors")({
  component: () => (
    <ContentManager
      table="doctors"
      title="پزشکان"
      titleField="name"
      imageField="image_url"
      publicKeys={[["doctors"]]}
      fields={[
        { name: "name", label: "نام", type: "text", required: true, max: 100 },
        { name: "role", label: "سمت", type: "text", max: 100 },
        { name: "bio", label: "معرفی کوتاه", type: "textarea", max: 1000 },
        { name: "image_url", nullable: true, label: "عکس پزشک", type: "image" },
      ]}
    />
  ),
});
