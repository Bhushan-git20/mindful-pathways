
-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  target_role public.app_role NOT NULL DEFAULT 'admin',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'risk_alert',
  severity TEXT NOT NULL DEFAULT 'info',
  related_user_id UUID,
  related_assessment_id UUID,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Admins and counselors can view all notifications targeted to their role
CREATE POLICY "Admins can view admin notifications"
ON public.notifications
FOR SELECT
TO authenticated
USING (
  (target_role = 'admin' AND public.has_role(auth.uid(), 'admin'))
  OR (target_role = 'counselor' AND (public.has_role(auth.uid(), 'counselor') OR public.has_role(auth.uid(), 'admin')))
  OR (target_role = 'student' AND auth.uid() = user_id)
);

-- Admins can update (mark as read)
CREATE POLICY "Admins can update notifications"
ON public.notifications
FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'counselor')
  OR (target_role = 'student' AND auth.uid() = user_id)
);

-- System/authenticated users can insert notifications
CREATE POLICY "Authenticated users can insert notifications"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Create function to auto-generate risk notifications on assessment insert
CREATE OR REPLACE FUNCTION public.notify_on_elevated_risk()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_student_name TEXT;
  v_notification_title TEXT;
  v_notification_message TEXT;
  v_severity TEXT;
BEGIN
  -- Only trigger for moderate, moderately_severe, or severe
  IF NEW.severity NOT IN ('moderate', 'moderately_severe', 'severe') THEN
    RETURN NEW;
  END IF;

  -- Get student name
  SELECT COALESCE(full_name, email) INTO v_student_name
  FROM public.profiles
  WHERE user_id = NEW.user_id
  LIMIT 1;

  -- Set severity and message based on assessment severity
  IF NEW.severity = 'severe' THEN
    v_severity := 'critical';
    v_notification_title := '🚨 Critical Risk Alert';
    v_notification_message := v_student_name || ' scored ' || NEW.total_score || ' (' || NEW.severity || ') on ' || NEW.assessment_type || '. Immediate attention recommended.';
  ELSIF NEW.severity = 'moderately_severe' THEN
    v_severity := 'high';
    v_notification_title := '⚠️ High Risk Alert';
    v_notification_message := v_student_name || ' scored ' || NEW.total_score || ' (' || NEW.severity || ') on ' || NEW.assessment_type || '. Follow-up recommended.';
  ELSE
    v_severity := 'medium';
    v_notification_title := '📋 Elevated Risk Notice';
    v_notification_message := v_student_name || ' scored ' || NEW.total_score || ' (' || NEW.severity || ') on ' || NEW.assessment_type || '. Monitor recommended.';
  END IF;

  -- Insert notification for admins
  INSERT INTO public.notifications (user_id, target_role, title, message, type, severity, related_user_id, related_assessment_id)
  VALUES (NEW.user_id, 'admin', v_notification_title, v_notification_message, 'risk_alert', v_severity, NEW.user_id, NEW.id);

  -- Insert notification for counselors
  INSERT INTO public.notifications (user_id, target_role, title, message, type, severity, related_user_id, related_assessment_id)
  VALUES (NEW.user_id, 'counselor', v_notification_title, v_notification_message, 'risk_alert', v_severity, NEW.user_id, NEW.id);

  RETURN NEW;
END;
$$;

-- Create trigger on assessments table
CREATE TRIGGER trigger_notify_on_elevated_risk
AFTER INSERT ON public.assessments
FOR EACH ROW
EXECUTE FUNCTION public.notify_on_elevated_risk();
