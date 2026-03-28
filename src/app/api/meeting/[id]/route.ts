import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: meetingId } = await params;

  const userClient = await createClient();
  const {
    data: { user },
  } = await userClient.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();

    const [meetingResult, utterancesResult, sentimentsResult] = await Promise.all([
      supabase.from("meetings").select("*").eq("id", meetingId).maybeSingle(),
      supabase.from("meeting_utterances").select("*").eq("meeting_id", meetingId).order("created_at", { ascending: true }),
      supabase.from("meeting_sentiments").select("*").eq("meeting_id", meetingId).order("created_at", { ascending: true }),
    ]);

    if (meetingResult.error || !meetingResult.data) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    return NextResponse.json({
      meeting: meetingResult.data,
      utterances: utterancesResult.data ?? [],
      sentiments: sentimentsResult.data ?? [],
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch meeting";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
