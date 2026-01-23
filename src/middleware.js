// middleware.js
export const runtime = 'nodejs';
import { auth } from './app/auth';

import { NextResponse } from 'next/server';

export async function middleware(req) {
  const session = await auth();

  const path = req.nextUrl.pathname;

  console.log('🛡️ Middleware path:', path);
  console.log('🛡️ Session:', session ? 'EXISTS' : 'NULL');

  // Public routes
  if (
    path === '/' ||
    path.startsWith('/login') ||
    path.startsWith('/about') ||
    path.startsWith('/events') ||
    path.startsWith('/awards') ||
    path.startsWith('/blog') ||
    path.startsWith('/gallery') ||
    path.startsWith('/contact') ||
    path.startsWith('/nominate') ||
    path.startsWith('/api/auth')
  ) {
    return NextResponse.next();
  }

  // If session exists → allow
  if (session) {
    return NextResponse.next();
  }

  // Protected routes
  if (
    path.startsWith('/dashboard') ||
    path.startsWith('/admin') ||
    path.startsWith('/member') ||
    path.startsWith('/finance')
  ) {
    console.log('❌ No session, redirecting to login');
    return NextResponse.redirect(new URL('/admin-login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard', '/admin/:path*', '/member/:path*', '/finance/:path*'],
};
