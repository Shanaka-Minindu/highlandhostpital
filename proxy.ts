import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

const { auth } = NextAuth(authConfig);

// Explicitly export as a function named 'proxy'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const proxy = (req: any) => {
  return auth(req);
};

export const config = {
  matcher: ["/admin/:path*", "/user/:path*", "/appointments/:path*"],
};