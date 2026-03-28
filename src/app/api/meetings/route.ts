import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function GET() {
  const userClient = await createClient();
  const {
    data: { user },
  } = await userClient.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();

    const { data: meetings, error } = await supabase
      .from("meetings")
      .select("*")
      .eq("created_by", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(meetings ?? []);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch meetings";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
