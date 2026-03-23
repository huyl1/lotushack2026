import { getStudentsWithLatestState, getDashboardStats } from "@/lib/data/queries";
import { DashboardContent } from "@/components/dashboard/dashboard-content";

/** Needs Supabase env at runtime; avoid static prerender during `next build` when env may be absent. */
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [students, stats] = await Promise.all([
    getStudentsWithLatestState(),
    getDashboardStats(),
  ]);

  return <DashboardContent students={students} stats={stats} />;
}
