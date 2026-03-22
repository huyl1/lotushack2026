"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signout } from "@/app/(auth)/login/actions";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1.5" y="1.5" width="5" height="5" rx="1" />
        <rect x="9.5" y="1.5" width="5" height="5" rx="1" />
        <rect x="1.5" y="9.5" width="5" height="5" rx="1" />
        <rect x="9.5" y="9.5" width="5" height="5" rx="1" />
      </svg>
    ),
  },
  {
    label: "Meetings",
    href: "/meetings",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="23" />
        <line x1="8" y1="23" x2="16" y2="23" />
      </svg>
    ),
  },
];

const plannedItems = [
  {
    label: "Analytics",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="1.5,12.5 5.5,7.5 8.5,10 12,4.5 14.5,7" />
        <path d="M1.5 14.5h13" />
      </svg>
    ),
  },
  {
    label: "Documents",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.5 1.5H4a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V5.5L9.5 1.5z" />
        <polyline points="9.5,1.5 9.5,5.5 13.5,5.5" />
        <line x1="5" y1="9" x2="11" y2="9" />
        <line x1="5" y1="11.5" x2="8.5" y2="11.5" />
      </svg>
    ),
  },
  {
    label: "Calendar",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1.5" y="3" width="13" height="11.5" rx="1" />
        <line x1="1.5" y1="7" x2="14.5" y2="7" />
        <line x1="5" y1="1.5" x2="5" y2="4.5" />
        <line x1="11" y1="1.5" x2="11" y2="4.5" />
      </svg>
    ),
  },
  {
    label: "Messages",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 9.5a2 2 0 0 1-2 2H5l-3 2.5V3.5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v6z" />
      </svg>
    ),
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="flex flex-col shrink-0 border-r"
      style={{
        width: "var(--sidebar-w)",
        background: "var(--color-bg-surface)",
        borderColor: "var(--color-border)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2.5 border-b shrink-0"
        style={{
          height: "var(--topbar-h)",
          padding: "0 var(--space-md)",
          borderColor: "var(--color-border)",
        }}
      >
        <div
          className="w-2 h-2 rounded-full"
          style={{ background: "var(--color-tier-match)" }}
        />
        <span className="text-heading tracking-tight">Edify</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : item.href === "/meetings"
                ? pathname.startsWith("/meetings")
                : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 mx-2 px-3 py-2 rounded-sm text-body-sm transition-colors"
              style={{
                color: isActive
                  ? "var(--color-text-primary)"
                  : "var(--color-text-secondary)",
                background: isActive
                  ? "var(--color-hover-bg-strong)"
                  : "transparent",
                borderRadius: "var(--radius-xs)",
                fontWeight: isActive ? 500 : 400,
              }}
            >
              <span className="shrink-0" style={{ opacity: isActive ? 1 : 0.6 }}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}

        {/* Planned features */}
        <div
          className="mx-2 mt-3 mb-1 px-3"
          style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", color: "var(--color-text-muted)", textTransform: "uppercase" }}
        >
          Coming soon
        </div>
        {plannedItems.map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-3 mx-2 px-3 py-2"
            style={{
              color: "var(--color-text-muted)",
              borderRadius: "var(--radius-xs)",
              opacity: 0.45,
              cursor: "default",
              fontSize: 14,
            }}
          >
            <span className="shrink-0">{item.icon}</span>
            {item.label}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div
        className="px-4 py-3 border-t"
        style={{ borderColor: "var(--color-border)" }}
      >
        <button
          onClick={() => signout()}
          className="text-caption cursor-pointer transition-colors hover:opacity-80"
          style={{ color: "var(--color-text-muted)" }}
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
