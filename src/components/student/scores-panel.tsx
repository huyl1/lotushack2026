import { Panel } from "@/components/ui/panel";
import type { StudentState } from "@/lib/supabase/types";

interface ScoresPanelProps {
  state: StudentState | null;
}

function ScoreItem({ label, value, unit }: { label: string; value: number | null; unit?: string }) {
  return (
    <div
      className="flex flex-col p-3"
      style={{
        gap: 2,
        background: "var(--color-bg-wash)",
        borderRadius: "var(--radius-xs)",
      }}
    >
      <span className="text-caption" style={{ color: "var(--color-text-muted)" }}>{label}</span>
      <span className="text-mono-lg" style={{ color: value != null ? "var(--color-text-primary)" : "var(--color-text-muted)" }}>
        {value != null ? `${value}${unit || ""}` : "—"}
      </span>
    </div>
  );
}

export function ScoresPanel({ state }: ScoresPanelProps) {
  return (
    <Panel
      title="Current Scores"
      dotColor="var(--color-stage-new)"
      headerRight={
        <button
          className="text-caption cursor-pointer transition-colors"
          style={{ color: "var(--color-text-muted)", background: "none", border: "none" }}
        >
          + Add Scores
        </button>
      }
    >
      {!state ? (
        <div className="flex items-center justify-center py-6">
          <span className="text-body-sm" style={{ color: "var(--color-text-muted)" }}>
            No scores recorded yet.
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-2" style={{ gap: "var(--space-sm)" }}>
          <ScoreItem label="SAT" value={state.sat_score} />
          <ScoreItem label="ACT" value={state.act_score} />
          <ScoreItem label="GPA" value={state.gpa} />
          <ScoreItem label="IELTS" value={state.ielts_score} />
        </div>
      )}
    </Panel>
  );
}
