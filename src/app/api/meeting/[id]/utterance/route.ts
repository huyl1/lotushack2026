import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const { id: meetingId } = await context.params;

  let body: {
    text: string;
    raw_text?: string | null;
    timestamp_ms?: number;
    speaker?: string | null;
    role: "guest";
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.role !== "guest" || !body.text?.trim()) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: meeting, error: mErr } = await admin
    .from("meetings")
    .select("id, status")
    .eq("id", meetingId)
    .maybeSingle();

  if (mErr || !meeting) {
    return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
  }
  if (meeting.status === "ended") {
    return NextResponse.json({ error: "Meeting ended" }, { status: 400 });
  }

  const { error } = await admin.from("meeting_utterances").insert({
    meeting_id: meetingId,
    role: "guest",
    speaker: body.speaker ?? null,
    text: body.text.trim(),
    raw_text: body.raw_text ?? null,
    timestamp_ms: body.timestamp_ms ?? 0,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
