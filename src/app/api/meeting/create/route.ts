import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    title?: string;
    student_id?: string | null;
    language?: string;
    host_name?: string | null;
  } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    /* empty body */
  }

  const { data, error } = await supabase
    .from("meetings")
    .insert({
      title: body.title?.trim() || "Untitled meeting",
      student_id: body.student_id ?? null,
      language: body.language?.trim() || "english",
      host_name: body.host_name?.trim() || null,
      created_by: user.id,
      status: "waiting",
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const base =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    "http://localhost:3000";
  const join_url = `${base}/meeting/${data.id}`;

  return NextResponse.json({ id: data.id, join_url });
}
