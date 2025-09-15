import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { decrypt } from "@/lib/auth/auth"

const protectedRoutes = ["/dashboard", "/buyers"]
const authRoutes = ["/login", "/register"]

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route))
  const isAuthRoute = authRoutes.includes(path)

  const cookie = request.cookies.get("session")?.value
  const session = cookie ? await decrypt(cookie).catch(() => null) : null

  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL("/login", request.nextUrl))
  }

  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL("/dashboard", request.nextUrl))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
}
