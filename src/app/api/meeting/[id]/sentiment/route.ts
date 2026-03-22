import { NextResponse } from "next/server";
import { createAdminClient, createClient } from "@/lib/supabase/server";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const { id: meetingId } = await context.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    transcript: string;
    window_start_ms?: number;
    window_end_ms?: number;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.transcript?.trim()) {
    return NextResponse.json({ error: "transcript required" }, { status: 400 });
  }

  const { data: meeting, error: mErr } = await supabase
    .from("meetings")
    .select("id, created_by")
    .eq("id", meetingId)
    .maybeSingle();

  if (mErr || !meeting || meeting.created_by !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const apiKey = process.env.VALSEA_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "VALSEA_API_KEY not configured" },
      { status: 500 },
    );
  }

  const res = await fetch("https://api.valsea.app/v1/sentiment", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "valsea-sentiment",
      transcript: body.transcript.trim(),
      response_format: "verbose_json",
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    return NextResponse.json(
      { error: `Valsea sentiment failed: ${errText}` },
      { status: 502 },
    );
  }

  const raw = (await res.json()) as {
    sentiment: string;
    confidence: number;
    reasoning?: string;
    emotions?: string[];
  };

  const admin = createAdminClient();
  const { data: inserted, error: insErr } = await admin
    .from("meeting_sentiments")
    .insert({
      meeting_id: meetingId,
      target_role: "guest",
      sentiment: raw.sentiment,
      confidence: raw.confidence,
      emotions: raw.emotions ?? null,
      reasoning: raw.reasoning ?? null,
      window_start_ms: body.window_start_ms ?? null,
      window_end_ms: body.window_end_ms ?? null,
    })
    .select("id")
    .single();

  if (insErr) {
    return NextResponse.json({ error: insErr.message }, { status: 500 });
  }

  return NextResponse.json({
    id: inserted.id,
    sentiment: raw.sentiment,
    confidence: raw.confidence,
    emotions: raw.emotions ?? [],
    reasoning: raw.reasoning ?? null,
  });
}
