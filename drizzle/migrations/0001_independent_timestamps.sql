-- Database-side timestamps also cover raw SQL and future administrative jobs.
CREATE FUNCTION public.touch_record() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  IF TG_ARGV[0] = 'revision' THEN NEW.revision = OLD.revision + 1; END IF;
  RETURN NEW;
END;
$$;
--> statement-breakpoint
CREATE TRIGGER site_settings_touch BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.touch_record('revision');
--> statement-breakpoint
CREATE TRIGGER services_touch BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.touch_record('revision');
--> statement-breakpoint
CREATE TRIGGER doctors_touch BEFORE UPDATE ON public.doctors FOR EACH ROW EXECUTE FUNCTION public.touch_record('revision');
--> statement-breakpoint
CREATE TRIGGER gallery_items_touch BEFORE UPDATE ON public.gallery_items FOR EACH ROW EXECUTE FUNCTION public.touch_record('revision');
--> statement-breakpoint
CREATE TRIGGER blog_posts_touch BEFORE UPDATE ON public.blog_posts FOR EACH ROW EXECUTE FUNCTION public.touch_record('revision');
--> statement-breakpoint
CREATE TRIGGER products_touch BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.touch_record('revision');
--> statement-breakpoint
CREATE TRIGGER appointment_requests_touch BEFORE UPDATE ON public.appointment_requests FOR EACH ROW EXECUTE FUNCTION public.touch_record();
