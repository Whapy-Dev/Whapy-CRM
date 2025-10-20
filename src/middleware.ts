import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Rutas públicas que no requieren autenticación
  const publicPaths = ['/portal/login']
  const isPublicPath = publicPaths.some(path => request.nextUrl.pathname.startsWith(path))

  // Si no hay usuario y está intentando acceder a rutas protegidas
  if (!user && !isPublicPath) {
    return NextResponse.redirect(new URL('/portal/login', request.url))
  }

  // Si hay usuario autenticado
  if (user) {
    // Obtener el rol del usuario
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const userRole = profile?.role

    // Si está en login y ya está autenticado, redirigir según rol
    if (isPublicPath) {
      if (userRole === 'admin') {
        return NextResponse.redirect(new URL('/crm', request.url))
      } else if (userRole === 'cliente') {
        return NextResponse.redirect(new URL('/portal', request.url))
      }
    }

    // Proteger ruta /crm solo para admins
    if (request.nextUrl.pathname.startsWith('/crm')) {
      if (userRole !== 'admin') {
        return NextResponse.redirect(new URL('/portal', request.url))
      }
    }

    // Proteger ruta /portal solo para clientes y admins
    if (request.nextUrl.pathname.startsWith('/portal') && !isPublicPath) {
      if (userRole !== 'cliente' && userRole !== 'admin') {
        return NextResponse.redirect(new URL('/portal/login', request.url))
      }
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}