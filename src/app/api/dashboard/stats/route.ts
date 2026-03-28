import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function GET() {
  const userClient = await createClient();
  const {
    data: { user },
  } = await userClient.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();

    // Fetch all three queries in parallel — no waterfall
    const [{ data: stageCounts }, { data: activeStudents }, { data: allLatestStates }] = await Promise.all([
      supabase
        .from("students")
        .select("stage")
        .neq("stage", "archived"),
      supabase
        .from("students")
        .select("id, stage, created_at")
        .not("stage", "in", '("decided","archived")'),
      supabase
        .from("student_states")
        .select("student_id, created_at")
        .order("created_at", { ascending: false }),
    ]);

    const counts: Record<string, number> = {};
    for (const row of stageCounts ?? []) {
      const stage = String(row.stage);
      counts[stage] = (counts[stage] ?? 0) + 1;
    }

    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    const inProgress = (counts["profile_building"] ?? 0) + (counts["matched"] ?? 0);
    const readyToPresent = counts["matched"] ?? 0;

    let needsAttention = 0;
    if (activeStudents?.length) {
      const activeIds = new Set(activeStudents.map((s) => s.id as string));

      const latestByStudent = new Map<string, string>();
      for (const s of allLatestStates ?? []) {
        const sid = s.student_id as string;
        if (activeIds.has(sid) && !latestByStudent.has(sid)) {
          latestByStudent.set(sid, s.created_at as string);
        }
      }

      const twoWeeksAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
      for (const student of activeStudents) {
        const sid = student.id as string;
        const latestDate = latestByStudent.get(sid) ?? (student.created_at as string);
        if (new Date(latestDate).getTime() < twoWeeksAgo) {
          needsAttention++;
        }
      }
    }

    return NextResponse.json({
      total,
      inProgress,
      needsAttention,
      readyToPresent,
      stageCounts: counts,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch dashboard stats";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
