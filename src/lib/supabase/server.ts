import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { Database } from "@/lib/supabase/database.types";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // setAll is called from Server Components where cookies are read-only.
            // This is expected — the middleware handles session refresh instead.
          }
        },
      },
    }
  );
}

/** Service-role client for server-side data access — bypasses RLS. Never use in client components. */
let _admin: ReturnType<typeof createSupabaseClient<Database>> | null = null;

export function createAdminClient() {
  if (!_admin) {
    _admin = createSupabaseClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { realtime: { params: { eventsPerSecond: 10 } } },
    );
  }
  return _admin;
}
