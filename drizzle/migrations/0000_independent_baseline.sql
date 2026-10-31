CREATE TABLE "admin_memberships" (
	"user_id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "admin_user_id" CHECK (char_length(btrim("admin_memberships"."user_id")) > 0)
);
--> statement-breakpoint
CREATE TABLE "administration_state" (
	"singleton" boolean PRIMARY KEY DEFAULT true NOT NULL,
	"bootstrap_completed_at" timestamp with time zone,
	CONSTRAINT "administration_singleton" CHECK ("administration_state"."singleton" = true)
);
--> statement-breakpoint
CREATE TABLE "appointment_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" text NOT NULL,
	"mobile" text NOT NULL,
	"service_id" uuid,
	"department" text,
	"notes" text,
	"status" text DEFAULT 'new' NOT NULL,
	"admin_note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "appointment_name" CHECK (char_length(btrim("appointment_requests"."full_name")) between 2 and 100),
	CONSTRAINT "appointment_mobile" CHECK ("appointment_requests"."mobile" ~ '^09[0-9]{9}$'),
	CONSTRAINT "appointment_department" CHECK ("appointment_requests"."department" in ('پوست','لیزر')),
	CONSTRAINT "appointment_notes" CHECK (char_length("appointment_requests"."notes") <= 1000 and char_length("appointment_requests"."admin_note") <= 2000),
	CONSTRAINT "appointment_status" CHECK ("appointment_requests"."status" in ('new','called','booked','cancelled'))
);
--> statement-breakpoint
CREATE TABLE "audit_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_user_id" text,
	"action" text NOT NULL,
	"resource_type" text NOT NULL,
	"resource_id" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "blog_posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"published" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"revision" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"excerpt" text DEFAULT '' NOT NULL,
	"content" text DEFAULT '' NOT NULL,
	"cover_url" text,
	"seo_title" text,
	"seo_description" text,
	"published_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "blog_posts_slug_unique" UNIQUE("slug"),
	CONSTRAINT "post_slug" CHECK (char_length("blog_posts"."slug") between 1 and 80 and "blog_posts"."slug" !~ '[[:space:]/?#]'),
	CONSTRAINT "post_text" CHECK (char_length(btrim("blog_posts"."title")) between 1 and 150 and char_length("blog_posts"."excerpt") <= 400),
	CONSTRAINT "post_seo" CHECK (char_length("blog_posts"."seo_title") <= 70 and char_length("blog_posts"."seo_description") <= 170)
);
--> statement-breakpoint
CREATE TABLE "doctors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"published" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"revision" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"name" text NOT NULL,
	"role" text DEFAULT '' NOT NULL,
	"bio" text DEFAULT '' NOT NULL,
	"image_url" text,
	CONSTRAINT "doctor_text" CHECK (char_length(btrim("doctors"."name")) between 1 and 100 and char_length("doctors"."role") <= 100 and char_length("doctors"."bio") <= 1000)
);
--> statement-breakpoint
CREATE TABLE "gallery_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"published" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"revision" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"title" text DEFAULT '' NOT NULL,
	"category" text DEFAULT 'محیط مجموعه' NOT NULL,
	"media_type" text DEFAULT 'image' NOT NULL,
	"media_url" text NOT NULL,
	"thumbnail_url" text,
	"before_url" text,
	"after_url" text,
	"alt" text DEFAULT '' NOT NULL,
	CONSTRAINT "gallery_type" CHECK ("gallery_items"."media_type" in ('image','video','before_after')),
	CONSTRAINT "gallery_text" CHECK (char_length("gallery_items"."title") <= 150 and char_length(btrim("gallery_items"."category")) between 1 and 60 and char_length("gallery_items"."alt") <= 200),
	CONSTRAINT "gallery_published_media" CHECK (not "gallery_items"."published" or (char_length(btrim("gallery_items"."media_url")) > 0 and ("gallery_items"."media_type" <> 'before_after' or (coalesce(char_length(btrim("gallery_items"."before_url")),0) > 0 and coalesce(char_length(btrim("gallery_items"."after_url")),0) > 0))))
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"published" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"revision" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"name" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"image_url" text,
	"price_text" text,
	CONSTRAINT "product_text" CHECK (char_length(btrim("products"."name")) between 1 and 150 and char_length("products"."description") <= 1000 and char_length("products"."price_text") <= 80)
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"published" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"revision" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"short_description" text DEFAULT '' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"image_url" text,
	"department" text,
	"featured" boolean DEFAULT false NOT NULL,
	"seo_title" text,
	"seo_description" text,
	CONSTRAINT "services_slug_unique" UNIQUE("slug"),
	CONSTRAINT "service_title" CHECK (char_length(btrim("services"."title")) between 1 and 150),
	CONSTRAINT "service_slug" CHECK (char_length("services"."slug") between 1 and 80 and "services"."slug" !~ '[[:space:]/?#]'),
	CONSTRAINT "service_text" CHECK (char_length("services"."short_description") <= 400 and char_length("services"."description") <= 5000),
	CONSTRAINT "service_department" CHECK ("services"."department" in ('پوست','لیزر')),
	CONSTRAINT "service_seo" CHECK (char_length("services"."seo_title") <= 70 and char_length("services"."seo_description") <= 170)
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"published" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"revision" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"key" text NOT NULL,
	"value" jsonb NOT NULL,
	CONSTRAINT "site_settings_key_unique" UNIQUE("key"),
	CONSTRAINT "settings_key" CHECK ("site_settings"."key" in ('clinic','hero','about','theme','disclaimer')),
	CONSTRAINT "settings_object" CHECK (jsonb_typeof("site_settings"."value") = 'object'),
	CONSTRAINT "settings_map_urls" CHECK ("site_settings"."key" <> 'clinic' or (
    (not ("site_settings"."value" ? 'neshan_url') or "site_settings"."value"->'neshan_url' = 'null'::jsonb or (jsonb_typeof("site_settings"."value"->'neshan_url') = 'string' and ("site_settings"."value"->>'neshan_url' = '' or "site_settings"."value"->>'neshan_url' ~ '^https://[^[:space:]]+$')))
    and (not ("site_settings"."value" ? 'balad_url') or "site_settings"."value"->'balad_url' = 'null'::jsonb or (jsonb_typeof("site_settings"."value"->'balad_url') = 'string' and ("site_settings"."value"->>'balad_url' = '' or "site_settings"."value"->>'balad_url' ~ '^https://[^[:space:]]+$')))))
);
--> statement-breakpoint
ALTER TABLE "appointment_requests" ADD CONSTRAINT "appointment_requests_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "appointments_status_date" ON "appointment_requests" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "appointments_mobile_date" ON "appointment_requests" USING btree ("mobile","created_at");--> statement-breakpoint
CREATE INDEX "appointments_service" ON "appointment_requests" USING btree ("service_id");--> statement-breakpoint
CREATE INDEX "audit_date" ON "audit_events" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "posts_public_date" ON "blog_posts" USING btree ("published","published_at","id");--> statement-breakpoint
CREATE INDEX "doctors_public_order" ON "doctors" USING btree ("published","sort_order","id");--> statement-breakpoint
CREATE INDEX "gallery_public_order" ON "gallery_items" USING btree ("published","sort_order","id");--> statement-breakpoint
CREATE INDEX "products_public_order" ON "products" USING btree ("published","sort_order","id");--> statement-breakpoint
CREATE INDEX "services_public_order" ON "services" USING btree ("published","sort_order","id");