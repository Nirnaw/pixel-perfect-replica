CREATE OR REPLACE FUNCTION public.guard_admin_removal()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF OLD.role = 'admin' THEN
    PERFORM pg_advisory_xact_lock(726410);
    IF OLD.user_id = auth.uid() THEN RAISE EXCEPTION 'SELF_ADMIN'; END IF;
    IF (SELECT count(*) FROM public.user_roles WHERE role = 'admin') <= 1 THEN RAISE EXCEPTION 'LAST_ADMIN'; END IF;
  END IF;
  RETURN OLD;
END $$;
CREATE TRIGGER guard_admin_removal BEFORE DELETE ON public.user_roles FOR EACH ROW EXECUTE FUNCTION public.guard_admin_removal();
CREATE OR REPLACE FUNCTION public.remove_admin_access(target_user_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'FORBIDDEN'; END IF;
  LOCK TABLE public.user_roles IN SHARE ROW EXCLUSIVE MODE;
  IF target_user_id = auth.uid() THEN RAISE EXCEPTION 'SELF_ADMIN'; END IF;
  IF (SELECT count(*) FROM public.user_roles WHERE role = 'admin') <= 1 THEN RAISE EXCEPTION 'LAST_ADMIN'; END IF;
  DELETE FROM public.user_roles WHERE user_id = target_user_id AND role = 'admin';
END $$;
REVOKE ALL ON FUNCTION public.remove_admin_access(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.remove_admin_access(uuid) TO authenticated;
REVOKE ALL ON FUNCTION public.guard_admin_removal() FROM PUBLIC, anon, authenticated;