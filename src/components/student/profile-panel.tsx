"use client";

import { useState, useMemo } from "react";
import { Panel } from "@/components/ui/panel";
import { EmptyState } from "@/components/ui/empty-state";
import { relativeTime } from "@/lib/utils/time";
import type { StudentState, Tag } from "@/lib/supabase/types";
import { ScoreItem, InfoRow, Chip, PreferenceRow, SectionLabel } from "./profile-panel-parts";

interface ProfilePanelProps {
  state: StudentState | null;
  tags: Tag[];
  grade?: string | null;
  dob?: string | null;
}

export function ProfilePanel({ state, tags, grade, dob }: ProfilePanelProps) {
  const [tab, setTab] = useState<"scores" | "preferences" | "tags">("scores");

  const groupedTags = useMemo(() => {
    const groups = new Map<string, Tag[]>();
    for (const tag of tags) {
      const cat = tag.category ?? "Other";
      const arr = groups.get(cat) ?? [];
      arr.push(tag);
      groups.set(cat, arr);
    }
    return groups;
  }, [tags]);

  if (!state) {
    return (
      <Panel title="Student Profile" dotColor="var(--color-accent)">
        <EmptyState
          title="No profile data yet"
          description="Add scores and preferences to get started."
        />
      </Panel>
    );
  }

  return (
    <Panel
      title="Student Profile"
      dotColor="var(--color-accent)"
      tabs={["Scores", "Preferences"]}
      activeTab={tab === "scores" ? "Scores" : "Preferences"}
      onTabChange={(t) => setTab(t === "Scores" ? "scores" : "preferences")}
      footer={
        <span style={{ fontSize: 15, fontFamily: "var(--font-sans)", color: "var(--color-text-muted)" }}>
          Latest snapshot: {new Date(state.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" })} ({relativeTime(state.created_at)})
        </span>
      }
    >
      {tab === "scores" ? (
        <div className="flex flex-col" style={{ gap: "var(--space-md)" }}>
          {/* Test Scores */}
          <div>
            <SectionLabel>Test Scores</SectionLabel>
            <div className="grid mt-2" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "var(--space-sm)" }}>
              <ScoreItem label="SAT" value={state.sat_score} />
              <ScoreItem label="ACT" value={state.act_score} />
              <ScoreItem label="GPA" value={state.gpa != null ? Number(state.gpa).toFixed(2) : null} />
              <ScoreItem label="IELTS" value={state.ielts_score != null ? Number(state.ielts_score).toFixed(1) : null} />
            </div>
          </div>

          {/* Application Details */}
          <div className="flex flex-col">
            <SectionLabel>Application</SectionLabel>
            <div className="grid mt-2" style={{ gridTemplateColumns: "1fr 1fr", gap: "0 var(--space-md)" }}>
              <InfoRow label="Grade" value={grade ?? "—"} />
              <InfoRow label="Date of Birth" value={dob ? new Date(dob).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"} />
              <InfoRow label="Round" value={state.application_round ?? "—"} />
              <InfoRow label="Budget" value={state.budget_usd != null ? `$${Math.round(Number(state.budget_usd) / 1000)}k/year` : "—"} />
              <InfoRow label="Financial Aid" value={state.needs_financial_aid ? "Yes" : state.needs_financial_aid === false ? "No" : "—"} />
              <InfoRow label="Min Acceptance" value={state.target_acceptance_rate_min != null ? `${state.target_acceptance_rate_min}%+` : "—"} />
            </div>
          </div>
        </div>
      ) : tab === "preferences" ? (
        <div className="flex flex-col" style={{ gap: "var(--space-md)" }}>
          {/* Target Majors */}
          {state.target_majors?.length ? (
            <div>
              <SectionLabel>Target Majors</SectionLabel>
              <div className="flex flex-wrap mt-1.5" style={{ gap: 6 }}>
                {state.target_majors.map((m) => <Chip key={m}>{m}</Chip>)}
              </div>
            </div>
          ) : null}

          {/* Countries */}
          {state.preferred_countries?.length ? (
            <div>
              <SectionLabel>Preferred Countries</SectionLabel>
              <div className="flex flex-wrap mt-1.5" style={{ gap: 6 }}>
                {state.preferred_countries.map((c) => <Chip key={c}>{c}</Chip>)}
              </div>
            </div>
          ) : null}

          {/* Campus Preferences */}
          <div>
            <SectionLabel>Campus</SectionLabel>
            <div style={{ marginTop: 4 }}>
              <PreferenceRow icon="🏙" label="Setting" value={state.preferred_setting ?? "—"} />
              <PreferenceRow icon="🏫" label="Size" value={state.preferred_size ?? "—"} />
            </div>
          </div>
        </div>
      ) : (
        tags.length === 0 ? (
          <EmptyState title="No tags assigned" description="Assign tags to improve preference matching." />
        ) : (
          <div className="flex flex-col" style={{ gap: "var(--space-md)" }}>
            {Array.from(groupedTags.entries()).map(([category, catTags]) => (
              <div key={category}>
                <SectionLabel>{category}</SectionLabel>
                <div className="flex flex-wrap mt-1.5" style={{ gap: 6 }}>
                  {catTags.map((tag) => (
                    <Chip key={tag.id}>
                      {tag.emoji ? `${tag.emoji} ` : ""}{tag.name}
                    </Chip>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </Panel>
  );
}
