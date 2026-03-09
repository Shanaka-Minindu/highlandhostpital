import React, { Suspense } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import SignUpFormClient from "./signUpForm";

export default async function SignUpPage(props: {
  searchParams: Promise<{ callbackUrl: string }>;
}) {
  const searchParamsObject = await props.searchParams;
  const callbackUrl = searchParamsObject.callbackUrl;

  const session = await auth();

  if (session) {
    return redirect(callbackUrl || "/");
  }

  return (
    <Card className="w-full max-w-[400px] shadow-lg border-slate-200">
      <CardHeader className="flex flex-col items-center gap-4 pb-2">
        <div className="relative h-16 w-16">
          <Image
            src="/images/Logo.svg"
            alt="Highland Medical Center Logo"
            fill
            className="object-contain"
            priority
          />
        </div>
        <CardTitle className="text-2xl font-bold text-text-title">
          Create Account
        </CardTitle>
        <p className="text-sm text-text-body">Join Highland Medical Center</p>
      </CardHeader>

      <CardContent>
        <Suspense
          fallback={
            <div className="h-80 animate-pulse bg-slate-100 rounded-md" />
          }
        >
          <SignUpFormClient />
        </Suspense>
      </CardContent>
    </Card>
  );
}
