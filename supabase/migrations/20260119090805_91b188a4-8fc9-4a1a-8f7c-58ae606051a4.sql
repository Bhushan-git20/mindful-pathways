-- Create a secure, self-service data purge function for users
-- This allows account data deletion without granting broad DELETE policies on sensitive tables.

CREATE OR REPLACE FUNCTION public.delete_my_account_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  -- Delete user-owned data (order avoids foreign key issues if any exist)
  DELETE FROM public.chat_messages   WHERE user_id = v_user_id;
  DELETE FROM public.assessments     WHERE user_id = v_user_id;
  DELETE FROM public.journal_entries WHERE user_id = v_user_id;
  DELETE FROM public.risk_scores     WHERE user_id = v_user_id;
  DELETE FROM public.user_roles      WHERE user_id = v_user_id;
  DELETE FROM public.profiles        WHERE user_id = v_user_id;
END;
$$;

-- Lock down execution to authenticated users only
REVOKE ALL ON FUNCTION public.delete_my_account_data() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_my_account_data() TO authenticated;