import { NextResponse, NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;
  if (pathname.startsWith("/admin")) {
    const cookieCode = req.cookies.get("admin_code")?.value;
    const code = searchParams.get("code") || cookieCode;
    if (code && code === process.env.ADMIN_ACCESS_CODE) {
      // Set cookie if coming via query param
      if (!cookieCode && searchParams.get("code")) {
        const res = NextResponse.next();
        res.cookies.set("admin_code", code, { httpOnly: true, maxAge: 60 * 60 * 6 });
        return res;
      }
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/", req.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };