import { getStudentsWithLatestState, getDashboardStats } from "@/lib/data/queries";
import { DashboardContent } from "@/components/dashboard/dashboard-content";

export default async function DashboardPage() {
  const [students, stats] = await Promise.all([
    getStudentsWithLatestState(),
    getDashboardStats(),
  ]);

  return <DashboardContent students={students} stats={stats} />;
}
