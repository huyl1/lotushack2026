"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useBreadcrumb } from "@/lib/context/breadcrumb";

function FormattedDate() {
  const [date, setDate] = useState("");

  useEffect(() => {
    setDate(
      new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    );
  }, []);

  return <>{date}</>;
}

function getBreadcrumbs(
  pathname: string,
  dynamicLabels: Record<string, string>
): { label: string; muted: boolean; href: string | null }[] {
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return [{ label: "Dashboard", muted: false, href: "/dashboard" }];
  }

  const crumbs: { label: string; muted: boolean; href: string | null }[] = [];

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i]!;
    const isLast = i === segments.length - 1;
    const pathUpTo = "/" + segments.slice(0, i + 1).join("/");

    if (seg === "dashboard") {
      crumbs.push({ label: "Dashboard", muted: false, href: "/dashboard" });
    } else if (seg === "students") {
      if (crumbs.length === 0) crumbs.push({ label: "Dashboard", muted: true, href: "/dashboard" });
    } else if (seg === "new") {
      crumbs.push({ label: "New Student", muted: false, href: isLast ? null : pathUpTo });
    } else if (seg === "match") {
      crumbs.push({ label: "Matching", muted: false, href: isLast ? null : pathUpTo });
    } else if (seg === "present") {
      crumbs.push({ label: "Presentation", muted: false, href: isLast ? null : pathUpTo });
    } else if (seg === "report") {
      crumbs.push({ label: "Report", muted: !isLast, href: isLast ? null : pathUpTo });
    } else {
      const label = dynamicLabels[seg] ?? seg.slice(0, 8) + "…";
      crumbs.push({ label, muted: !isLast, href: isLast ? null : `/students/${seg}` });
    }
  }

  return crumbs;
}

export function TopBar() {
  const pathname = usePathname();
  const { dynamicLabels } = useBreadcrumb();
  const crumbs = getBreadcrumbs(pathname, dynamicLabels);

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
            <span className="text-caption" style={{ color: "var(--color-border)" }}>
              /
            </span>
          )}
          {crumb.href ? (
            <Link
              href={crumb.href}
              className="text-caption transition-colors hover:opacity-80"
              style={{
                color: crumb.muted ? "var(--color-text-muted)" : "var(--color-text-primary)",
                textDecoration: "none",
              }}
            >
              {crumb.label}
            </Link>
          ) : (
            <span
              className="text-caption"
              style={{
                color: crumb.muted ? "var(--color-text-muted)" : "var(--color-text-primary)",
              }}
            >
              {crumb.label}
            </span>
          )}
        </span>
      ))}
      <span className="flex-1" />
      <span
        className="text-caption"
        style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-mono)" }}
      >
        <FormattedDate />
      </span>
    </header>
  );
}
