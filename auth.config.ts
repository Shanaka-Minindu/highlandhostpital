import { NextAuthConfig } from "next-auth";
import { NextResponse } from "next/server";

const protectedPaths = ["/admin", "/user", "/appointments"];

const isProtectedPath = (path: string) => {
  return protectedPaths.some((protectedPath) => path.startsWith(protectedPath));
};

export const authConfig: NextAuthConfig = {
  providers: [], 
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isTryingToAccessProtectedPath = isProtectedPath(nextUrl.pathname);

      if (!isLoggedIn && isTryingToAccessProtectedPath) {
        const callbackUrl = nextUrl.pathname + nextUrl.search;
        const redirectUrl = new URL("/sign-in", nextUrl.origin);
        redirectUrl.searchParams.set("callbackUrl", encodeURI(callbackUrl));

        return NextResponse.redirect(redirectUrl);
      }

      return true;
    },
  },
};