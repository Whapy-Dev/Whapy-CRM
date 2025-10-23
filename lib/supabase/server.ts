import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Cliente de Supabase para uso en el servidor (Server Components, Server Actions, Route Handlers)
 *
 * Uso:
 * import { createClient } from '@/lib/supabase/server';
 * const supabase = await createClient();
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
          } catch (e) {
            // Esto puede fallar en algunos contextos de servidor
            // pero es seguro ignorarlo
          }
        },
      },
    }
  );
}

/**
 * Cliente de Supabase con Service Role (acceso total sin RLS)
 * SOLO usar en Server Actions o Route Handlers donde necesites bypass RLS
 */
export function createAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return [];
        },
        setAll() {},
      },
    }
  );
}
