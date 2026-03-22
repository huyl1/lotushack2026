-- Meeting platform: host creates session, guest joins via link.
-- Transcripts stored per utterance; sentiments computed server-side (Valsea).

CREATE TABLE public.meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.students(id) ON DELETE SET NULL,
  title TEXT NOT NULL DEFAULT 'Untitled meeting',
  language TEXT NOT NULL DEFAULT 'english',
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'ended')),
  host_name TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.meeting_utterances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('host', 'guest')),
  speaker TEXT,
  text TEXT NOT NULL,
  raw_text TEXT,
  timestamp_ms INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.meeting_sentiments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
  target_role TEXT NOT NULL DEFAULT 'guest' CHECK (target_role IN ('guest', 'host')),
  sentiment TEXT NOT NULL CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  confidence REAL NOT NULL,
  emotions JSONB,
  reasoning TEXT,
  window_start_ms INTEGER,
  window_end_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX meeting_utterances_meeting_idx ON public.meeting_utterances(meeting_id, created_at);
CREATE INDEX meeting_sentiments_meeting_idx ON public.meeting_sentiments(meeting_id, created_at);
CREATE INDEX meetings_created_by_idx ON public.meetings(created_by);

ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_utterances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_sentiments ENABLE ROW LEVEL SECURITY;

-- Hosts manage their meetings
CREATE POLICY "meetings_insert_own"
  ON public.meetings FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "meetings_select_own"
  ON public.meetings FOR SELECT TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "meetings_update_own"
  ON public.meetings FOR UPDATE TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- Guests need to read one meeting row for the join page (Realtime + client fetch).
-- Scoped to non-ended rows so ended sessions are not enumerable as easily.
CREATE POLICY "meetings_select_active_anon"
  ON public.meetings FOR SELECT TO anon
  USING (status IN ('waiting', 'active'));

-- Utterances: host inserts own; guest writes via API (service role). Everyone subscribed needs SELECT.
CREATE POLICY "utterances_insert_host"
  ON public.meeting_utterances FOR INSERT TO authenticated
  WITH CHECK (
    role = 'host'
    AND EXISTS (
      SELECT 1 FROM public.meetings m
      WHERE m.id = meeting_utterances.meeting_id AND m.created_by = auth.uid()
    )
  );

CREATE POLICY "utterances_select"
  ON public.meeting_utterances FOR SELECT TO authenticated, anon
  USING (true);

-- Sentiments: server-only inserts (service role). Host reads own meeting's rows.
CREATE POLICY "sentiments_select_own_meeting"
  ON public.meeting_sentiments FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.meetings m
      WHERE m.id = meeting_sentiments.meeting_id AND m.created_by = auth.uid()
    )
  );

ALTER PUBLICATION supabase_realtime ADD TABLE public.meetings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.meeting_utterances;
ALTER PUBLICATION supabase_realtime ADD TABLE public.meeting_sentiments;
