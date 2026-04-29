import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const role = req.nextauth.token?.role as string | undefined;

    if (pathname.startsWith("/dashboard/recruiter") && role !== "RECRUITER" && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard/candidate", req.url));
    }

    if (pathname.startsWith("/dashboard/candidate") && role !== "CANDIDATE" && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard/recruiter", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*"],
};
