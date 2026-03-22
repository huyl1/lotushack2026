"use client";

import { useState } from "react";
import Link from "next/link";
import { PageBanner } from "@/components/ui/page-banner";
import { AddSnapshotDialog } from "./add-snapshot-dialog";
import type { StudentDetail } from "@/lib/supabase/types";

interface StudentHeaderProps {
  student: StudentDetail;
}

export function StudentBanner({ student }: StudentHeaderProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <div style={{ height: 80 }}>
        <PageBanner
          title={student.name}
          subtitle=""
          primaryMeta={
            <div className="flex items-center pointer-events-auto" style={{ gap: "var(--space-sm)" }}>
              <button
                onClick={() => setDialogOpen(true)}
                className="inline-flex items-center gap-2 px-4 h-9 transition-colors"
                style={{
                  background: "rgba(255,255,255,0.1)",
                  backdropFilter: "blur(8px)",
                  color: "#ffffff",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "var(--radius-xs)",
                  fontFamily: "var(--font-sans)",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M6 1v10M1 6h10" />
                </svg>
                Add Snapshot
              </button>
              {student.states.length > 0 && (
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
                    fontSize: 14,
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
              )}
            </div>
          }
        />
      </div>

      {dialogOpen && (
        <AddSnapshotDialog
          studentId={student.id}
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          lastSnapshot={student.states[student.states.length - 1] ?? null}
          currentGrade={student.grade}
        />
      )}
    </>
  );
}
