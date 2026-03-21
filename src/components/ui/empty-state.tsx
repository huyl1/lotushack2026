import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      {icon && (
        <div
          className="mb-4"
          style={{ color: "var(--color-text-muted)", opacity: 0.6 }}
        >
          {icon}
        </div>
      )}
      <h3 className="text-heading" style={{ color: "var(--color-text-primary)" }}>
        {title}
      </h3>
      {description && (
        <p
          className="text-body-sm mt-1.5"
          style={{
            color: "var(--color-text-secondary)",
            maxWidth: 320,
          }}
        >
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
