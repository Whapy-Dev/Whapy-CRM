import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        set(name: string, value: string, options: any) {
          response.cookies.set({ name, value, ...options });
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        remove(name: string, options: any) {
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  // 1️⃣ Obtener usuario autenticado
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const publicPaths = ["/login"];
  const isPublicPath = publicPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  // 2️⃣ Si no hay usuario y la ruta no es pública → redirigir a login
  if (!user && !isPublicPath) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 3️⃣ Intentar obtener el rol desde la cookie
  let userRole = request.cookies.get("user_role")?.value;

  // Si no hay cookie, hacer UNA SOLA consulta a la base de datos
  if (!userRole && user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    userRole = profile?.role;

    // Guardar rol en cookie por 1 hora
    if (userRole) {
      response.cookies.set("user_role", userRole, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60, // 1 hora
      });
    }
  }

  // 🧠 A partir de acá ya tenés el userRole correcto aunque sea la primera vez

  // 4️⃣ Redirecciones iniciales (ruta raíz)
  if (request.nextUrl.pathname === "/") {
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // ✅ Usar userRole actualizado incluso si la cookie se acaba de crear
    if (userRole === "admin") {
      return NextResponse.redirect(new URL("/crm", request.url));
    }

    if (userRole === "cliente") {
      return NextResponse.redirect(new URL("/portal", request.url));
    }

    // Si no hay rol, manda a login
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 5️⃣ Si el usuario está logueado y entra a /login, redirigir según su rol
  if (isPublicPath && user && userRole) {
    if (userRole === "admin") {
      return NextResponse.redirect(new URL("/crm", request.url));
    } else if (userRole === "cliente") {
      return NextResponse.redirect(new URL("/portal", request.url));
    }
  }

  // 6️⃣ Proteger rutas por rol
  if (request.nextUrl.pathname.startsWith("/crm") && userRole !== "admin") {
    return NextResponse.redirect(new URL("/portal", request.url));
  }

  if (
    request.nextUrl.pathname.startsWith("/portal") &&
    userRole !== "cliente" &&
    userRole !== "admin"
  ) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return response;
}

// 7️⃣ Configuración del matcher
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
