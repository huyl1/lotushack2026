import { Panel } from "@/components/ui/panel";
import type { StudentState } from "@/lib/supabase/types";

interface ProfilePanelProps {
  state: StudentState | null;
}

function ProfileItem({ label, value }: { label: string; value: string | null | undefined }) {
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
      <span className="text-mono-lg" style={{ color: value ? "var(--color-text-primary)" : "var(--color-text-muted)" }}>
        {value || "—"}
      </span>
    </div>
  );
}

export function ProfilePanel({ state }: ProfilePanelProps) {
  if (!state) {
    return (
      <Panel title="Profile" dotColor="var(--color-accent)">
        <div className="flex items-center justify-center py-6">
          <span className="text-body-sm" style={{ color: "var(--color-text-muted)" }}>
            No profile data yet. Add scores to get started.
          </span>
        </div>
      </Panel>
    );
  }

  return (
    <Panel title="Profile" dotColor="var(--color-accent)">
      <div className="grid grid-cols-2" style={{ gap: "var(--space-sm)" }}>
        <ProfileItem label="Target Majors" value={state.target_majors?.join(", ")} />
        <ProfileItem label="Application Round" value={state.application_round} />
        <ProfileItem label="Preferred Countries" value={state.preferred_countries?.join(", ")} />
        <ProfileItem
          label="Budget"
          value={state.budget_usd ? `$${Math.round(state.budget_usd / 1000)}k/year` : null}
        />
        <ProfileItem label="Campus Setting" value={state.preferred_setting} />
        <ProfileItem label="Financial Aid" value={state.needs_financial_aid ? "Needed" : state.needs_financial_aid === false ? "Not needed" : null} />
        <ProfileItem label="Campus Size" value={state.preferred_size} />
        <ProfileItem
          label="Min Acceptance Rate"
          value={state.target_acceptance_rate_min ? `${state.target_acceptance_rate_min}%+` : null}
        />
      </div>
    </Panel>
  );
}
