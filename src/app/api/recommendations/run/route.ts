import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { runGrokRecommendation } from "@/lib/recommendations/grok-recommend";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { studentId?: string; studentName?: string; dryRun?: boolean } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.studentId && !body.studentName) {
    return NextResponse.json(
      { error: "studentId or studentName is required" },
      { status: 400 },
    );
  }

  try {
    const result = await runGrokRecommendation({
      studentId: body.studentId,
      studentName: body.studentName,
      dryRun: body.dryRun ?? false,
    });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Recommendation run failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
