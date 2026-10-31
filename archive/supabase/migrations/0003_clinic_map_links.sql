ALTER TABLE public.site_settings ADD CONSTRAINT clinic_map_links_https CHECK (
  key <> 'clinic' OR (
    (NOT (value ? 'neshan_url') OR value->'neshan_url' = 'null'::jsonb OR (jsonb_typeof(value->'neshan_url') = 'string' AND (value->>'neshan_url' = '' OR value->>'neshan_url' ~ '^https://[^[:space:]]+$')))
    AND (NOT (value ? 'balad_url') OR value->'balad_url' = 'null'::jsonb OR (jsonb_typeof(value->'balad_url') = 'string' AND (value->>'balad_url' = '' OR value->>'balad_url' ~ '^https://[^[:space:]]+$')))
  )
) NOT VALID;
UPDATE public.site_settings SET value = value || '{"neshan_url":"https://nshn.ir/1e_bfkb85FLL5V","balad_url":"https://balad.ir/p/3NKc52a0uVUstC"}'::jsonb WHERE key = 'clinic';
ALTER TABLE public.site_settings VALIDATE CONSTRAINT clinic_map_links_https;