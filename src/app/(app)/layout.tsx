import { Sidebar } from "@/components/shell/sidebar";
import { TopBar } from "@/components/shell/topbar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar />
        <main
          className="flex-1 overflow-y-auto"
          style={{
            padding: "var(--space-md)",
            scrollbarGutter: "stable",
          }}
        >
          <div className="animate-fade-up">{children}</div>
        </main>
      </div>
    </div>
  );
}
