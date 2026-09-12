import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const ADMIN_ID = 'ARI9700'
const ADMIN_PASS = 'ARI#9700'

export function middleware(request: NextRequest) {
  const url = request.nextUrl.pathname

  // Sirf /admin ke liye check
  if (url.startsWith('/admin')) {
    const authHeader = request.headers.get('authorization')

    if (authHeader) {
      const authValue = authHeader.split(' ')[1]
      const [user, pwd] = atob(authValue).split(':')

      if (user === ADMIN_ID && pwd === ADMIN_PASS) {
        return NextResponse.next() // sahi hai to andar jane do
      }
    }

    // galat ya bina password ke aaya to browser password box dikhayega
    return new NextResponse('Authentication required - Admin Area', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Arihant Anchal Admin"',
      },
    })
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'], // /admin aur uske andar ke sab page lock
}
