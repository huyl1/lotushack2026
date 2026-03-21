"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signout } from "@/app/(auth)/login/actions";

const navItems = [
  {
    label: "Dashboard",
    href: "/",
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
    label: "New Student",
    href: "/students/new",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="8" cy="5" r="3" />
        <path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6" />
        <path d="M12 3v4M10 5h4" />
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
            item.href === "/"
              ? pathname === "/"
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
              <span
                className="shrink-0"
                style={{
                  opacity: isActive ? 1 : 0.6,
                }}
              >
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
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
