import { Panel } from "@/components/ui/panel";
import type { StudentDetail, StudentState } from "@/lib/supabase/types";

interface ActivityTimelineProps {
  student: StudentDetail;
}

interface ActivityEntry {
  date: string;
  description: string;
  type: "created" | "scores" | "matched";
}

function buildTimeline(student: StudentDetail): ActivityEntry[] {
  const entries: ActivityEntry[] = [];

  // Student creation
  entries.push({
    date: student.created_at,
    description: "Student profile created",
    type: "created",
  });

  // Score snapshots
  student.states.forEach((state, i) => {
    const parts: string[] = [];
    if (state.sat_score) parts.push(`SAT ${state.sat_score}`);
    if (state.act_score) parts.push(`ACT ${state.act_score}`);
    if (state.gpa) parts.push(`GPA ${state.gpa}`);
    if (state.ielts_score) parts.push(`IELTS ${state.ielts_score}`);

    if (parts.length > 0) {
      entries.push({
        date: state.created_at,
        description: i === 0 ? `Initial scores: ${parts.join(", ")}` : `Scores updated: ${parts.join(", ")}`,
        type: "scores",
      });
    }
  });

  // Recommendations
  if (student.recommendations.length > 0) {
    const recDate = student.recommendations[0].created_at;
    entries.push({
      date: recDate,
      description: `AI matching completed (${student.recommendations.length} universities)`,
      type: "matched",
    });
  }

  // Sort newest first
  entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return entries;
}

const DOT_COLORS: Record<ActivityEntry["type"], string> = {
  created: "var(--color-text-muted)",
  scores: "var(--color-stage-new)",
  matched: "var(--color-stage-matched)",
};

export function ActivityTimeline({ student }: ActivityTimelineProps) {
  const entries = buildTimeline(student);

  return (
    <Panel
      title="Activity"
      dotColor="var(--color-text-muted)"
      footer={
        <span style={{ fontSize: 12, fontFamily: "var(--font-sans)", fontWeight: 500, color: "var(--color-text-muted)" }}>
          {entries.length} {entries.length === 1 ? "event" : "events"}
        </span>
      }
    >
      <div className="flex flex-col" style={{ gap: 0 }}>
        {entries.map((entry, i) => (
          <div
            key={i}
            className="flex items-start"
            style={{
              gap: "var(--space-sm)",
              padding: "var(--space-sm) 0",
              borderBottom: i < entries.length - 1 ? "1px solid var(--color-border-subtle)" : "none",
            }}
          >
            {/* Timeline dot */}
            <div className="flex flex-col items-center shrink-0" style={{ paddingTop: 4 }}>
              <span
                className="rounded-full"
                style={{
                  width: 6,
                  height: 6,
                  background: DOT_COLORS[entry.type],
                }}
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <span className="text-body-sm" style={{ color: "var(--color-text-primary)" }}>
                {entry.description}
              </span>
            </div>

            {/* Date */}
            <span className="text-mono shrink-0" style={{ color: "var(--color-text-muted)" }}>
              {new Date(entry.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          </div>
        ))}
      </div>
    </Panel>
  );
}
