import type { SupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import {
  extractStudentPayloadWithOpenAI,
  formatUtterancesForLlm,
  toCreateStudentInput,
} from "@/lib/meeting/transcript-student-extraction";

type RouteContext = { params: Promise<{ id: string }> };

/** Local testing only: skip cookie auth; uses service role (ended meetings are not visible to anon RLS). */
function isDevNoAuthExtract(): boolean {
  return (
    process.env.NODE_ENV !== "production" &&
    process.env.TRANSCRIPT_EXTRACT_DEV_NO_AUTH === "1"
  );
}

async function runExtraction(
  meetingId: string,
  supabase: SupabaseClient,
) {
  const { data: meeting, error: meetingError } = await supabase
    .from("meetings")
    .select("id, title, status, created_by")
    .eq("id", meetingId)
    .maybeSingle();

  if (meetingError || !meeting) {
    return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
  }
  if (meeting.status !== "ended") {
    return NextResponse.json(
      { error: "Meeting must be ended before extraction" },
      { status: 400 },
    );
  }

  const { data: utterances, error: uErr } = await supabase
    .from("meeting_utterances")
    .select("*")
    .eq("meeting_id", meetingId)
    .order("created_at", { ascending: true });

  if (uErr) {
    return NextResponse.json({ error: uErr.message }, { status: 500 });
  }
  if (!utterances?.length) {
    return NextResponse.json(
      { error: "No transcript lines to analyze" },
      { status: 400 },
    );
  }

  try {
    const text = formatUtterancesForLlm(utterances, meeting.title);
    const payload = await extractStudentPayloadWithOpenAI(text);
    const student = toCreateStudentInput(payload);
    return NextResponse.json({ student });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Extraction failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(_request: Request, context: RouteContext) {
  const { id: meetingId } = await context.params;

  if (isDevNoAuthExtract()) {
    return runExtraction(meetingId, createAdminClient());
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: meeting, error: meetingError } = await supabase
    .from("meetings")
    .select("id, title, status, created_by")
    .eq("id", meetingId)
    .maybeSingle();

  if (meetingError || !meeting) {
    return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
  }
  if (meeting.created_by !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return runExtraction(meetingId, supabase);
}
