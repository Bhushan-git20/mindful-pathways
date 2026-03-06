
CREATE OR REPLACE FUNCTION public.admin_delete_user_data(_target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Verify caller is admin
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'unauthorized: admin role required';
  END IF;

  -- Prevent self-deletion
  IF auth.uid() = _target_user_id THEN
    RAISE EXCEPTION 'cannot delete your own account from admin panel';
  END IF;

  -- Delete user-owned data
  DELETE FROM public.notifications    WHERE user_id = _target_user_id OR related_user_id = _target_user_id;
  DELETE FROM public.chat_messages    WHERE user_id = _target_user_id;
  DELETE FROM public.assessments      WHERE user_id = _target_user_id;
  DELETE FROM public.journal_entries  WHERE user_id = _target_user_id;
  DELETE FROM public.risk_scores      WHERE user_id = _target_user_id;
  DELETE FROM public.user_roles       WHERE user_id = _target_user_id;
  DELETE FROM public.profiles         WHERE user_id = _target_user_id;
END;
$function$;
