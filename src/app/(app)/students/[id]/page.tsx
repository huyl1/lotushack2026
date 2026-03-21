import { notFound } from "next/navigation";
import { getStudentDetail } from "@/lib/data/mock";
import { StudentDetailView } from "@/components/student/student-detail";

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const student = getStudentDetail(id);

  if (!student) {
    notFound();
  }

  return <StudentDetailView student={student} />;
}
