import { sql } from "drizzle-orm";
import {
  pgTable,
  uuid,
  text,
  boolean,
  integer,
  timestamp,
  jsonb,
  check,
  index,
} from "drizzle-orm/pg-core";

const timestamps = () => ({
  created_at: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp({ withTimezone: true }).notNull().defaultNow(),
});
const contentFields = () => ({
  id: uuid().primaryKey().defaultRandom(),
  published: boolean().notNull().default(true),
  sort_order: integer().notNull().default(0),
  revision: integer().notNull().default(1),
  ...timestamps(),
});
export type SettingsValue = Record<string, unknown>;
export const siteSettings = pgTable(
  "site_settings",
  {
    ...contentFields(),
    key: text().notNull().unique(),
    value: jsonb().$type<SettingsValue>().notNull(),
  },
  (t) => [
    check("settings_key", sql`${t.key} in ('clinic','hero','about','theme','disclaimer')`),
    check("settings_object", sql`jsonb_typeof(${t.value}) = 'object'`),
    check(
      "settings_map_urls",
      sql`${t.key} <> 'clinic' or (
    (not (${t.value} ? 'neshan_url') or ${t.value}->'neshan_url' = 'null'::jsonb or (jsonb_typeof(${t.value}->'neshan_url') = 'string' and (${t.value}->>'neshan_url' = '' or ${t.value}->>'neshan_url' ~ '^https://[^[:space:]]+$')))
    and (not (${t.value} ? 'balad_url') or ${t.value}->'balad_url' = 'null'::jsonb or (jsonb_typeof(${t.value}->'balad_url') = 'string' and (${t.value}->>'balad_url' = '' or ${t.value}->>'balad_url' ~ '^https://[^[:space:]]+$'))))`,
    ),
  ],
);
export const services = pgTable(
  "services",
  {
    ...contentFields(),
    slug: text().notNull().unique(),
    title: text().notNull(),
    short_description: text().notNull().default(""),
    description: text().notNull().default(""),
    image_url: text(),
    department: text(),
    featured: boolean().notNull().default(false),
    seo_title: text(),
    seo_description: text(),
  },
  (t) => [
    check("service_title", sql`char_length(btrim(${t.title})) between 1 and 150`),
    check(
      "service_slug",
      sql`char_length(${t.slug}) between 1 and 80 and ${t.slug} !~ '[[:space:]/?#]'`,
    ),
    check(
      "service_text",
      sql`char_length(${t.short_description}) <= 400 and char_length(${t.description}) <= 5000`,
    ),
    check("service_department", sql`${t.department} in ('پوست','لیزر')`),
    check(
      "service_seo",
      sql`char_length(${t.seo_title}) <= 70 and char_length(${t.seo_description}) <= 170`,
    ),
    index("services_public_order").on(t.published, t.sort_order, t.id),
  ],
);
export const doctors = pgTable(
  "doctors",
  {
    ...contentFields(),
    name: text().notNull(),
    role: text().notNull().default(""),
    bio: text().notNull().default(""),
    image_url: text(),
  },
  (t) => [
    check(
      "doctor_text",
      sql`char_length(btrim(${t.name})) between 1 and 100 and char_length(${t.role}) <= 100 and char_length(${t.bio}) <= 1000`,
    ),
    index("doctors_public_order").on(t.published, t.sort_order, t.id),
  ],
);
export const galleryItems = pgTable(
  "gallery_items",
  {
    ...contentFields(),
    title: text().notNull().default(""),
    category: text().notNull().default("محیط مجموعه"),
    media_type: text({ enum: ["image", "video", "before_after"] })
      .notNull()
      .default("image"),
    media_url: text().notNull(),
    thumbnail_url: text(),
    before_url: text(),
    after_url: text(),
    alt: text().notNull().default(""),
  },
  (t) => [
    check("gallery_type", sql`${t.media_type} in ('image','video','before_after')`),
    check(
      "gallery_text",
      sql`char_length(${t.title}) <= 150 and char_length(btrim(${t.category})) between 1 and 60 and char_length(${t.alt}) <= 200`,
    ),
    check(
      "gallery_published_media",
      sql`not ${t.published} or (char_length(btrim(${t.media_url})) > 0 and (${t.media_type} <> 'before_after' or (coalesce(char_length(btrim(${t.before_url})),0) > 0 and coalesce(char_length(btrim(${t.after_url})),0) > 0)))`,
    ),
    index("gallery_public_order").on(t.published, t.sort_order, t.id),
  ],
);
export const blogPosts = pgTable(
  "blog_posts",
  {
    ...contentFields(),
    slug: text().notNull().unique(),
    title: text().notNull(),
    excerpt: text().notNull().default(""),
    content: text().notNull().default(""),
    cover_url: text(),
    seo_title: text(),
    seo_description: text(),
    published_at: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    check(
      "post_slug",
      sql`char_length(${t.slug}) between 1 and 80 and ${t.slug} !~ '[[:space:]/?#]'`,
    ),
    check(
      "post_text",
      sql`char_length(btrim(${t.title})) between 1 and 150 and char_length(${t.excerpt}) <= 400`,
    ),
    check(
      "post_seo",
      sql`char_length(${t.seo_title}) <= 70 and char_length(${t.seo_description}) <= 170`,
    ),
    index("posts_public_date").on(t.published, t.published_at, t.id),
  ],
);
export const products = pgTable(
  "products",
  {
    ...contentFields(),
    name: text().notNull(),
    description: text().notNull().default(""),
    image_url: text(),
    price_text: text(),
  },
  (t) => [
    check(
      "product_text",
      sql`char_length(btrim(${t.name})) between 1 and 150 and char_length(${t.description}) <= 1000 and char_length(${t.price_text}) <= 80`,
    ),
    index("products_public_order").on(t.published, t.sort_order, t.id),
  ],
);
export const appointmentRequests = pgTable(
  "appointment_requests",
  {
    id: uuid().primaryKey().defaultRandom(),
    full_name: text().notNull(),
    mobile: text().notNull(),
    service_id: uuid().references(() => services.id, { onDelete: "set null" }),
    department: text(),
    notes: text(),
    status: text({ enum: ["new", "called", "booked", "cancelled"] })
      .notNull()
      .default("new"),
    admin_note: text(),
    ...timestamps(),
  },
  (t) => [
    check("appointment_name", sql`char_length(btrim(${t.full_name})) between 2 and 100`),
    check("appointment_mobile", sql`${t.mobile} ~ '^09[0-9]{9}$'`),
    check("appointment_department", sql`${t.department} in ('پوست','لیزر')`),
    check(
      "appointment_notes",
      sql`char_length(${t.notes}) <= 1000 and char_length(${t.admin_note}) <= 2000`,
    ),
    check("appointment_status", sql`${t.status} in ('new','called','booked','cancelled')`),
    index("appointments_status_date").on(t.status, t.created_at),
    index("appointments_mobile_date").on(t.mobile, t.created_at),
    index("appointments_service").on(t.service_id),
  ],
);
// Application-owned administration metadata ONLY. No auth credentials/sessions.
// Add an FK to the actual Better Auth user table in the auth integration PR.
export const adminMemberships = pgTable(
  "admin_memberships",
  {
    user_id: text().primaryKey(),
    created_at: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [check("admin_user_id", sql`char_length(btrim(${t.user_id})) > 0`)],
);
export const administrationState = pgTable(
  "administration_state",
  {
    singleton: boolean().primaryKey().default(true),
    bootstrap_completed_at: timestamp({ withTimezone: true }),
  },
  (t) => [check("administration_singleton", sql`${t.singleton} = true`)],
);
export const auditEvents = pgTable(
  "audit_events",
  {
    id: uuid().primaryKey().defaultRandom(),
    actor_user_id: text(),
    action: text().notNull(),
    resource_type: text().notNull(),
    resource_id: text(),
    metadata: jsonb().$type<Record<string, unknown>>().notNull().default({}),
    created_at: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("audit_date").on(t.created_at)],
);
