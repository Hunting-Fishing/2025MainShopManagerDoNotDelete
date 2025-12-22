-- RFQ response history events
CREATE TABLE IF NOT EXISTS public.rfq_response_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  response_id UUID NOT NULL REFERENCES public.rfq_responses(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('note', 'status_change', 'follow_up')),
  notes TEXT NOT NULL,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.rfq_response_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view rfq response events"
  ON public.rfq_response_events FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM public.rfq_responses rr
      JOIN public.rfqs r ON r.id = rr.rfq_id
      WHERE rr.id = rfq_response_events.response_id
      AND r.shop_id = public.get_current_user_shop_id()
    )
  );

CREATE POLICY "Users can manage rfq response events"
  ON public.rfq_response_events FOR ALL USING (
    EXISTS (
      SELECT 1
      FROM public.rfq_responses rr
      JOIN public.rfqs r ON r.id = rr.rfq_id
      WHERE rr.id = rfq_response_events.response_id
      AND r.shop_id = public.get_current_user_shop_id()
    )
  );

CREATE INDEX IF NOT EXISTS idx_rfq_response_events_response
  ON public.rfq_response_events(response_id);
