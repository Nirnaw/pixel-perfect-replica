ALTER TABLE public.appointment_requests ADD COLUMN admin_note text CHECK (admin_note IS NULL OR char_length(admin_note) <= 2000);
ALTER TABLE public.appointment_requests ADD CONSTRAINT appointment_status_values CHECK (status IN ('new','called','booked','cancelled'));

CREATE OR REPLACE FUNCTION public.appointment_guard()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF (SELECT count(*) FROM public.appointment_requests
      WHERE mobile = NEW.mobile AND created_at > now() - interval '1 hour') >= 3 THEN
    RAISE EXCEPTION 'RATE_LIMIT' USING ERRCODE = 'P0001';
  END IF;
  IF EXISTS (SELECT 1 FROM public.appointment_requests
      WHERE mobile = NEW.mobile AND full_name = NEW.full_name
        AND service_id IS NOT DISTINCT FROM NEW.service_id
        AND department IS NOT DISTINCT FROM NEW.department
        AND notes IS NOT DISTINCT FROM NEW.notes
        AND created_at > now() - interval '10 minutes') THEN
    RAISE EXCEPTION 'DUPLICATE' USING ERRCODE = 'P0001';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER appointment_guard BEFORE INSERT ON public.appointment_requests
FOR EACH ROW EXECUTE FUNCTION public.appointment_guard();

ALTER TABLE public.gallery_items ADD COLUMN before_url text CHECK (before_url IS NULL OR char_length(before_url) <= 2000);
ALTER TABLE public.gallery_items ADD COLUMN after_url text CHECK (after_url IS NULL OR char_length(after_url) <= 2000);
ALTER TABLE public.gallery_items DROP CONSTRAINT IF EXISTS gallery_items_media_type_check;
ALTER TABLE public.gallery_items ADD CONSTRAINT gallery_items_media_type_check CHECK (media_type IN ('image','video','before_after'));
ALTER TABLE public.gallery_items ADD CONSTRAINT gallery_category_len CHECK (char_length(category) BETWEEN 1 AND 60);

GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO anon, authenticated;