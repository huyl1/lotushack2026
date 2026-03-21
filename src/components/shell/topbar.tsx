"use client";

import { usePathname } from "next/navigation";

function getBreadcrumbs(pathname: string): { label: string; muted: boolean }[] {
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return [{ label: "Dashboard", muted: false }];
  }

  const crumbs: { label: string; muted: boolean }[] = [];

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    const isLast = i === segments.length - 1;

    if (seg === "students") {
      crumbs.push({ label: "Students", muted: !isLast });
    } else if (seg === "new") {
      crumbs.push({ label: "New Student", muted: false });
    } else if (seg === "match") {
      crumbs.push({ label: "Matching", muted: false });
    } else if (seg === "present") {
      crumbs.push({ label: "Presentation", muted: false });
    } else {
      // UUID or dynamic segment — show as "Student"
      crumbs.push({ label: "Student", muted: !isLast });
    }
  }

  return crumbs;
}

export function TopBar() {
  const pathname = usePathname();
  const crumbs = getBreadcrumbs(pathname);

  return (
    <header
      className="flex items-center shrink-0 border-b"
      style={{
        height: "var(--topbar-h)",
        padding: "0 var(--space-md)",
        borderColor: "var(--color-border)",
        gap: "6px",
      }}
    >
      {crumbs.map((crumb, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && (
            <span
              className="text-caption"
              style={{ color: "var(--color-border)" }}
            >
              /
            </span>
          )}
          <span
            className="text-caption"
            style={{
              color: crumb.muted
                ? "var(--color-text-muted)"
                : "var(--color-text-primary)",
            }}
          >
            {crumb.label}
          </span>
        </span>
      ))}
    </header>
  );
}
