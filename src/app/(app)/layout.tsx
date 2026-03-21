import { Sidebar } from "@/components/shell/sidebar";
import { TopBar } from "@/components/shell/topbar";
import { BreadcrumbProvider } from "@/lib/context/breadcrumb";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <BreadcrumbProvider>
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar />
        <main
          className="flex-1 overflow-y-auto"
          style={{ scrollbarGutter: "stable" }}
        >
          <div className="animate-fade-up">{children}</div>
        </main>
      </div>
    </div>
    </BreadcrumbProvider>
  );
}
