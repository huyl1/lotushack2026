import Link from "next/link";
import { StageBadge } from "@/components/ui/badges";
import { PageBanner } from "@/components/ui/page-banner";
import type { StudentDetail } from "@/lib/supabase/types";

interface StudentHeaderProps {
  student: StudentDetail;
}

export function StudentBanner({ student }: StudentHeaderProps) {
  const createdDate = new Date(student.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const subtitle = [
    student.grade ? `Grade ${student.grade}` : null,
    student.dob
      ? `DOB ${new Date(student.dob).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
      : null,
    `Created ${createdDate}`,
  ]
    .filter(Boolean)
    .join("  ·  ");

  return (
    <PageBanner
      title={student.name}
      subtitle={subtitle}
      primaryMeta={
        <div className="flex items-center pointer-events-auto" style={{ gap: "var(--space-sm)" }}>
          <Link
            href={`/students/${student.id}/match`}
            className="inline-flex items-center gap-2 px-4 h-9 transition-colors"
            style={{
              background: "rgba(255,255,255,0.15)",
              backdropFilter: "blur(8px)",
              color: "#ffffff",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "var(--radius-xs)",
              fontFamily: "var(--font-sans)",
              fontSize: 13,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="5" cy="5" r="3.5" />
              <path d="M11 11l-3-3" />
            </svg>
            Run Matching
          </Link>
        </div>
      }
      secondaryMeta={<StageBadge stage={student.stage} />}
    />
  );
}
