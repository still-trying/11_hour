-- Calculate urgency score function
CREATE OR REPLACE FUNCTION calculate_urgency_score(
  p_deadline TIMESTAMPTZ,
  p_importance INTEGER,
  p_estimated_minutes INTEGER,
  p_times_snoozed INTEGER DEFAULT 0,
  p_status TEXT DEFAULT 'pending'
)
RETURNS NUMERIC AS $$
DECLARE
  v_hours_remaining NUMERIC;
  v_deadline_factor NUMERIC;
  v_importance_factor NUMERIC;
  v_effort_factor NUMERIC;
  v_snooze_penalty NUMERIC;
  v_score NUMERIC;
BEGIN
  IF p_status IN ('completed', 'cancelled') THEN RETURN 0; END IF;
  IF p_deadline IS NULL THEN RETURN 30; END IF;
  
  v_hours_remaining := EXTRACT(EPOCH FROM (p_deadline - NOW())) / 3600;
  IF v_hours_remaining <= 0 THEN RETURN 100; END IF;
  
  v_deadline_factor := CASE
    WHEN v_hours_remaining <= 1 THEN 1.0
    WHEN v_hours_remaining <= 3 THEN 0.92
    WHEN v_hours_remaining <= 6 THEN 0.82
    WHEN v_hours_remaining <= 12 THEN 0.70
    WHEN v_hours_remaining <= 24 THEN 0.55
    WHEN v_hours_remaining <= 48 THEN 0.40
    WHEN v_hours_remaining <= 72 THEN 0.28
    WHEN v_hours_remaining <= 168 THEN 0.18
    ELSE 0.08
  END;
  
  v_importance_factor := COALESCE(p_importance, 3)::NUMERIC / 5.0;
  v_effort_factor := LEAST(COALESCE(p_estimated_minutes, 30)::NUMERIC / 480.0, 1.0);
  v_snooze_penalty := LEAST(COALESCE(p_times_snoozed, 0) * 0.05, 0.2);
  
  v_score := (v_deadline_factor * 0.60 + v_importance_factor * 0.30 + v_effort_factor * 0.05 + v_snooze_penalty) * 100;
  RETURN ROUND(LEAST(v_score, 100)::NUMERIC, 2);
END;
$$ LANGUAGE plpgsql;

-- Refresh all urgency scores
CREATE OR REPLACE FUNCTION refresh_all_urgency_scores()
RETURNS void AS $$
BEGIN
  UPDATE public.tasks
  SET urgency_score = calculate_urgency_score(deadline, importance, estimated_minutes, times_snoozed, status)
  WHERE status NOT IN ('completed', 'cancelled');
  
  UPDATE public.tasks
  SET status = 'overdue'
  WHERE deadline < NOW() AND status = 'pending' AND deadline IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
